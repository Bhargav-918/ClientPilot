import React from 'react';
import {
  Brain,
  ShieldAlert,
  Coins,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';

export default function MemoryCard({ memory, onSearchReference }) {
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'BUDGET_CONSTRAINT':
        return {
          label: 'Budget Constraint',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: Coins,
        };
      case 'PREFERENCE':
        return {
          label: 'Preference',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: Sparkles,
        };
      case 'OBJECTION_OUTCOME':
        return {
          label: 'Objection / Outcome',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: ShieldAlert,
        };
      case 'REQUIREMENT':
        return {
          label: 'Requirement',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: Layers,
        };
      case 'COMMITMENT':
        return {
          label: 'Commitment',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
        };
      default:
        return {
          label: 'Fact / Decision',
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: Bookmark,
        };
    }
  };

  const config = getCategoryConfig(memory.category);
  const Icon = config.icon;
  const confidencePercent = Math.round((memory.confidence || 0.95) * 100);

  return (
    <div className={`p-4 rounded-xl border ${config.border} bg-white shadow-xs hover:shadow-sm transition-all`}>
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>

          {/* Genuine Hindsight Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            <Brain className="w-3 h-3 text-violet-600" />
            Hindsight Memory
          </span>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {confidencePercent}% confidence
        </span>
      </div>

      {/* Memory Fact */}
      <p className="text-sm font-medium text-slate-900 leading-relaxed mb-3">
        {memory.fact}
      </p>

      {/* Footer Metadata */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Learned: {memory.sourceDate || '2026-09-22'}
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          ID: {memory.hindsightMemoryId || memory.id}
        </span>
      </div>
    </div>
  );
}
