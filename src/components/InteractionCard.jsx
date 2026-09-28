import React from 'react';
import {
  Calendar,
  MessageSquare,
  PhoneCall,
  Mail,
  AlertCircle,
  FileCheck,
  Brain,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function InteractionCard({ interaction, index }) {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'REQUIREMENT':
        return { label: 'Requirement', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Layers };
      case 'COMPLAINT':
        return { label: 'Objection / Complaint', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: AlertCircle };
      case 'MEETING':
        return { label: 'Meeting', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar };
      case 'CALL':
        return { label: 'Phone Call', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: PhoneCall };
      case 'EMAIL':
        return { label: 'Email', bg: 'bg-sky-100 text-sky-800 border-sky-200', icon: Mail };
      case 'PROPOSAL':
        return { label: 'Proposal', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: FileCheck };
      default:
        return { label: 'Internal Note', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: MessageSquare };
    }
  };

  const badge = getTypeBadge(interaction.type);
  const Icon = badge.icon;
  const formattedDate = new Date(interaction.interactionDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative pl-6 pb-6 border-l-2 border-indigo-100 last:border-l-transparent last:pb-0">
      {/* Timeline Node Icon */}
      <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg}`}>
              <Icon className="w-3 h-3" />
              {badge.label}
            </span>

            {/* Hindsight ingestion confirmation */}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
              <Brain className="w-3 h-3 text-violet-600" />
              Retained in Hindsight
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {formattedDate}
          </span>
        </div>

        <p className="text-sm text-slate-800 font-normal leading-relaxed">
          {interaction.content}
        </p>
      </div>
    </div>
  );
}
