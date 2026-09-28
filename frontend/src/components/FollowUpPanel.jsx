import React, { useState } from 'react';
import {
  Send,
  Brain,
  Copy,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

export default function FollowUpPanel({ client, followUpData, loading, onGenerate }) {
  const [tone, setTone] = useState('professional');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!followUpData?.followUpMessage) return;
    navigator.clipboard.writeText(followUpData.followUpMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            Client Follow-Up Generator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Uses Hindsight memories to address past feedback, budget sensitivity, and WhatsApp preference.
          </p>
        </div>

        {/* Tone Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Tone:</span>
          {['professional', 'warm', 'direct'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                onGenerate(t);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                tone === t
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Message Display */}
      {loading ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <Brain className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            Crafting follow-up respecting ₹2L budget cap and WhatsApp priority...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="p-5 bg-slate-50/90 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 whitespace-pre-line leading-relaxed">
              {followUpData?.followUpMessage || 'Click generate to craft a follow-up message.'}
            </div>

            <button
              onClick={handleCopy}
              disabled={!followUpData?.followUpMessage}
              className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Message'}</span>
            </button>
          </div>

          {/* Rationale explanation */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Brain className="w-3.5 h-3.5 text-emerald-700" />
              Why this message is effective (Hindsight Inferences):
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
              <li>Explicitly acknowledges previous cost objection without defensiveness.</li>
              <li>Reassures client that ₹2 lakh budget ceiling is 100% honored.</li>
              <li>Affirms that WhatsApp order tracking integration remains part of the scope.</li>
              <li>Offers phased milestone payments to rebuild commercial confidence.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
