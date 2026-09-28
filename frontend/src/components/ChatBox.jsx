import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Brain,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ChatBox({ client, onSendMessage, loading, messages }) {
  const [input, setInput] = useState('');
  const [showComparisonForId, setShowComparisonForId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const samplePrompts = [
    `What are ${client?.name || 'Rahul'}'s main concerns?`,
    `Prepare me for tomorrow's meeting with ${client?.name || 'Rahul'}.`,
    `Create a revised proposal for ${client?.name || 'Rahul'}.`,
    `Tell me about ${client?.name || 'Rahul'}.`,
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[640px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              ClientPilot Relationship Agent
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full border border-violet-200">
                <Brain className="w-3 h-3 text-violet-600" />
                Hindsight Memory Active
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Reasoning over long-term episodic memories for <strong className="text-slate-700">{client?.name} ({client?.company})</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">
              Ask ClientPilot About {client?.name}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              ClientPilot checks Hindsight for client preferences, budget constraints, and past proposal feedback before answering.
            </p>

            {/* Quick Prompts */}
            <div className="w-full max-w-lg space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left mb-1.5">
                Suggested Demo Prompts:
              </p>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span>"{p}"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="space-y-2">
            {/* User Message */}
            {msg.role === 'user' && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[80%] text-sm font-medium shadow-xs">
                  {msg.content}
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* AI Agent Response */}
            {msg.role === 'assistant' && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="space-y-3 max-w-[88%]">
                  {/* Hindsight Memory Retrieval Pill */}
                  {msg.memoriesRetrieved && (
                    <div className="bg-violet-50 border border-violet-200/90 rounded-lg p-2.5 text-xs text-violet-900">
                      <div className="flex items-center justify-between font-bold mb-1.5">
                        <span className="flex items-center gap-1.5 text-violet-800">
                          <Brain className="w-3.5 h-3.5 text-violet-600" />
                          Hindsight Memory Search: {msg.memoriesRetrieved.length} relevant memories retrieved
                        </span>
                        <span className="text-[10px] bg-violet-200/70 text-violet-900 px-2 py-0.5 rounded-full font-semibold">
                          Verified
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {msg.memoriesRetrieved.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-violet-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                            title={m.fact}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-1.5"></span>
                            [{m.category}]: {m.fact.length > 55 ? m.fact.slice(0, 52) + '...' : m.fact}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 text-sm text-slate-800 leading-relaxed shadow-xs whitespace-pre-line font-normal">
                    {msg.content}
                  </div>

                  {/* Hackathon Judge Comparison: Memory vs Stateless LLM */}
                  {msg.withoutMemoryComparison && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          setShowComparisonForId(
                            showComparisonForId === index ? null : index
                          )
                        }
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {showComparisonForId === index
                          ? 'Hide Memory Comparison'
                          : 'Compare: How would a bot without Hindsight memory answer?'}
                      </button>

                      {showComparisonForId === index && (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs">
                          {/* Without Memory */}
                          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                            <span className="font-bold text-rose-800 block mb-1">
                              ❌ WITHOUT MEMORY (Generic / Stateless):
                            </span>
                            <p className="text-slate-700 italic">
                              "{msg.withoutMemoryComparison}"
                            </p>
                            <p className="mt-2 text-[10px] text-rose-700 font-semibold">
                              Flaw: Disregards ₹2L budget, misses WhatsApp requirement, repeats rejected price.
                            </p>
                          </div>

                          {/* With Hindsight Memory */}
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                            <span className="font-bold text-emerald-800 block mb-1">
                              ✅ WITH HINDSIGHT MEMORY (ClientPilot):
                            </span>
                            <p className="text-slate-800 font-medium">
                              Honors ₹2L ceiling, includes WhatsApp tracking, avoids previous costly mistake.
                            </p>
                            <p className="mt-2 text-[10px] text-emerald-700 font-semibold">
                              Result: High client trust & customized commercial alignment.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Loading State */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-2 max-w-sm">
              <div className="flex items-center gap-2 font-semibold text-violet-700">
                <Brain className="w-4 h-4 text-violet-600 animate-pulse" />
                <span>Retrieving relevant memories from Hindsight...</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Searching client memory vectors and synthesizing response with Gemini...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ClientPilot about ${client?.name || 'this client'} (e.g. 'What are his main concerns?')...`}
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
