import React from 'react';
import {
  MessageSquare,
  Brain,
  Building2,
  Sparkles,
} from 'lucide-react';
import ChatBox from '../components/ChatBox';

export default function Assistant({
  clients = [],
  selectedClientId,
  setSelectedClientId,
  messages = [],
  loading,
  onSendMessage,
}) {
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            AI Client Relationship Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interacts using contextual memories retrieved dynamically from Hindsight.
          </p>
        </div>

        {/* Client context picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Conversing About:</span>
          <select
            value={selectedClientId || ''}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Interface */}
      <ChatBox
        client={currentClient}
        onSendMessage={onSendMessage}
        loading={loading}
        messages={messages}
      />
    </div>
  );
}
