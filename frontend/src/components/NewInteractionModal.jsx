import React, { useState } from 'react';
import { X, Brain, PlusCircle } from 'lucide-react';

export default function NewInteractionModal({
  isOpen,
  onClose,
  clients = [],
  selectedClientId,
  onSubmit,
}) {
  const [clientId, setClientId] = useState(selectedClientId || clients[0]?.id || '');
  const [type, setType] = useState('NOTE');
  const [content, setContent] = useState('');
  const [interactionDate, setInteractionDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !clientId) return;

    onSubmit({
      clientId,
      type,
      content,
      interactionDate: new Date(interactionDate).toISOString(),
    });

    setContent('');
    onClose();
  };

  const sampleInputs = [
    { label: 'Requirement', text: 'Client requested an e-commerce catalog for fresh produce.' },
    { label: 'Budget Cap', text: 'Client emphasized that the budget must stay strictly under ₹2 lakh.' },
    { label: 'Preference', text: 'Client prefers WhatsApp automated notifications for customer tracking.' },
    { label: 'Objection', text: 'Client rejected the previous proposal because implementation cost was quoted too high.' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Log New Client Interaction
              </h3>
              <p className="text-xs text-slate-500">
                Automatically ingested into Hindsight Long-term Memory
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Client *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company} ({c.project})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interaction Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="NOTE">Internal Note</option>
                <option value="MEETING">Meeting</option>
                <option value="CALL">Phone Call</option>
                <option value="EMAIL">Email</option>
                <option value="REQUIREMENT">Requirement</option>
                <option value="COMPLAINT">Complaint / Objection</option>
                <option value="PROPOSAL">Proposal Touchpoint</option>
                <option value="FOLLOW_UP">Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={interactionDate}
                onChange={(e) => setInteractionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interaction Content / Notes *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Rahul stated he rejected our previous proposal because implementation cost was too high..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
          </div>

          {/* Quick text presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Quick Test Inputs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleInputs.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setContent(sample.text)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 flex items-center gap-2 text-xs text-violet-900 font-medium">
            <Brain className="w-4 h-4 text-violet-600 shrink-0" />
            <span>
              Saving this interaction will automatically trigger the Hindsight Retain pipeline.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Save & Retain in Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
