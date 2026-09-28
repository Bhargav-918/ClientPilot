import React from 'react';
import {
  Brain,
  Sparkles,
  PlusCircle,
  Building2,
  ChevronDown,
  Cpu,
  UserPlus,
} from 'lucide-react';

export default function Navbar({
  clients = [],
  selectedClientId,
  setSelectedClientId,
  hindsightStatus,
  healthData,
  onOpenNewInteraction,
  onOpenNewClient,
  onTriggerDemo,
}) {
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const rawStatus = hindsightStatus?.status || healthData?.services?.hindsight || 'OFFLINE — Fallback Buffer';
  const isCloud = rawStatus.includes('Cloud');
  const isHindsightConnected = rawStatus.startsWith('CONNECTED');
  const hindsightLabel = isHindsightConnected
    ? (isCloud ? 'CONNECTED — Hindsight Cloud' : 'CONNECTED — Local Docker')
    : 'OFFLINE — Fallback Buffer';

  const isGeminiConfigured = healthData?.geminiConfigured ?? false;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Left: Active Client Context Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700">Active Client:</span>
        </div>

        <div className="relative">
          <select
            value={selectedClientId || ''}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {clients.length === 0 ? (
              <option value="">No clients yet</option>
            ) : (
              clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company} ({c.project})
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Hindsight Active Bank Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-medium text-violet-700">
          <Brain className="w-3.5 h-3.5 text-violet-600" />
          <span>Bank: <strong className="font-semibold font-mono">{currentClient ? `bank_${currentClient.id}` : 'None'}</strong></span>
        </div>

        {/* Live Service Indicator Pills (Task 11) */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Hindsight Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${
              isHindsightConnected
                ? isCloud
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-teal-50 text-teal-800 border-teal-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            title={`Hindsight Engine: ${hindsightLabel}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isHindsightConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>Hindsight: {isHindsightConnected ? 'CONNECTED' : 'OFFLINE'}</span>
          </span>

          {/* Gemini */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isGeminiConfigured
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title={isGeminiConfigured ? 'Gemini 3.8 Flash live' : 'Gemini key not configured (fallback mode)'}
          >
            <Cpu className="w-3 h-3 text-indigo-600" />
            Gemini: {isGeminiConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* New Client Button */}
        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-600" />
          <span>New Client</span>
        </button>

        {/* Add Interaction Button */}
        <button
          onClick={onOpenNewInteraction}
          disabled={clients.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Interaction</span>
        </button>

        {/* Fast Demo Mode Trigger */}
        <button
          onClick={onTriggerDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Run Hackathon Demonstration"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Run Demo</span>
        </button>
      </div>
    </header>
  );
}
