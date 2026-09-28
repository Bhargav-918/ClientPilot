import React from 'react';
import {
  LayoutDashboard,
  Users,
  Brain,
  MessageSquare,
  Sparkles,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, hindsightStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'memory', label: 'Memory Vault', icon: Brain, badge: 'Hindsight' },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'demo', label: 'Learning Journey', icon: Sparkles, highlight: true },
    { id: 'architecture', label: 'Architecture & Docs', icon: Layers },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">
              ClientPilot
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              AI Client Memory Agent
            </p>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mt-4 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-[11px] font-medium text-indigo-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Hack With Hyderabad 3.0
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : item.highlight
                  ? 'text-amber-300 hover:bg-slate-800/80 border border-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-violet-950 text-violet-300 border border-violet-800/50">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-950/90 text-amber-300 border border-amber-700/50 animate-pulse">
                  DEMO
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Hindsight System Status Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            Hindsight Memory
          </span>
        </div>

        {(() => {
          const rawStatus = hindsightStatus?.status || 'OFFLINE — Fallback Buffer';
          const isCloud = rawStatus.includes('Cloud');
          const isConnected = rawStatus.startsWith('CONNECTED');
          const label = isConnected
            ? (isCloud ? 'CONNECTED — Hindsight Cloud' : 'CONNECTED — Local Docker')
            : 'OFFLINE — Fallback Buffer';

          return (
            <div className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1.5 ${
              isConnected
                ? isCloud
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  : 'bg-teal-950/80 text-teal-300 border-teal-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{label}</span>
            </div>
          );
        })()}

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Vectorize.io episodic memory engine retaining client preferences, constraints & objections.
        </p>
      </div>
    </aside>
  );
}
