import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Database,
  Calendar,
  Layers,
  Sparkles,
  Coins,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Cpu,
  AlertTriangle,
  Bookmark,
  Building2,
  Send,
} from 'lucide-react';
import { api } from '../services/api';

export default function MemoryPanel({
  clients = [],
  selectedClientId,
  setSelectedClientId,
  memories = [],
  hindsightStatus,
  healthData,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('stored'); // 'stored' | 'retrieved' | 'simulator'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [retrievedLogs, setRetrievedLogs] = useState([]);
  const [loadingRetrieved, setLoadingRetrieved] = useState(false);

  // Live simulator state
  const [simQuery, setSimQuery] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Fetch retrieval logs
  const loadRetrievalLogs = async () => {
    setLoadingRetrieved(true);
    try {
      const logs = await api.getRetrievedMemories();
      if (Array.isArray(logs)) {
        setRetrievedLogs(logs);
      }
    } catch (e) {
      console.warn('Failed to load retrieval logs:', e);
    } finally {
      setLoadingRetrieved(false);
    }
  };

  useEffect(() => {
    loadRetrievalLogs();
  }, []);

  const handleSimulateRecall = async () => {
    if (!simQuery.trim() || !currentClient) return;
    setSimLoading(true);
    try {
      const res = await api.searchMemories(currentClient.id, simQuery.trim());
      setSimResult(res);
      loadRetrievalLogs();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimLoading(false);
    }
  };

  // Status computation matching user specification:
  // "CONNECTED — Hindsight Cloud" | "CONNECTED — Local Docker" | "OFFLINE — Fallback Buffer"
  const rawStatus = hindsightStatus?.status || healthData?.services?.hindsight || 'OFFLINE — Fallback Buffer';
  const isCloud = rawStatus.includes('Cloud');
  const isLocalDocker = rawStatus.includes('Local Docker');
  const isConnected = rawStatus.startsWith('CONNECTED');

  const getStatusBadge = () => {
    if (isConnected) {
      if (isCloud) {
        return {
          text: 'CONNECTED — Hindsight Cloud',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500 animate-pulse',
        };
      }
      return {
        text: 'CONNECTED — Local Docker',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-300',
        dot: 'bg-teal-500 animate-pulse',
      };
    }
    return {
      text: 'OFFLINE — Fallback Buffer',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
    };
  };

  const statusConfig = getStatusBadge();

  // Filter memories
  const clientMemories = selectedClientId === 'ALL'
    ? memories
    : memories.filter((m) => m.clientId === currentClient?.id);

  const filteredMemories = clientMemories.filter((m) => {
    const matchesCategory = filterCategory === 'ALL' || m.category === filterCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.clientName && m.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'BUDGET_CONSTRAINT':
        return { label: 'Budget Constraint', icon: Coins, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'PREFERENCE':
        return { label: 'Preference', icon: Sparkles, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'OBJECTION_OUTCOME':
        return { label: 'Objection / Outcome', icon: ShieldAlert, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'REQUIREMENT':
        return { label: 'Requirement', icon: Layers, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'COMMITMENT':
        return { label: 'Commitment', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Decision / Fact', icon: Bookmark, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header & Hindsight Mode Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Hindsight Memory Inspector & Audit Panel
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Real-time audit log of memories stored, retrieved, source touchpoints, and client associations.
            </p>
          </div>

          {/* Accurate Status Pill */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${statusConfig.badgeBg}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
              <span>Hindsight: {statusConfig.text}</span>
            </div>
            {onRefresh && (
              <button
                onClick={() => {
                  onRefresh();
                  loadRetrievalLogs();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Memory Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Engine Metadata Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Target Base URL: <strong className="font-mono text-slate-200">{healthData?.hindsightUrl || hindsightStatus?.baseUrl || 'http://localhost:8081'}</strong>
            </span>
            <span>•</span>
            <span>
              Total Memories in Vault: <strong className="text-violet-300">{memories.length}</strong>
            </span>
            <span>•</span>
            <span>
              Active Banks: <strong className="text-slate-200">{clients.length}</strong>
            </span>
          </div>
          <span className="font-mono text-slate-400">
            Vectorize.io Standalone / Cloud Protocol
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-6 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('stored')}
          className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'stored'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Memories Stored ({filteredMemories.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('retrieved');
            loadRetrievalLogs();
          }}
          className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'retrieved'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Memories Retrieved ({retrievedLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'simulator'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Live Recall Simulator</span>
        </button>
      </div>

      {/* Filter and Client Context Bar (for Stored tab) */}
      {activeTab === 'stored' && (
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Client:</span>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId && setSelectedClientId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </select>

            <div className="relative ml-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facts or keywords..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'BUDGET_CONSTRAINT', label: 'Budget' },
              { id: 'PREFERENCE', label: 'Preference' },
              { id: 'OBJECTION_OUTCOME', label: 'Objection' },
              { id: 'REQUIREMENT', label: 'Requirement' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: MEMORIES STORED */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'stored' && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => {
              const catConfig = getCategoryDetails(mem.category);
              const CatIcon = catConfig.icon;
              const associatedClient = clients.find((c) => c.id === mem.clientId);
              const clientName = mem.clientName || associatedClient?.name || 'Client';
              const clientCompany = mem.clientCompany || associatedClient?.company || '';
              const engineSource = mem.engineSource || (mem.verifiedHindsight ? (isCloud ? 'Hindsight Cloud' : 'Local Docker') : 'Fallback Buffer');

              return (
                <div
                  key={mem.id}
                  className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition-all space-y-3"
                >
                  {/* Top Row: Category + Confidence + Engine */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${catConfig.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {catConfig.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                        {engineSource}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {Math.round((mem.confidence || 0.95) * 100)}% conf
                      </span>
                    </div>
                  </div>

                  {/* Fact / Memory Stored */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Memory Stored (Semantic Fact)
                    </span>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      "{mem.fact}"
                    </p>
                  </div>

                  {/* Client Associated & Source Touchpoint */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        Client Associated: <strong className="text-slate-900">{clientName}</strong> ({clientCompany})
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Bank: bank_{mem.clientId}
                      </span>
                    </div>

                    {mem.sourceInteractionSnippet && (
                      <div className="text-[10px] text-slate-500 bg-amber-50/50 border border-amber-100 p-1.5 rounded">
                        <span className="font-bold text-amber-800">Memory Source: </span>
                        {mem.sourceInteractionSnippet}
                      </div>
                    )}
                  </div>

                  {/* Footer Timestamp & ID */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Date/Time Learned: {mem.timestamp ? new Date(mem.timestamp).toLocaleString() : mem.sourceDate || '2026-09-22'}
                    </span>
                    <span className="font-mono">ID: {mem.hindsightMemoryId || mem.id}</span>
                  </div>
                </div>
              );
            })}

            {filteredMemories.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No memories found for this client.</p>
                <p className="text-xs text-slate-400">Log an interaction to capture requirements, preferences, and feedback into Hindsight.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: MEMORIES RETRIEVED (Live Audit Trail) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'retrieved' && (
        <div className="p-6 space-y-4">
          <div className="p-3 bg-violet-50/80 rounded-xl border border-violet-200/80 text-xs text-violet-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-600" />
              <strong>Hindsight Retrieval Audit Trail:</strong> Showing queries sent by the agent and memories retrieved dynamically.
            </span>
            <button
              onClick={loadRetrievalLogs}
              className="text-[11px] font-bold text-violet-700 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Logs
            </button>
          </div>

          <div className="space-y-4">
            {retrievedLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Query Event
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      "{log.query}"
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200 font-mono">
                      {log.engineSource}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Client Associated */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Client Associated: <strong className="text-slate-900">{log.clientName}</strong> ({log.clientCompany})
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {log.retrievedCount} Memory Block{log.retrievedCount !== 1 ? 's' : ''} Retrieved
                  </span>
                </div>

                {/* Retrieved Memory Blocks */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Memories Retrieved:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {log.memories && log.memories.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-700 text-[10px]">
                            [{m.category}]
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {Math.round((m.confidence || 0.95) * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          {m.fact}
                        </p>
                        {m.sourceInteractionSnippet && (
                          <p className="text-[10px] text-slate-500 italic">
                            Source: "{m.sourceInteractionSnippet}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {retrievedLogs.length === 0 && (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No memory retrieval events recorded yet</p>
                <p className="text-xs text-slate-400">Ask the AI Assistant a question or run the Demo to trigger Hindsight Recall.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: LIVE RECALL SIMULATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Live Hindsight Semantic Recall Benchmark
            </h3>
            <p className="text-xs text-slate-500">
              Type any query to test how Hindsight retrieves constraints, preferences, and objections for <strong className="text-slate-800">{currentClient?.name}</strong>.
            </p>
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={simQuery}
              onChange={(e) => setSimQuery(e.target.value)}
              placeholder={currentClient ? `Search memories for ${currentClient.name} (e.g. 'budget', 'deliverables', 'feedback')` : "Search client memories..."}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSimulateRecall}
              disabled={simLoading || !simQuery.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {simLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Recall</span>
            </button>
          </div>

          {/* Quick Benchmark Queries */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Pre-set Benchmarks:</span>
            {(currentClient ? [
              `What are ${currentClient.name}'s main concerns?`,
              `Prepare me for the next meeting with ${currentClient.name}.`,
              `What was the feedback on previous discussions with ${currentClient.name}?`,
              `What are the constraints for ${currentClient.company}?`,
            ] : [
              'What are the client preferences?',
              'What are the budget constraints?',
            ]).map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSimQuery(q);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Simulation Output */}
          {simResult && (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700">
                  Recall Results for: "{simResult.query}"
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Engine Source: {simResult.engineSource || 'Hindsight Live Engine'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {simResult.memories && simResult.memories.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-700 text-[10px]">
                      <span>[{m.category}]</span>
                      <span className="text-slate-400">{Math.round((m.confidence || 0.95) * 100)}% match</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      {m.fact}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>Source: {m.sourceDate || '2026-09-22'}</span>
                      <span className="font-mono">{m.hindsightMemoryId || m.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
