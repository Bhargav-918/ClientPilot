import React, { useState } from 'react';
import {
  MessageSquare,
  Brain,
  Building2,
  Sparkles,
  Layers,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import ChatBox from '../components/ChatBox';
import MemoryPanel from '../components/MemoryPanel';

export default function Assistant({
  clients = [],
  selectedClientId,
  setSelectedClientId,
  messages = [],
  loading,
  onSendMessage,
  memories = [],
  hindsightStatus,
  healthData,
}) {
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
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

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Memory Inspector Panel */}
          <button
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              showMemoryPanel
                ? 'bg-violet-600 text-white border-violet-700 shadow-xs'
                : 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{showMemoryPanel ? 'Hide Memory Panel' : 'Inspect Hindsight Memories'}</span>
          </button>

          {/* Client context picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Conversing About:</span>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <ChatBox
        client={currentClient}
        onSendMessage={onSendMessage}
        loading={loading}
        messages={messages}
      />

      {/* Visible Memory Panel Section if toggled */}
      {showMemoryPanel && (
        <div className="pt-4 border-t border-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-600" />
              Active Memory Bank for {currentClient?.name} ({currentClient?.company})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing memories stored, retrieved, source touchpoints, and timestamps.
            </span>
          </div>
          <MemoryPanel
            clients={clients}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            memories={memories}
            hindsightStatus={hindsightStatus}
            healthData={healthData}
          />
        </div>
      )}
    </div>
  );
}
