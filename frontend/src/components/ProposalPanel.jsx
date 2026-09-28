import React, { useState } from 'react';
import {
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export default function ProposalPanel({ client, proposalData, loading, onGenerate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!proposalData?.revisedProposal) return;
    navigator.clipboard.writeText(proposalData.revisedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Proposal Adaptation Studio
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Client: {client?.name} ({client?.company})
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Adaptive Proposal Generator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ClientPilot uses Hindsight to prevent repeating past rejected proposals (quotes exceeding ₹2L).
          </p>
        </div>

        <button
          onClick={handleCopy}
          disabled={!proposalData?.revisedProposal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Proposal' : 'Copy Revised Proposal'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <Brain className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            Synthesizing Adaptive Proposal with Hindsight...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Checking past rejection logs to enforce ₹2,00,000 budget cap and WhatsApp scope.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Adaptations Tag Bar */}
          {proposalData?.adaptationsMade && (
            <div className="p-4 bg-violet-50/80 border border-violet-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-violet-700" />
                Key Adaptations Enforced by Hindsight Memory:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {proposalData.adaptationsMade.map((a, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-800 bg-white p-2 rounded border border-violet-100 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hackathon Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Without Memory (Flawed standard approach) */}
            <div className="border-2 border-rose-200 bg-rose-50/30 rounded-xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-rose-200 text-rose-800">
                  <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Without Memory (Repeats Past Mistake)
                  </span>
                  <span className="text-[10px] bg-rose-200/80 px-2 py-0.5 rounded-full font-bold">
                    Stateless Bot
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed mt-3 bg-white/80 p-3.5 rounded-lg border border-rose-100">
                  {proposalData?.withoutMemoryComparison}
                </div>
              </div>

              <div className="p-3 bg-rose-100/70 border border-rose-300/80 rounded-lg text-[11px] text-rose-900 font-medium space-y-1">
                <span className="font-bold flex items-center gap-1 text-rose-950">
                  <AlertOctagon className="w-3.5 h-3.5" /> Fatal Rejection Risk:
                </span>
                <p>
                  Quotes ₹3.8L - ₹4.5L (client previously rejected this exact figure), ignores WhatsApp integration, and asks for 50% upfront without milestones.
                </p>
              </div>
            </div>

            {/* Right: With Hindsight Memory (ClientPilot) */}
            <div className="border-2 border-emerald-300 bg-emerald-50/30 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200 text-emerald-900">
                  <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    With Hindsight Memory (ClientPilot)
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                    Learned & Adapted
                  </span>
                </div>

                <div className="text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed mt-3 bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                  {proposalData?.revisedProposal}
                </div>
              </div>

              <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-lg text-[11px] text-emerald-950 font-medium space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Guaranteed Alignment:
                </span>
                <p>
                  Fixed at ₹1,90,000 (safely inside ₹2L cap), features WhatsApp Business automation as a core module, and provides 3 milestone stages.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
