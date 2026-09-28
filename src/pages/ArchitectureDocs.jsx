import React, { useState } from 'react';
import {
  Layers,
  Brain,
  Database,
  FileCode,
  Users,
  Terminal,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';

export default function ArchitectureDocs() {
  const [activeDocTab, setActiveDocTab] = useState('arch');

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          System Architecture & Technical Documentation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Hack With Hyderabad 3.0: Spring Boot, PostgreSQL, Google Gemini & Vectorize.io Hindsight
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        {[
          { id: 'arch', label: 'Architecture & Cognitive Loop' },
          { id: 'hindsight', label: 'Hindsight Memory Design' },
          { id: 'stack', label: 'Technology Stack' },
          { id: 'team', label: '6-Member Remote Team Matrix' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDocTab(tab.id)}
            className={`pb-3 relative transition-colors ${
              activeDocTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Architecture */}
      {activeDocTab === 'arch' && (
        <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              The 5-Stage Cognitive Pipeline
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ClientPilot solves conversational amnesia by decoupling structured operational logs from semantic, reflective memory banks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                step: '1. REMEMBER',
                subtitle: 'Ingestion & Extraction',
                desc: 'Captures interactions and extracts semantic facts into categories (Budget, Preference, Objection).',
                color: 'border-blue-200 bg-blue-50/50 text-blue-900',
              },
              {
                step: '2. RETRIEVE',
                subtitle: 'Semantic Recall',
                desc: 'Queries Hindsight memory banks using semantic vectors, similarity scoring, and recency.',
                color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900',
              },
              {
                step: '3. REASON',
                subtitle: 'Contextual Grounding',
                desc: 'LLM deliberates under strict memory constraints (honors client budget caps, channel preferences).',
                color: 'border-violet-200 bg-violet-50/50 text-violet-900',
              },
              {
                step: '4. ADAPT',
                subtitle: 'Pitfall Avoidance',
                desc: 'Checks past proposal outcomes and objections to prevent repeating failed approaches.',
                color: 'border-amber-200 bg-amber-50/50 text-amber-900',
              },
              {
                step: '5. ACT',
                subtitle: 'Actionable Artifacts',
                desc: 'Generates tailored proposals, meeting briefings, and follow-up outreach messages.',
                color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
              },
            ].map((p, i) => (
              <div key={i} className={`p-4 rounded-xl border ${p.color} space-y-1`}>
                <div className="font-bold text-xs">{p.step}</div>
                <div className="text-[11px] font-semibold opacity-80">{p.subtitle}</div>
                <p className="text-[11px] leading-relaxed pt-1 opacity-90">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* ASCII Diagram */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
{`User (Account Manager)
       │
       ▼
[ React Frontend ] ──HTTP / REST──> [ Spring Boot API Gateway ]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
               [ PostgreSQL 16 ]            [ Hindsight Engine ]
               - clients                    - vector memory banks
               - interactions               - retain / recall / reflect
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
                           [ Agent Reasoning Core ]
                               (Gemini 3.8 Flash)
                                        │
                                        ▼
                     [ Adapted Deliverable Generated ]`}
          </div>
        </div>
      )}

      {/* Tab 2: Hindsight */}
      {activeDocTab === 'hindsight' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hindsight Memory Engine Integration
              </h3>
              <p className="text-xs text-slate-500">
                Official protocol implementation inspired by Vectorize.io specifications.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-violet-100 text-violet-800 text-xs font-bold">
              v1.4.2 Protocol
            </span>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <p>
              Hindsight organizes client cognition into isolated memory banks (<code className="bg-slate-100 px-1 py-0.5 rounded text-violet-700 font-mono">bank_&#123;clientId&#125;</code>). Instead of bloating the context window with raw transcripts, Hindsight retains atomic, verified memory units with semantic classification:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">1. Retain Operation (POST /v1/memories/retain)</span>
                <p className="text-slate-600">
                  Parses client interactions, runs classification, extracts key facts (budget limits, tech stacks, channels), and indexes them into vector memory.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">2. Recall Operation (POST /v1/memories/recall)</span>
                <p className="text-slate-600">
                  Performs semantic search against query embeddings, ranking facts by relevance score and recency.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">3. Reflect Operation (POST /v1/memories/reflect)</span>
                <p className="text-slate-600">
                  Synthesizes high-order behavioral patterns (e.g. "Client values budget predictability over expansive feature lists").
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">4. Anti-Hallucination Guardrails</span>
                <p className="text-slate-600">
                  ClientPilot explicitly labels memories retrieved from Hindsight and flags when the memory engine is offline.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Technology Stack */}
      {activeDocTab === 'stack' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Technology Stack Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 block text-sm mb-1">Frontend</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>React 19 & Vite 8</li>
                <li>Tailwind CSS 4</li>
                <li>Lucide React Icons</li>
                <li>Motion Animations</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 block text-sm mb-1">Backend</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Java 21</li>
                <li>Spring Boot 3.3.4</li>
                <li>Spring Data JPA & Hibernate</li>
                <li>Spring WebFlux Reactive Client</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-900 block text-sm mb-1">Memory & AI</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                <li>Hindsight AI Memory (Vectorize.io)</li>
                <li>Google Gemini API (gemini-3.8-flash)</li>
                <li>Configurable LLM provider adapter</li>
                <li>PostgreSQL 16 relational database</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team */}
      {activeDocTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Remote Hackathon Team Breakdown (6 Members)
              </h3>
              <p className="text-xs text-slate-500">
                Clean module separation enabled parallel remote execution for Hack With Hyderabad 3.0.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { role: 'Member 1', focus: 'React Frontend & UI/UX', task: 'SaaS Dashboard, Client Directory, Memory Vault visualizer, Tailwind CSS layout' },
              { role: 'Member 2', focus: 'Spring Boot & PostgreSQL', task: 'Maven POM, JPA Entities (Client, Interaction), Repositories, REST Controllers' },
              { role: 'Member 3', focus: 'Hindsight Memory Integration', task: 'HindsightService adapter, Vectorize.io protocol, categorization rules, health checks' },
              { role: 'Member 4', focus: 'AI Agent & Prompt Engineering', task: 'AgentService, Gemini LLM prompts, reasoning trace extraction, anti-hallucination' },
              { role: 'Member 5', focus: 'Meeting, Follow-Up & Proposals', task: 'MeetingService, FollowUpService, ProposalService, side-by-side comparison logic' },
              { role: 'Member 6', focus: 'Testing, Docs & Demo Script', task: 'End-to-end integration tests, JUnit test suite, Demo Mode timeline, 3-min pitch script' },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-indigo-700 block">{m.role}: {m.focus}</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{m.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
