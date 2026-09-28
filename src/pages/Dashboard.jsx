import React from 'react';
import {
  Users,
  MessageSquare,
  Brain,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Database,
  Cpu,
  Server,
  Terminal,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard({
  clients = [],
  interactions = [],
  memories = [],
  healthData,
  hindsightStatus,
  onSelectClient,
  onNavigatePage,
}) {
  const totalClients = clients.length;
  const totalInteractions = interactions.length;
  const totalMemories = memories.length;

  const rawStatus =
    hindsightStatus?.status ||
    healthData?.services?.hindsight ||
    'OFFLINE — Fallback Buffer';
  const isCloud = rawStatus.includes('Cloud');
  const isHindsightConnected = rawStatus.startsWith('CONNECTED');
  const hindsightLabel = isHindsightConnected
    ? (isCloud ? 'CONNECTED — Hindsight Cloud' : 'CONNECTED — Local Docker')
    : 'OFFLINE — Fallback Buffer';

  const isPostgresConnected =
    healthData?.services?.database === 'CONNECTED';
  const isGeminiConfigured =
    healthData?.geminiConfigured ?? false;

  const recentInteractions = [...interactions]
    .sort((a, b) => new Date(b.interactionDate).getTime() - new Date(a.interactionDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hack With Hyderabad 3.0 MVP
            </span>
            <span className="text-xs text-slate-400">
              AI Agents That Learn Using Hindsight
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ClientPilot Intelligence Center
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Continuous client relationship agent powered by Vectorize.io's Hindsight memory engine. Retains past decisions, respects budget ceilings, and learns from prior objections.
          </p>
        </div>

        {/* Quick Action CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigatePage('clients')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Client Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task 11: Real-Time Services Configuration & Health Status Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Core Services & Engine Status
            </h3>
            <span className="text-xs text-slate-400">
              (Live Health Diagnostic)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Host Port Mapping: Hindsight 8081:8080 | Postgres 5432:5432
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. PostgreSQL Status */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPostgresConnected
              ? 'bg-emerald-50/40 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                PostgreSQL Data Store
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                isPostgresConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPostgresConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isPostgresConnected ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Stores relational clients, contact details, and chronological touchpoint tables.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
              Port: 5432 | DB: clientpilot
            </div>
          </div>

          {/* 2. Hindsight Memory Status */}
          <div className={`p-4 rounded-xl border transition-all ${
            isHindsightConnected
              ? 'bg-emerald-50/40 border-emerald-200'
              : 'bg-amber-50/40 border-amber-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-violet-600" />
                Hindsight Memory Engine
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold ${
                isHindsightConnected
                  ? isCloud
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {isHindsightConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{hindsightLabel}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vectorize.io standalone memory container retaining client constraints & objections.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
              URL: {healthData?.hindsightUrl || 'http://localhost:8081'}
            </div>
          </div>

          {/* 3. Gemini LLM Status */}
          <div className={`p-4 rounded-xl border transition-all ${
            isGeminiConfigured
              ? 'bg-emerald-50/40 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Google Gemini API
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                isGeminiConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isGeminiConfigured ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {isGeminiConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Provides live model reasoning (gemini-3.8-flash). Safe fallback available if key is unset.
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-600 bg-white/80 p-1.5 rounded border border-slate-200">
              Provider: Google GenAI (Server-Side)
            </div>
          </div>
        </div>

        {/* Runtime Environment Notice (Task 15) */}
        {!isHindsightConnected && (
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">Hindsight Host Configuration Notice:</strong>
              <p className="text-[11px] leading-relaxed">
                When running the full stack locally with Docker, Hindsight is exposed on host port <strong>8081</strong> (<code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded">http://localhost:8081</code>). If running in a remote cloud/AI Studio environment without local Docker access, the app operates using its local cognitive memory buffer or can be directed to Hindsight Cloud via <code className="font-mono bg-amber-100/60 px-1 py-0.2 rounded">HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalClients}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Active Accounts
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Interactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalInteractions}</span>
            <span className="text-xs text-slate-400">Logged touchpoints</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-violet-200 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-100/50 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-900 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-violet-600" />
              Hindsight Memories
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-950">{totalMemories}</span>
            <span className="text-xs text-violet-700 font-semibold">Active in Memory Banks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{clients.length}</span>
            <span className="text-xs text-amber-700 font-semibold">{clients.length === 0 ? 'No active accounts' : 'Current portfolio'}</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Clients & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Client Accounts</h3>
                <p className="text-xs text-slate-500">
                  Select a client to view their long-term memory bank and AI operations.
                </p>
              </div>
              <button
                onClick={() => onNavigatePage('clients')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                View all ({clients.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No clients yet. Create your first client.</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add a client from the Clients tab to start logging interactions and building cognitive memory banks.
                </p>
                <button
                  onClick={() => onNavigatePage('clients')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Go to Clients
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {clients.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectClient(c)}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {c.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{c.company}</span>
                          <span className="text-slate-300">•</span>
                          <span>{c.industry || 'General'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {c.project}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Memory Engine Demonstration Card */}
          <div className="p-5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-indigo-700" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-950">
                Cognitive Long-Term Memory Architecture
              </h4>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                ClientPilot retains episodic interaction facts into isolated client memory banks via Hindsight and synthesizes strategic briefs and proposals via Gemini.
              </p>
              <button
                onClick={() => onNavigatePage('demo')}
                className="mt-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
              >
                Inspect Memory Verification Suite →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Recent Activity
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Live Feed</span>
            </div>

            {recentInteractions.length === 0 ? (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-600">No interactions recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Select a client to log meetings, calls, or notes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInteractions.map((act) => {
                  const client = clients.find((c) => c.id === act.clientId);
                  return (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{client?.name || 'Client'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(act.interactionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {act.content}
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[10px] text-violet-700 font-semibold">
                        <Brain className="w-3 h-3 text-violet-600" />
                        <span>Retained into Hindsight</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hindsight Architectural Card */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Memory Engine Status</span>
              <span className={`font-bold flex items-center gap-1 ${
                isHindsightConnected ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isHindsightConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isHindsightConnected ? 'Connected (Port 8081)' : 'Offline (Local Fallback)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hindsight decouples raw conversation logs from high-signal cognitive facts. The agent operates under the strict rule:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-indigo-300 border border-slate-800 text-center">
              REMEMBER → RETRIEVE → REASON → ADAPT → ACT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
