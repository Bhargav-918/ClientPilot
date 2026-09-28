import React from 'react';
import {
  Building2,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Brain,
  FileText,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function ClientCard({
  client,
  memories = [],
  interactions = [],
  onSelect,
  onPrepareMeeting,
  onGenerateFollowUp,
  onCreateProposal,
  onAskAI,
}) {
  const preferences = memories.filter((m) => m.category === 'PREFERENCE');
  const budgetConstraints = memories.filter((m) => m.category === 'BUDGET_CONSTRAINT');
  const objections = memories.filter((m) => m.category === 'OBJECTION_OUTCOME');

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Info */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              {client.name}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{client.company}</span>
              <span className="text-slate-300">•</span>
              <span>{client.industry}</span>
            </p>
          </div>
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {client.project}
          </span>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
          {client.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {client.phone}
            </span>
          )}
        </div>

        {/* Hindsight Memory Summary Section */}
        <div className="space-y-2 mb-4 bg-slate-50/80 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-violet-700">
              <Brain className="w-3.5 h-3.5" />
              Learned in Hindsight ({memories.length})
            </span>
          </div>

          {/* Preferences */}
          {preferences.length > 0 && (
            <div className="text-xs">
              <span className="font-semibold text-slate-600">Preferences: </span>
              <span className="text-slate-700">
                {preferences.map((p) => p.fact).join('; ')}
              </span>
            </div>
          )}

          {/* Budget & Concerns */}
          {(budgetConstraints.length > 0 || objections.length > 0) && (
            <div className="text-xs">
              <span className="font-semibold text-amber-700">Concerns & Objections: </span>
              <span className="text-slate-700">
                {[...budgetConstraints, ...objections].map((o) => o.fact).join('; ')}
              </span>
            </div>
          )}

          {memories.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No Hindsight memories captured yet. Add an interaction to train the agent.
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onPrepareMeeting(client)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Prepare Meeting</span>
        </button>

        <button
          onClick={() => onGenerateFollowUp(client)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Follow-up</span>
        </button>

        <button
          onClick={() => onCreateProposal(client)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Create Proposal</span>
        </button>

        <button
          onClick={() => onAskAI(client)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
}
