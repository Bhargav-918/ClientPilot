import React, { useState } from 'react';
import {
  Calendar,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function MeetingBrief({ client, briefData, loading, onRegenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!briefData?.brief) return;
    navigator.clipboard.writeText(briefData.brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            Synthesizing Strategic Meeting Brief...
          </h3>
          <p className="text-xs text-slate-500">
            Recalling Hindsight memories for {client?.name}: constraints, preferences, and objections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Tomorrow's Meeting Preparation
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
              <Brain className="w-3.5 h-3.5" />
              Grounded in Hindsight Long-term Memory
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Meeting Briefing: {client?.name} — {client?.company}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Project: {client?.project} | Industry: {client?.industry}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Brief'}</span>
          </button>
        </div>
      </div>

      {/* Critical Pitfall Alert Bar */}
      <div className="bg-rose-50 border-y border-rose-200 px-5 py-2.5 flex items-center gap-3 text-xs text-rose-900 font-medium">
        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
        <div>
          <strong className="font-bold text-rose-800">Critical Pitfall to Avoid: </strong>
          <span>
            Never quote prices above ₹2,00,000. Client previously rejected a ₹3.8L proposal due to high costs. Emphasize WhatsApp integration and staged milestones.
          </span>
        </div>
      </div>

      {/* Brief Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-normal whitespace-pre-line">
          {briefData?.brief || 'No briefing generated yet. Click generate to create a new one.'}
        </div>
      </div>
    </div>
  );
}
