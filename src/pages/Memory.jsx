import React, { useState } from 'react';
import {
  Brain,
  Search,
  Building2,
  Database,
  Coins,
  ShieldAlert,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  Filter,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import MemoryCard from '../components/MemoryCard';
import MemoryPanel from '../components/MemoryPanel';

export default function Memory({
  clients = [],
  selectedClientId,
  setSelectedClientId,
  memories = [],
  hindsightStatus,
  healthData,
  onRefresh,
}) {
  const [viewMode, setViewMode] = useState('panel'); // 'panel' (Audit Memory Panel) | 'cards' (Card Grid)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientMemories = memories.filter((m) => m.clientId === currentClient?.id);

  const categories = [
    { id: 'ALL', label: 'All Memories' },
    { id: 'BUDGET_CONSTRAINT', label: 'Budget Constraints' },
    { id: 'PREFERENCE', label: 'Preferences' },
    { id: 'OBJECTION_OUTCOME', label: 'Objections & Outcomes' },
    { id: 'REQUIREMENT', label: 'Requirements' },
    { id: 'COMMITMENT', label: 'Commitments' },
  ];

  const filteredMemories = clientMemories.filter((m) => {
    const matchesCategory =
      selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              Hindsight Cognitive Memory Vault
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
              Vectorize.io Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspecting episodic memory banks, confidence weights, and learned constraints.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('panel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'panel'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Memory Audit Panel</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card Grid View</span>
          </button>
        </div>
      </div>

      {/* Primary View: Comprehensive Memory Panel */}
      {viewMode === 'panel' ? (
        <MemoryPanel
          clients={clients}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          memories={memories}
          hindsightStatus={hindsightStatus}
          healthData={healthData}
          onRefresh={onRefresh}
        />
      ) : (
        /* Alternative Card Grid View */
        <div className="space-y-6">
          {/* Client Overview Card for Memory Bank */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                Active Memory Bank: bank_{currentClient?.id}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {currentClient?.name} — {currentClient?.company}
              </h3>
              <p className="text-xs text-slate-300">
                Project: <strong className="text-white">{currentClient?.project}</strong> | Industry: {currentClient?.industry}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-bold text-violet-300">
                  {clientMemories.length}
                </span>
                <span className="block text-[11px] text-slate-400 font-medium">
                  Verified Memory Vectors
                </span>
              </div>
            </div>
          </div>

          {/* Semantic Search Test Bench */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                Hindsight Semantic Recall Test Bench
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Test keyword & vector matching live
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type any memory keyword (e.g. 'budget', 'whatsapp', 'rejected quote', 'payment')..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Quick query chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 self-center">Try:</span>
              {['budget limit', 'communication channels', 'proposal feedback', 'scope requirements'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  "{chip}"
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-600 font-semibold hover:underline ml-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Memory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((mem) => (
              <MemoryCard key={mem.id} memory={mem} />
            ))}

            {filteredMemories.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 space-y-2">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  No matching Hindsight memories found
                </p>
                <p className="text-xs text-slate-400">
                  Try adjusting your search query or category filter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
