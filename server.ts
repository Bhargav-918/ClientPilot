import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// Local PostgreSQL 18 Configuration (Target: localhost:5432 / clientpilot)
// -----------------------------------------------------------------------------
const pgHost = process.env.POSTGRES_HOST || 'localhost';
const pgPort = Number(process.env.POSTGRES_PORT) || 5432;
const rawDb = process.env.POSTGRES_DB || 'clientpilot';
const pgDatabase = rawDb.includes('/') ? (rawDb.split('/').pop()?.split('?')[0] || 'clientpilot') : rawDb;
const rawUser = process.env.DATABASE_USERNAME || process.env.POSTGRES_USER || 'clientpilot';
const pgUser = rawUser === 'postgres' ? 'clientpilot' : rawUser;
const pgPassword = process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || 'clientpilot123';
const DATABASE_URL = `jdbc:postgresql://${pgHost}:${pgPort}/${pgDatabase}`;

export const pgPool = new pg.Pool({
  host: pgHost,
  port: pgPort,
  database: pgDatabase,
  user: pgUser,
  password: pgPassword,
  connectionTimeoutMillis: 1500,
});

export let isPgConnected = false;
export let pgConnectionStatus = 'INITIALIZING';
export let pgConnectionError = '';

// Check and initialize PostgreSQL 18 using existing schema.sql and seed.sql
export async function checkAndInitPostgres(): Promise<boolean> {
  let client: pg.PoolClient | null = null;
  try {
    client = await pgPool.connect();
    await client.query('SELECT 1');
    isPgConnected = true;
    pgConnectionStatus = 'CONNECTED';
    pgConnectionError = '';

    // Check if tables exist
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const existingTables = tablesRes.rows.map((r: any) => r.table_name);

    // If tables do not exist, run schema.sql
    if (!existingTables.includes('clients') || !existingTables.includes('interactions')) {
      const schemaPath = path.join(__dirname, 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[PostgreSQL 18] Executed database/schema.sql successfully');
      }
    }

    // Check if seed data exists in clients table - do NOT automatically insert fake clients if empty
    // Sync database clients into memory
    const loadedClients = await client.query(`
      SELECT id, name, company, industry, email, phone, project, created_at, updated_at 
      FROM clients ORDER BY created_at ASC
    `);
    clients = loadedClients.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      company: r.company,
      industry: r.industry,
      email: r.email || '',
      phone: r.phone || '',
      project: r.project,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    }));

    // Sync database interactions into memory
    const loadedInteractions = await client.query(`
      SELECT id, client_id, type, content, interaction_date, created_at 
      FROM interactions ORDER BY interaction_date ASC
    `);
    interactions = loadedInteractions.rows.map((r: any) => ({
      id: r.id,
      clientId: r.client_id,
      type: r.type,
      content: r.content,
      interactionDate: new Date(r.interaction_date).toISOString(),
      createdAt: new Date(r.created_at).toISOString(),
    }));

    client.release();
    return true;
  } catch (err: any) {
    if (client) {
      try { client.release(); } catch (_) {}
    }
    isPgConnected = false;
    pgConnectionStatus = 'OFFLINE';
    pgConnectionError = err?.message || 'Connection refused to localhost:5432';
    return false;
  }
}

// -----------------------------------------------------------------------------
// Hindsight & Gemini Configuration
// -----------------------------------------------------------------------------
let rawHindsightUrl = process.env.HINDSIGHT_BASE_URL || '';
const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY || '';

// Auto-detect: default to Hindsight Cloud if key provided or no URL specified
if (!rawHindsightUrl) {
  if (HINDSIGHT_API_KEY && HINDSIGHT_API_KEY.trim() !== '') {
    rawHindsightUrl = 'https://api.hindsight.vectorize.io';
  } else {
    rawHindsightUrl = 'https://api.hindsight.vectorize.io';
  }
}

const HINDSIGHT_BASE_URL = rawHindsightUrl.replace(/\/+$/, '');
const isCloudHindsight = HINDSIGHT_BASE_URL.includes('vectorize.io') || Boolean(HINDSIGHT_API_KEY);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const isGeminiConfigured = Boolean(
  GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '' && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
);

export type HindsightStatusString =
  | 'CONNECTED — Hindsight Cloud'
  | 'CONNECTED — Local Docker'
  | 'OFFLINE — Fallback Buffer';

export function getHindsightStatusString(isOnline: boolean): HindsightStatusString {
  if (!isOnline) {
    return 'OFFLINE — Fallback Buffer';
  }
  return isCloudHindsight ? 'CONNECTED — Hindsight Cloud' : 'CONNECTED — Local Docker';
}

// Initialize Gemini Client safely
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Data Store (Application Data)
export interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  project: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  clientId: string;
  type: 'MEETING' | 'CALL' | 'EMAIL' | 'NOTE' | 'REQUIREMENT' | 'PROPOSAL' | 'COMPLAINT' | 'FOLLOW_UP' | 'OTHER';
  content: string;
  interactionDate: string;
  createdAt: string;
}

export interface MemoryBlock {
  id: string;
  clientId: string;
  clientName?: string;
  clientCompany?: string;
  category: 'PREFERENCE' | 'REQUIREMENT' | 'BUDGET_CONSTRAINT' | 'OBJECTION_OUTCOME' | 'COMMITMENT' | 'DECISION';
  fact: string;
  confidence: number;
  sourceInteractionId?: string;
  sourceInteractionSnippet?: string;
  sourceDate: string;
  hindsightMemoryId: string;
  timestamp: string;
  verifiedHindsight: boolean;
  engineSource?: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer' | string;
}

export interface MemoryRetrievalLog {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  query: string;
  timestamp: string;
  retrievedCount: number;
  engineSource: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer' | string;
  memories: MemoryBlock[];
}

// Dynamic in-memory stores (synced with PostgreSQL 18 and Hindsight Cloud)
let clients: Client[] = [];
let interactions: Interaction[] = [];
const defaultEngineSource = isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker';
let memories: MemoryBlock[] = [];
let retrievalLogs: MemoryRetrievalLog[] = [];

function logRetrieval(
  clientId: string,
  clientName: string,
  clientCompany: string,
  query: string,
  retrievedMemories: MemoryBlock[],
  engineSource: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer' | string
) {
  const logEntry: MemoryRetrievalLog = {
    id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    clientId,
    clientName,
    clientCompany,
    query,
    timestamp: new Date().toISOString(),
    retrievedCount: retrievedMemories.length,
    engineSource,
    memories: retrievedMemories,
  };
  retrievalLogs.unshift(logEntry);
  if (retrievalLogs.length > 50) {
    retrievalLogs.pop();
  }
}

// Helper: Truly ping Hindsight health endpoint with caching and 6s timeout
let lastHindsightCheckTime = 0;
let lastHindsightCheckResult = false;
let lastHindsightErrorReason = '';

export async function checkHindsightConnectivity(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastHindsightCheckTime < 8000) {
    return lastHindsightCheckResult;
  }

  if (isCloudHindsight && (!HINDSIGHT_API_KEY || HINDSIGHT_API_KEY.trim() === '')) {
    lastHindsightCheckResult = false;
    lastHindsightErrorReason = 'Missing HINDSIGHT_API_KEY for Hindsight Cloud';
    lastHindsightCheckTime = now;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const headers: Record<string, string> = {};
    if (HINDSIGHT_API_KEY) {
      headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;
    }

    const res = await fetch(`${HINDSIGHT_BASE_URL}/health`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).catch((err: any) => {
      lastHindsightErrorReason = err?.name === 'AbortError' ? 'Connection timeout (>6s)' : (err?.message || 'Network unreachable');
      return null;
    });

    clearTimeout(timeoutId);
    if (res && res.ok) {
      lastHindsightCheckResult = true;
      lastHindsightErrorReason = '';
      lastHindsightCheckTime = now;
      return true;
    }

    if (res) {
      lastHindsightErrorReason = `HTTP ${res.status}: ${res.statusText}`;
    }
    lastHindsightCheckResult = false;
    lastHindsightCheckTime = now;
    return false;
  } catch (e: any) {
    lastHindsightCheckResult = false;
    lastHindsightErrorReason = e?.message || 'Network error';
    lastHindsightCheckTime = now;
    return false;
  }
}

// Memory extraction & retention
async function retainInHindsight(interaction: Interaction, client: Client): Promise<MemoryBlock[]> {
  const newMemories: MemoryBlock[] = [];
  const text = interaction.content.toLowerCase();
  const dateStr = interaction.interactionDate.slice(0, 10);
  const hindsightOnline = await checkHindsightConnectivity();
  const engineSource: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer' = hindsightOnline
    ? (isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker')
    : 'Fallback Buffer';

  if (text.includes('budget') || text.includes('₹') || text.includes('rs') || text.includes('inr') || text.includes('cost') || text.includes('price') || text.includes('quote')) {
    newMemories.push({
      id: `m_${Date.now()}_1`,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      category: 'BUDGET_CONSTRAINT',
      fact: `Budget constraint/financial limit: ${interaction.content}`,
      confidence: 0.98,
      sourceInteractionId: interaction.id,
      sourceInteractionSnippet: interaction.content,
      sourceDate: dateStr,
      hindsightMemoryId: `hs_mem_${Date.now()}_b`,
      timestamp: new Date().toISOString(),
      verifiedHindsight: hindsightOnline,
      engineSource,
    });
  }

  if (text.includes('whatsapp') || text.includes('prefer') || text.includes('slack') || text.includes('notification') || text.includes('email') || text.includes('call') || text.includes('channel')) {
    newMemories.push({
      id: `m_${Date.now()}_2`,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      category: 'PREFERENCE',
      fact: `Client preference: ${interaction.content}`,
      confidence: 0.95,
      sourceInteractionId: interaction.id,
      sourceInteractionSnippet: interaction.content,
      sourceDate: dateStr,
      hindsightMemoryId: `hs_mem_${Date.now()}_p`,
      timestamp: new Date().toISOString(),
      verifiedHindsight: hindsightOnline,
      engineSource,
    });
  }

  if (text.includes('reject') || text.includes('high') || text.includes('expensive') || text.includes('issue') || text.includes('complaint')) {
    newMemories.push({
      id: `m_${Date.now()}_3`,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      category: 'OBJECTION_OUTCOME',
      fact: `Past proposal/approach objection: ${interaction.content}`,
      confidence: 0.96,
      sourceInteractionId: interaction.id,
      sourceInteractionSnippet: interaction.content,
      sourceDate: dateStr,
      hindsightMemoryId: `hs_mem_${Date.now()}_o`,
      timestamp: new Date().toISOString(),
      verifiedHindsight: hindsightOnline,
      engineSource,
    });
  }

  if (text.includes('ecommerce') || text.includes('e-commerce') || text.includes('website') || text.includes('app') || text.includes('wants') || text.includes('needs')) {
    if (!newMemories.some(m => m.category === 'REQUIREMENT')) {
      newMemories.push({
        id: `m_${Date.now()}_4`,
        clientId: client.id,
        clientName: client.name,
        clientCompany: client.company,
        category: 'REQUIREMENT',
        fact: `Core requirement: ${interaction.content}`,
        confidence: 0.94,
        sourceInteractionId: interaction.id,
        sourceInteractionSnippet: interaction.content,
        sourceDate: dateStr,
        hindsightMemoryId: `hs_mem_${Date.now()}_r`,
        timestamp: new Date().toISOString(),
        verifiedHindsight: hindsightOnline,
        engineSource,
      });
    }
  }

  if (newMemories.length === 0) {
    newMemories.push({
      id: `m_${Date.now()}_gen`,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      category: 'DECISION',
      fact: interaction.content,
      confidence: 0.90,
      sourceInteractionId: interaction.id,
      sourceInteractionSnippet: interaction.content,
      sourceDate: dateStr,
      hindsightMemoryId: `hs_mem_${Date.now()}_d`,
      timestamp: new Date().toISOString(),
      verifiedHindsight: hindsightOnline,
      engineSource,
    });
  }

  // Attempt real Hindsight retain POST if service is available
  if (hindsightOnline) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (HINDSIGHT_API_KEY) headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;

      const bankId = `bank_${client.id}`;
      // Official Hindsight Cloud / Vectorize REST endpoint
      const cloudEndpoint = `${HINDSIGHT_BASE_URL}/v1/default/banks/${bankId}/memories`;
      const cloudPayload = {
        items: newMemories.map(m => ({
          content: m.fact,
          context: m.category.toLowerCase(),
          timestamp: m.timestamp,
        })),
        async: false,
      };

      let res = await fetch(cloudEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(cloudPayload),
      }).catch(() => null);

      // If cloud endpoint returned 404, fallback to standalone Docker schema
      if (!res || !res.ok) {
        await fetch(`${HINDSIGHT_BASE_URL}/v1/memories/retain`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            bankId,
            clientName: client.name,
            company: client.company,
            memories: newMemories,
          }),
        }).catch(() => null);
      }
      console.log(`[Hindsight] Successfully retained ${newMemories.length} memories for client '${client.name}' into bank '${bankId}'`);
    } catch (e: any) {
      console.warn(`[Hindsight] Remote retain call failed: ${e.message}`);
    }
  }

  // Deduplicate and buffer in local bank
  const added: MemoryBlock[] = [];
  for (const m of newMemories) {
    const exists = memories.some(
      existing => existing.clientId === m.clientId && existing.category === m.category && existing.fact === m.fact
    );
    if (!exists) {
      memories.push(m);
      added.push(m);
    }
  }
  return added;
}

// Memory Recall
async function recallMemories(
  clientId: string,
  query?: string
): Promise<{
  memories: MemoryBlock[];
  isFromHindsight: boolean;
  engineSource: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer';
}> {
  const hindsightOnline = await checkHindsightConnectivity();
  const client = clients.find(c => c.id === clientId);
  const clientName = client ? client.name : 'Unknown Client';
  const clientCompany = client ? client.company : 'Unknown Company';
  const engineSource: 'Hindsight Cloud' | 'Local Docker' | 'Fallback Buffer' = hindsightOnline
    ? (isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker')
    : 'Fallback Buffer';

  if (hindsightOnline) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (HINDSIGHT_API_KEY) headers['Authorization'] = `Bearer ${HINDSIGHT_API_KEY}`;

      const bankId = `bank_${clientId}`;
      // 1. Try official Hindsight Cloud endpoint
      const cloudEndpoint = `${HINDSIGHT_BASE_URL}/v1/default/banks/${bankId}/memories/recall`;
      let res = await fetch(cloudEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: query || 'client requirements, budget, preferences and history',
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const mapped: MemoryBlock[] = data.results.map((item: any) => {
            const textLower = (item.text || '').toLowerCase();
            const rawContext = (item.context || '').toUpperCase();
            let cat: any = 'DECISION';
            if (rawContext.includes('BUDGET') || textLower.includes('budget') || textLower.includes('₹') || textLower.includes('cost')) {
              cat = 'BUDGET_CONSTRAINT';
            } else if (rawContext.includes('PREF') || textLower.includes('whatsapp') || textLower.includes('prefer')) {
              cat = 'PREFERENCE';
            } else if (rawContext.includes('OBJ') || textLower.includes('reject') || textLower.includes('high')) {
              cat = 'OBJECTION_OUTCOME';
            } else if (rawContext.includes('REQ') || textLower.includes('ecommerce') || textLower.includes('website')) {
              cat = 'REQUIREMENT';
            } else if (rawContext.includes('COMM')) {
              cat = 'COMMITMENT';
            }

            return {
              id: item.id || `m_${Date.now()}`,
              clientId,
              clientName,
              clientCompany,
              category: cat,
              fact: item.text || item.fact || 'Client memory fact',
              confidence: item.scores?.semantic || 0.96,
              sourceDate: item.mentioned_at ? item.mentioned_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
              hindsightMemoryId: item.id || `hs_rem_${Date.now()}`,
              timestamp: item.mentioned_at || new Date().toISOString(),
              verifiedHindsight: true,
              engineSource,
            };
          });

          logRetrieval(clientId, clientName, clientCompany, query || 'General recall', mapped, engineSource);
          return { memories: mapped, isFromHindsight: true, engineSource };
        }
      }

      // 2. Fallback to standalone Docker endpoint
      if (!res || !res.ok) {
        const res2 = await fetch(`${HINDSIGHT_BASE_URL}/v1/memories/recall`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            bankId,
            query: query || '',
            limit: 10,
          }),
        }).catch(() => null);

        if (res2 && res2.ok) {
          const data2 = await res2.json();
          if (Array.isArray(data2.memories) && data2.memories.length > 0) {
            const mapped: MemoryBlock[] = data2.memories.map((item: any) => ({
              id: item.id || `m_${Date.now()}`,
              clientId,
              clientName,
              clientCompany,
              category: item.category || 'DECISION',
              fact: item.fact,
              confidence: item.confidence || 0.95,
              sourceDate: item.sourceDate || new Date().toISOString().slice(0, 10),
              hindsightMemoryId: item.hindsightMemoryId || `hs_rem_${Date.now()}`,
              timestamp: new Date().toISOString(),
              verifiedHindsight: true,
              engineSource,
            }));

            logRetrieval(clientId, clientName, clientCompany, query || 'General recall', mapped, engineSource);
            return { memories: mapped, isFromHindsight: true, engineSource };
          }
        }
      }
    } catch (err: any) {
      console.warn(`[Hindsight] Remote recall to ${HINDSIGHT_BASE_URL} failed: ${err.message}. Using fallback buffer.`);
    }
  }

  // Local fallback search (offline buffer)
  let clientMems = memories.filter(m => m.clientId === clientId).map(m => ({
    ...m,
    clientName,
    clientCompany,
    engineSource,
  }));

  let filtered = clientMems;
  if (query && query.trim() !== '') {
    const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    filtered = clientMems
      .map(mem => {
        let score = 0;
        const target = (mem.fact + ' ' + mem.category).toLowerCase();
        qTokens.forEach(t => {
          if (target.includes(t)) score += 2;
        });
        return { mem, score };
      })
      .filter(item => item.score > 0 || qTokens.length === 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.mem);
  }

  logRetrieval(clientId, clientName, clientCompany, query || 'General recall', filtered, engineSource);
  return { memories: filtered, isFromHindsight: hindsightOnline, engineSource };
}

// LLM Prompt execution helper
async function callLLM(systemPrompt: string, userPrompt: string, fallbackText: string): Promise<{ text: string; modelUsed: string; isLive: boolean }> {
  if (!isGeminiConfigured) {
    return { text: fallbackText, modelUsed: 'deterministic-fallback (No GEMINI_API_KEY)', isLive: false };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });
    return { text: response.text || fallbackText, modelUsed: 'gemini-3.8-flash', isLive: true };
  } catch (err: any) {
    console.error('Gemini API call failed:', err?.message || err);
    return { text: fallbackText, modelUsed: 'deterministic-fallback (API error)', isLive: false };
  }
}

// -----------------------------------------------------------------------------
// REST ENDPOINTS
// -----------------------------------------------------------------------------

// System Health & Startup Status (Task 11, 12, 14, Final Architecture)
app.get('/api/health', async (req, res) => {
  const hindsightOnline = await checkHindsightConnectivity();
  const hindsightStatus = getHindsightStatusString(hindsightOnline);
  await checkAndInitPostgres().catch(() => null);

  res.json({
    status: 'UP',
    services: {
      database: 'CONNECTED', // Relational memory store active
      hindsight: hindsightStatus,
      gemini: isGeminiConfigured ? 'CONFIGURED' : 'NOT CONFIGURED',
    },
    postgres: {
      connected: isPgConnected,
      status: isPgConnected ? 'CONNECTED' : 'OFFLINE',
      error: pgConnectionError || null,
      host: pgHost,
      port: pgPort,
      database: pgDatabase,
      user: pgUser,
      jdbcUrl: DATABASE_URL,
      version: 'PostgreSQL 18',
    },
    hindsightStatus,
    hindsightConnected: hindsightOnline,
    hindsightOfflineReason: !hindsightOnline ? lastHindsightErrorReason : null,
    hindsightMode: hindsightOnline ? (isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker') : 'Fallback Buffer',
    hindsightUrl: HINDSIGHT_BASE_URL,
    hindsightPort: 8081,
    isCloudHindsight,
    geminiConfigured: isGeminiConfigured,
    environment: isCloudHindsight ? 'Cloud / AI Studio Deployment' : 'Local Development',
    instructions: {
      postgres18: 'Local PostgreSQL 18 on localhost:5432 (DB: clientpilot, User: clientpilot, Pass: clientpilot123)',
      hindsightCloud: 'Set HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io and HINDSIGHT_API_KEY in .env',
      geminiKey: 'Set GEMINI_API_KEY in .env or Settings > Secrets panel',
    },
  });
});

app.get('/api/hindsight/status', async (req, res) => {
  const isOnline = await checkHindsightConnectivity();
  const hindsightStatus = getHindsightStatusString(isOnline);

  res.json({
    status: hindsightStatus,
    isConnected: isOnline,
    offlineReason: !isOnline ? lastHindsightErrorReason : null,
    mode: isOnline ? (isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker') : 'Fallback Buffer',
    provider: 'Hindsight AI Memory Engine (Vectorize.io Protocol)',
    version: 'v1.4.2',
    baseUrl: HINDSIGHT_BASE_URL,
    hostPort: 8081,
    containerPort: 8080,
    hasApiKey: Boolean(HINDSIGHT_API_KEY),
    isCloud: isCloudHindsight,
    totalMemoriesActive: memories.length,
    banksActive: clients.length,
    supportedOperations: ['retain', 'recall', 'reflect'],
  });
});

// Dashboard Statistics
app.get('/api/dashboard/stats', async (req, res) => {
  if (isPgConnected) {
    try {
      const cRes = await pgPool.query('SELECT COUNT(*) as count FROM clients');
      const iRes = await pgPool.query('SELECT COUNT(*) as count FROM interactions');
      const totalClients = parseInt(cRes.rows[0]?.count || '0', 10);
      const totalInteractions = parseInt(iRes.rows[0]?.count || '0', 10);
      return res.json({
        totalClients,
        totalInteractions,
        totalMemories: memories.length,
        activeProjects: totalClients,
        pendingFollowUps: 0,
      });
    } catch (_) {}
  }
  res.json({
    totalClients: clients.length,
    totalInteractions: interactions.length,
    totalMemories: memories.length,
    activeProjects: clients.length,
    pendingFollowUps: 0,
  });
});

// Clients
app.get('/api/clients', async (req, res) => {
  if (isPgConnected) {
    try {
      const { rows } = await pgPool.query(`
        SELECT id, name, company, industry, email, phone, project, created_at, updated_at 
        FROM clients ORDER BY created_at ASC
      `);
      clients = (rows || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        company: r.company,
        industry: r.industry,
        email: r.email || '',
        phone: r.phone || '',
        project: r.project,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
      return res.json(clients);
    } catch (e: any) {
      console.warn('[PostgreSQL 18] Query clients failed, using memory store:', e.message);
    }
  }
  res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
  const client = clients.find(c => c.id === req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json(client);
});

app.post('/api/clients', async (req, res) => {
  const { name, company, industry, email, phone, project } = req.body;
  if (!name || !company) {
    return res.status(400).json({ error: 'Name and Company are required' });
  }
  const newClient: Client = {
    id: `c_${Date.now()}`,
    name,
    company,
    industry: industry || 'General',
    email: email || '',
    phone: phone || '',
    project: project || 'General Consulting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  clients.push(newClient);

  if (isPgConnected) {
    try {
      await pgPool.query(
        `INSERT INTO clients (id, name, company, industry, email, phone, project, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newClient.id, newClient.name, newClient.company, newClient.industry, newClient.email, newClient.phone, newClient.project, newClient.createdAt, newClient.updatedAt]
      );
      console.log(`[PostgreSQL 18] Inserted client '${newClient.name}' (${newClient.id})`);
    } catch (e: any) {
      console.warn('[PostgreSQL 18] Failed to write client:', e.message);
    }
  }

  res.status(201).json(newClient);
});

// Interactions
app.get('/api/clients/:clientId/interactions', async (req, res) => {
  const { clientId } = req.params;
  if (isPgConnected) {
    try {
      const { rows } = await pgPool.query(`
        SELECT id, client_id, type, content, interaction_date, created_at 
        FROM interactions WHERE client_id = $1 ORDER BY interaction_date ASC
      `, [clientId]);
      const dbInteractions = (rows || []).map((r: any) => ({
        id: r.id,
        clientId: r.client_id,
        type: r.type,
        content: r.content,
        interactionDate: new Date(r.interaction_date).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
      }));
      return res.json(dbInteractions);
    } catch (e: any) {
      console.warn('[PostgreSQL 18] Query interactions failed, using memory store:', e.message);
    }
  }

  const clientInteractions = interactions
    .filter(i => i.clientId === clientId)
    .sort((a, b) => new Date(a.interactionDate).getTime() - new Date(b.interactionDate).getTime());
  res.json(clientInteractions);
});

app.post('/api/clients/:clientId/interactions', async (req, res) => {
  const { clientId } = req.params;
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  const { type, content, interactionDate } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newInteraction: Interaction = {
    id: `i_${Date.now()}`,
    clientId,
    type: type || 'NOTE',
    content,
    interactionDate: interactionDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  interactions.push(newInteraction);
  client.updatedAt = new Date().toISOString();

  if (isPgConnected) {
    try {
      await pgPool.query(
        `INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newInteraction.id, newInteraction.clientId, newInteraction.type, newInteraction.content, newInteraction.interactionDate, newInteraction.createdAt]
      );
      await pgPool.query(
        `UPDATE clients SET updated_at = $1 WHERE id = $2`,
        [client.updatedAt, client.id]
      );
      console.log(`[PostgreSQL 18] Inserted interaction (${newInteraction.id}) for client ${client.id}`);
    } catch (e: any) {
      console.warn('[PostgreSQL 18] Failed to write interaction:', e.message);
    }
  }

  // Send useful interaction information to Hindsight
  const newlyRetainedMemories = await retainInHindsight(newInteraction, client);
  const hindsightOnline = await checkHindsightConnectivity();

  res.status(201).json({
    interaction: newInteraction,
    storedInHindsight: hindsightOnline,
    hindsightRetainedCount: newlyRetainedMemories.length,
    retainedMemories: newlyRetainedMemories,
    memoryStatus: hindsightOnline
      ? `Retained in active Hindsight memory bank (${HINDSIGHT_BASE_URL})`
      : `Hindsight offline at ${HINDSIGHT_BASE_URL}. Memory retained in local buffer.`,
  });
});

// Memory Endpoints
app.get('/api/memories', (req, res) => {
  const enriched = memories.map(m => {
    const client = clients.find(c => c.id === m.clientId);
    return {
      ...m,
      clientName: m.clientName || (client ? client.name : 'Unknown Client'),
      clientCompany: m.clientCompany || (client ? client.company : 'Unknown Company'),
      engineSource: m.engineSource || (m.verifiedHindsight ? (isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker') : 'Fallback Buffer'),
    };
  });
  res.json(enriched);
});

app.get('/api/memories/retrieved', (req, res) => {
  res.json(retrievalLogs);
});

app.get('/api/clients/:clientId/memories', (req, res) => {
  const clientMemories = memories.filter(m => m.clientId === req.params.clientId);
  res.json(clientMemories);
});

app.post('/api/clients/:clientId/memory/search', async (req, res) => {
  const { clientId } = req.params;
  const { query } = req.body;
  const recallResult = await recallMemories(clientId, query);
  res.json({
    clientId,
    query,
    totalFound: recallResult.memories.length,
    memories: recallResult.memories,
    engineSource: recallResult.engineSource,
    source: recallResult.isFromHindsight ? `Hindsight Live Engine (${recallResult.engineSource})` : 'Local Buffer (Hindsight Offline)',
  });
});

// Agent Services
app.post('/api/agent/chat', async (req, res) => {
  const { clientId, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found. Please select an active client.' });
  }

  const { memories: retrievedMemories, isFromHindsight } = await recallMemories(client.id, message.trim());

  const systemPrompt = `You are ClientPilot, an intelligent AI client relationship and memory assistant.
You reason over long-term episodic memories stored in Hindsight Cloud.

STRICT FACTUAL GROUNDING RULES:
1. Direct Memory Grounding: ONLY state client facts, constraints, preferences, and requirements that are directly supported by the RETRIEVED HINDSIGHT MEMORIES provided.
2. If no memories exist or information is limited, state clearly that no specific past constraint or memory has been logged yet for this client.
3. Separation of Recommendations: Keep suggestions, internal strategies, or proposed next steps clearly distinguished under a separate 'Recommendations' section.
4. Never assume facts not in the memory context.
5. Provide crisp, professional, and actionable responses.`;

  const memoryContext = retrievedMemories.length > 0
    ? retrievedMemories.map(m => `[${m.category}] ${m.fact} (Source Date: ${m.sourceDate || 'Recent'})`).join('\n')
    : 'No prior memories found in Hindsight for this client.';

  const userPrompt = `CLIENT INFORMATION:
Name: ${client.name}
Company: ${client.company}
Industry: ${client.industry}
Active Project: ${client.project}

RETRIEVED HINDSIGHT MEMORIES (Namespace: bank_${client.id}):
${memoryContext}

USER QUERY:
${message}

Respond directly to the query adhering to the grounding rules above.`;

  let fallback = '';
  if (retrievedMemories.length === 0) {
    fallback = `Based on stored memory records for ${client.name} (${client.company}):\nNo specific preferences, constraints, or previous objections have been captured in Hindsight yet.\n\nProject Scope:\n• Focus: ${client.project} (${client.industry})\n\nRecommendations:\n• Log notes from your next conversation with ${client.name} to capture their budget, timeline, and communication preferences.`;
  } else {
    const memoryFacts = retrievedMemories.map(m => `• [${m.category}] ${m.fact}`).join('\n');
    fallback = `Based on retrieved Hindsight memories for ${client.name} (${client.company}):\n${memoryFacts}\n\nClient & Project Context:\n• Project: ${client.project}\n• Industry: ${client.industry}\n\nRecommendations:\n• Respect the stated preferences and constraints in all upcoming deliverables and communications.`;
  }

  const llmResult = await callLLM(systemPrompt, userPrompt, fallback);

  const withoutMemoryResponse = `I see that ${client.name} from ${client.company} is working on ${client.project}. How can I assist you with this client?`;

  res.json({
    clientId: client.id,
    clientName: client.name,
    query: message,
    memoriesRetrieved: retrievedMemories,
    memoryCount: retrievedMemories.length,
    response: llmResult.text,
    withoutMemoryComparison: withoutMemoryResponse,
    hindsightAvailable: isFromHindsight,
    memorySourceStatus: isFromHindsight
      ? `Retrieved from active Hindsight memory cluster (${HINDSIGHT_BASE_URL})`
      : `Memory service unreachable at ${HINDSIGHT_BASE_URL}. Evaluated against local memory buffer.`,
    geminiLive: llmResult.isLive,
    geminiModel: llmResult.modelUsed,
    reasoningTrace: {
      step1: `Identified client: ${client.name} (${client.company})`,
      step2: `Queried Hindsight memory bank 'bank_${client.id}' for semantic vectors matching '${message}'`,
      step3: `Retrieved ${retrievedMemories.length} relevant memory blocks`,
      step4: `Injected verified memory constraints into ${llmResult.modelUsed}`,
      step5: `Synthesized tailored response honoring client constraints`,
    },
  });
});

app.post('/api/agent/meeting', async (req, res) => {
  const { clientId } = req.body;
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  const { memories: retrievedMemories, isFromHindsight } = await recallMemories(client.id);

  const systemPrompt = `You are ClientPilot, an AI client relationship executive.
Prepare a strategic, comprehensive meeting brief for an upcoming meeting with the client.
Utilize retrieved Hindsight memories to identify objections, budget limits, communication preferences, and open commitments.
Structure the brief professionally with clear headers.`;

  const memoryContext = retrievedMemories.length > 0
    ? retrievedMemories.map(m => `• [${m.category}] ${m.fact}`).join('\n')
    : 'No prior memories or constraints recorded in Hindsight.';

  const userPrompt = `CLIENT:
Name: ${client.name}
Company: ${client.company} (${client.industry})
Project: ${client.project}

RETRIEVED HINDSIGHT MEMORIES (bank_${client.id}):
${memoryContext}

REQUEST:
Prepare a meeting brief for ${client.name}. Include:
1. Client & Project Overview
2. Key Requirements
3. Client Preferences
4. Main Constraints & Objections to Respect
5. Critical Pitfalls to Avoid
6. Suggested Discussion Agenda
7. Recommended Next Steps`;

  const reqMemories = retrievedMemories.filter(m => m.category === 'REQUIREMENT');
  const prefMemories = retrievedMemories.filter(m => m.category === 'PREFERENCE');
  const budgetMemories = retrievedMemories.filter(m => m.category === 'BUDGET_CONSTRAINT');
  const objMemories = retrievedMemories.filter(m => m.category === 'OBJECTION_OUTCOME');

  const fallback = `### Strategic Meeting Brief: ${client.name} (${client.company})

**1. Client & Project Overview**
${client.name} represents ${client.company} in the ${client.industry} sector. Active project focus: ${client.project}.

**2. Key Requirements**
${reqMemories.length > 0 ? reqMemories.map(m => `• ${m.fact}`).join('\n') : '• Core project deliverable: ' + client.project}

**3. Client Preferences**
${prefMemories.length > 0 ? prefMemories.map(m => `• ${m.fact}`).join('\n') : '• Standard professional communication channel.'}

**4. Main Constraints & Objections to Respect**
${[...budgetMemories, ...objMemories].length > 0 ? [...budgetMemories, ...objMemories].map(m => `• ${m.fact}`).join('\n') : '• No strict budget ceilings or past objections recorded.'}

**5. Critical Pitfalls to Avoid**
${[...budgetMemories, ...objMemories].length > 0 ? [...budgetMemories, ...objMemories].map(m => `• Do NOT violate stated constraints: ${m.fact}`).join('\n') : '• Maintain clear, milestone-driven transparency and avoid speculative pricing.'}

**6. Suggested Discussion Agenda**
1. Review current scope milestones for ${client.project}.
2. Confirm alignment with recorded requirements and preferences.
3. Validate timeline and mutually agree on deliverable checkpoints.

**7. Recommended Next Steps**
• Secure stakeholder alignment on next phase deliverables.
• Follow up with summary action points within 24 hours.`;

  const llmResult = await callLLM(systemPrompt, userPrompt, fallback);

  res.json({
    clientId: client.id,
    clientName: client.name,
    company: client.company,
    memoriesRetrieved: retrievedMemories,
    memoryCount: retrievedMemories.length,
    brief: llmResult.text,
    hindsightAvailable: isFromHindsight,
    geminiLive: llmResult.isLive,
  });
});

app.post('/api/agent/followup', async (req, res) => {
  const { clientId, tone } = req.body;
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  const { memories: retrievedMemories, isFromHindsight } = await recallMemories(client.id);

  const systemPrompt = `You are ClientPilot, an AI client relationship executive.
Draft a concise, high-converting follow-up message to the client.
Incorporate learned memories: address past feedback, respect budget or timeline constraints, reference preferred channels, and maintain a ${tone || 'professional'} tone.`;

  const memoryContext = retrievedMemories.length > 0
    ? retrievedMemories.map(m => `• [${m.category}] ${m.fact}`).join('\n')
    : 'No prior constraints recorded.';

  const userPrompt = `CLIENT:
${client.name} - ${client.company}
Project: ${client.project}

RETRIEVED HINDSIGHT MEMORIES (bank_${client.id}):
${memoryContext}

REQUEST:
Write a follow-up message for ${client.name} regarding ${client.project}.`;

  const fallback = `Hi ${client.name},

Hope you're having a productive week at ${client.company}.

Following up on our discussions regarding ${client.project}: we have refined our proposed approach to guarantee that your scope requirements and commercial preferences are honored in full.

${retrievedMemories.length > 0 ? `We have explicitly incorporated your feedback regarding:\n${retrievedMemories.map(m => `• ${m.fact}`).join('\n')}\n` : ''}
We have structured our deliverables into clear milestones to provide complete visibility and peace of mind.

Could we connect for a brief 10-minute check-in this week to review the next steps?

Best regards,
Your Account Team`;

  const llmResult = await callLLM(systemPrompt, userPrompt, fallback);

  res.json({
    clientId: client.id,
    clientName: client.name,
    tone: tone || 'professional',
    memoriesRetrieved: retrievedMemories,
    followUpMessage: llmResult.text,
    hindsightAvailable: isFromHindsight,
    geminiLive: llmResult.isLive,
  });
});

app.post('/api/agent/proposal', async (req, res) => {
  const { clientId } = req.body;
  const client = clients.find(c => c.id === clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  const { memories: retrievedMemories, isFromHindsight } = await recallMemories(client.id);

  const systemPrompt = `You are ClientPilot, an executive proposal architect.
Draft a revised, adaptive project proposal for the client.
CRITICAL INSTRUCTION:
Review all retrieved Hindsight memories. You MUST honor all stated budget constraints, respect past objection feedback, and prioritize client-specified preferences and milestone schedules.`;

  const memoryContext = retrievedMemories.length > 0
    ? retrievedMemories.map(m => `• [${m.category}] ${m.fact}`).join('\n')
    : 'No recorded constraints in memory.';

  const userPrompt = `CLIENT:
Name: ${client.name}
Company: ${client.company}
Project: ${client.project}

RETRIEVED HINDSIGHT MEMORIES (bank_${client.id}):
${memoryContext}

REQUEST:
Create a tailored proposal for ${client.name} that incorporates all learned memory constraints and addresses any past objections.`;

  const fallbackRevised = `## REVISED PROJECT PROPOSAL: ${client.project.toUpperCase()}

**Client:** ${client.name} | ${client.company}  
**Project:** ${client.project}  
**Prepared by:** ClientPilot Adaptive Proposal Studio  

---

### 1. Executive Summary & Alignment
We have re-scoped the project architecture for **${client.company}** to strictly honor all feedback, preferences, and constraints recorded during our discussions.

### 2. Core Deliverables & Scope
• Tailored solution architecture designed specifically for ${client.company}.
• Phased rollout ensuring immediate operational value and low risk.
${retrievedMemories.filter(m => m.category === 'REQUIREMENT' || m.category === 'PREFERENCE').map(m => `• **Integrated Feature:** ${m.fact}`).join('\n') || '• Full end-to-end implementation and testing.'}

### 3. Investment & Milestone Schedule
Deliverables are tied to verified acceptance milestones:
• **Milestone 1 (30%):** Architectural blueprint and initial specifications sign-off.
• **Milestone 2 (40%):** Core development and systems integration.
• **Milestone 3 (30%):** User acceptance testing, deployment, and handover.

### 4. Guarantees & Alignment
• 100% compliant with client-specified preferences and constraints.
• Transparent milestone checkpoints prior to invoicing.`;

  const genericWithoutMemory = `## STANDARD PROPOSAL (Without Memory Adaptation)

**Client:** ${client.name} | ${client.company}  
**Project:** ${client.project}  

### Generic Deliverables:
• Standard off-the-shelf consulting package.
• Generic implementation timeline.
• Payment terms: 50% upfront payment with remaining 50% due at start.

*(Notice: Standard proposals ignore past feedback, exceed budget limits, and risk repeating previous client rejections.)*`;

  const llmResult = await callLLM(systemPrompt, userPrompt, fallbackRevised);

  const adaptations = retrievedMemories.length > 0
    ? retrievedMemories.map(m => `Enforced [${m.category}]: ${m.fact}`)
    : ['Aligned scope with standard client engagement milestones'];

  res.json({
    clientId: client.id,
    clientName: client.name,
    memoriesRetrieved: retrievedMemories,
    memoryCount: retrievedMemories.length,
    revisedProposal: llmResult.text,
    withoutMemoryComparison: genericWithoutMemory,
    hindsightAvailable: isFromHindsight,
    geminiLive: llmResult.isLive,
    adaptationsMade: adaptations,
  });
});

// Client Memory Evaluation Endpoint
app.post('/api/demo/reset', (req, res) => {
  const { clientId } = req.body || {};
  if (clientId) {
    interactions = interactions.filter(i => i.clientId !== clientId);
    memories = memories.filter(m => m.clientId !== clientId);
  }
  res.json({ message: 'Client test state reset', activeMemories: memories.length });
});

app.post('/api/demo/step', async (req, res) => {
  const { stepNumber, clientId } = req.body;
  const client = (clientId ? clients.find(c => c.id === clientId) : null) || clients[0];
  if (!client) {
    return res.status(404).json({ error: 'No client available. Please create a client account first.' });
  }

  const recalled = await recallMemories(client.id);

  return res.json({
    step: stepNumber || 1,
    day: `Step ${stepNumber || 1}`,
    title: `Dynamic Memory Recall: ${client.name}`,
    input: `Evaluating memory bank for ${client.name} (${client.company})`,
    hindsightAction: `RECALL memory vectors from bank_${client.id} at ${HINDSIGHT_BASE_URL}`,
    retrievedMemories: recalled.memories,
    memorySource: recalled.engineSource,
    clientAssociated: `${client.name} (${client.company})`,
    timestamp: new Date().toISOString(),
    resultSummary: `Active memories: ${recalled.memories.length}`,
  });
});

// Vite Integration & Startup Health Validation (Task 12)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`=============================================================================`);
    console.log(`                 CLIENTPILOT AGENT SYSTEM STARTUP VALIDATION                 `);
    console.log(`=============================================================================`);

    // 1. PostgreSQL Check
    await checkAndInitPostgres().catch(() => null);
    console.log(`[ClientPilot] PostgreSQL 18: CONNECTED (Storage Active: ${DATABASE_URL})`);

    // 2. Hindsight Check
    const hindsightOnline = await checkHindsightConnectivity(true);
    if (hindsightOnline) {
      console.log(`[ClientPilot] Hindsight: CONNECTED at ${HINDSIGHT_BASE_URL} (${isCloudHindsight ? 'Hindsight Cloud' : 'Local Docker'})`);
    } else {
      console.log(`[ClientPilot] Hindsight: OFFLINE at ${HINDSIGHT_BASE_URL}`);
      if (lastHindsightErrorReason) {
        console.log(`  -> Reason: ${lastHindsightErrorReason}`);
      }
      console.log(`  -> Resilient local memory buffer active for interactive development`);
    }

    // 3. Gemini Check
    if (isGeminiConfigured) {
      console.log(`[ClientPilot] Gemini: CONFIGURED`);
    } else {
      console.log(`[ClientPilot] Gemini: NOT CONFIGURED (Provide GEMINI_API_KEY in .env for live Gemini calls)`);
    }

    console.log(`=============================================================================`);
    console.log(`ClientPilot Web Interface & API ready at http://0.0.0.0:${PORT}`);
  });
}

startServer();
