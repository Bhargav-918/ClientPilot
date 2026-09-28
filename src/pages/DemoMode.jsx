import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Brain,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Coins,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api } from '../services/api';

export default function DemoMode({ clients = [], selectedClientId, setSelectedClientId, onRefreshGlobalState }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);

  const activeClient = (selectedClientId ? clients.find(c => c.id === selectedClientId) : null) || clients[0];

  const stepsConfig = activeClient ? [
    {
      step: 1,
      day: 'Step 1',
      title: 'Initial Scope Verification',
      input: `${activeClient.name} from ${activeClient.company} wants to discuss ${activeClient.project}.`,
      description: 'First touchpoint. The agent logs core project scope into client memory bank.',
      memoryType: 'REQUIREMENT',
    },
    {
      step: 2,
      day: 'Step 2',
      title: 'Preferences & Constraints Verification',
      input: `${activeClient.name} communicates preferences and budget constraints for ${activeClient.project}.`,
      description: 'Extracts communication channels, delivery expectations, and financial ceilings.',
      memoryType: 'PREFERENCE & BUDGET_CONSTRAINT',
    },
    {
      step: 3,
      day: 'Step 3',
      title: 'Objection & Past Feedback Tracking',
      input: `${activeClient.name} provides past proposal feedback or objections.`,
      description: 'Captures past commercial objections to prevent repeating unaligned proposals.',
      memoryType: 'OBJECTION_OUTCOME',
    },
    {
      step: 4,
      day: 'Step 4',
      title: `Query: What are ${activeClient.name}'s main concerns?`,
      input: `What are ${activeClient.name}'s main concerns and constraints?`,
      description: 'Hindsight retrieves verified semantic memories and responds with grounded constraints.',
      memoryType: 'RECALL & REASON',
    },
    {
      step: 5,
      day: 'Step 5',
      title: 'Prepare Strategic Meeting Brief',
      input: `Prepare me for tomorrow's meeting with ${activeClient.name}.`,
      description: 'Generates structured brief warning against pricing pitfalls and channel misalignment.',
      memoryType: 'SYNTHESIS & PITFALL CHECK',
    },
    {
      step: 6,
      day: 'Step 6',
      title: 'Generate Revised Proposal',
      input: `Create a revised proposal for ${activeClient.name}.`,
      description: 'Adapts proposal: honors recorded budget caps, respects preferences, sets milestones.',
      memoryType: 'ADAPTIVE OUTPUT',
    },
  ] : [];

  const executeStep = async (stepNum) => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await api.runDemoStep(stepNum, activeClient.id);
      setStepData((prev) => ({ ...prev, [stepNum]: res }));
      setCurrentStep(stepNum);
      if (onRefreshGlobalState) onRefreshGlobalState();
    } catch (err) {
      console.error('Demo step failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCompleteDemo = async () => {
    if (!activeClient) return;
    setIsRunningAll(true);
    setStepData({});
    setCurrentStep(0);

    for (let i = 1; i <= 6; i++) {
      await executeStep(i);
      await new Promise((r) => setTimeout(r, 1200));
    }
    setIsRunningAll(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetDemo(activeClient?.id);
      setStepData({});
      setCurrentStep(0);
      if (onRefreshGlobalState) onRefreshGlobalState();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeClient) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 bg-white rounded-2xl border border-slate-200 p-8">
        <Brain className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No clients yet. Create your first client.</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The memory learning test suite operates dynamically on real client memory banks stored in PostgreSQL 18 and Hindsight. Create a client first to run verification tests.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cognitive Learning Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Challenge: AI Agents That Learn Using Hindsight
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Client Learning Journey: {activeClient.name} ({activeClient.company})
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Watch ClientPilot evolve in real-time. Notice how the agent transitions from a generic assistant into a hyper-personalized partner that respects hard budget constraints and never repeats a rejected pitch.
          </p>
        </div>

        {/* Action Controls & Client Picker */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {clients.length > 1 && (
            <select
              value={activeClient.id}
              onChange={(e) => setSelectedClientId && setSelectedClientId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleReset}
            disabled={loading || isRunningAll}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Evaluation</span>
          </button>

          <button
            onClick={handleRunCompleteDemo}
            disabled={loading || isRunningAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Play className={`w-4 h-4 fill-slate-950 ${isRunningAll ? 'animate-spin' : ''}`} />
            <span>{isRunningAll ? 'Executing...' : 'Run Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-between text-xs text-violet-900 font-semibold">
        <span className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-600" />
          The Cognitive Loop: <strong>REMEMBER → RETRIEVE → REASON → ADAPT → ACT</strong>
        </span>
        <span className="text-slate-500 font-normal">
          Click any step below to inspect its individual memory operation
        </span>
      </div>

      {/* Step by Step Timeline Cards */}
      <div className="space-y-4">
        {stepsConfig.map((s) => {
          const isDone = currentStep >= s.step;
          const isCurrent = currentStep === s.step;
          const data = stepData[s.step];

          return (
            <div
              key={s.step}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/10'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 bg-white/70'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {s.day}
                      </span>
                      <span className="text-slate-300">•</span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {s.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {s.memoryType}
                  </span>

                  <button
                    onClick={() => executeStep(s.step)}
                    disabled={loading || isRunningAll}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                  >
                    {data ? 'Re-run Step' : `Run Step ${s.step}`}
                  </button>
                </div>
              </div>

              {/* Step Execution Details */}
              <div className="p-5 space-y-3">
                {/* Input Query / Note */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-slate-500 uppercase tracking-wide block text-[10px] mb-1">
                    Input Touchpoint / User Request:
                  </span>
                  <span className="font-mono text-slate-900 font-medium">"{s.input}"</span>
                </div>

                {/* If step has data rendered */}
                {data && (
                  <div className="p-4 bg-violet-50/60 rounded-xl border border-violet-200 space-y-3 text-xs">
                    {/* Operation */}
                    <div className="flex items-center gap-2 text-violet-900 font-bold">
                      <Brain className="w-4 h-4 text-violet-700" />
                      <span>Hindsight Operation: {data.hindsightAction}</span>
                    </div>

                    {/* Step 1-3 Memory Storage feedback */}
                    {data.memoryStored && (
                      <div className="p-2.5 bg-white rounded-lg border border-violet-100 text-slate-800 font-medium">
                        <strong>Memory Logged into Bank: </strong>
                        {data.memoryStored}
                      </div>
                    )}

                    {/* Visible Memory Provenance Panel */}
                    <div className="p-3 bg-white rounded-xl border border-violet-200/90 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold pb-1.5 border-b border-slate-100">
                        <span className="flex items-center gap-1.5 text-violet-800">
                          <Brain className="w-3.5 h-3.5 text-violet-600" />
                          Hindsight Memory Audit Record
                        </span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-violet-100 text-violet-800 border border-violet-200 font-semibold">
                          Source: {data.memorySource || 'Hindsight Memory Engine'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px]">Client Associated:</span>
                          <span className="font-semibold text-slate-900">{data.clientAssociated || `${activeClient.name} (${activeClient.company})`}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block text-[10px]">Date / Time Recorded:</span>
                          <span className="font-mono text-slate-800">{data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}</span>
                        </div>
                        {data.memoryStored && (
                          <div className="col-span-full">
                            <span className="text-slate-400 font-semibold block text-[10px]">Memory Stored:</span>
                            <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 block mt-0.5">
                              {data.memoryStored}
                            </span>
                          </div>
                        )}
                        {data.retrievedMemories && data.retrievedMemories.length > 0 && (
                          <div className="col-span-full space-y-1">
                            <span className="text-slate-400 font-semibold block text-[10px]">Memories Retrieved from Hindsight ({data.retrievedMemories.length}):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {data.retrievedMemories.map((rm, idx) => (
                                <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded shadow-2xs">
                                  <strong className="text-violet-700">[{rm.category}]</strong> {rm.fact}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Side-by-side comparison */}
                    {s.step === 4 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                          <span className="font-bold text-rose-800 block mb-1">
                            ❌ WITHOUT MEMORY (Vanilla AI):
                          </span>
                          <p className="text-slate-700 italic">
                            "{data.aiOutputWithoutHindsight}"
                          </p>
                          <p className="text-[10px] text-rose-700 font-semibold mt-2">
                            Ignores client constraints, misses preferred channels, unaware of past feedback.
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <span className="font-bold text-emerald-800 block mb-1">
                            ✅ WITH HINDSIGHT MEMORY (ClientPilot):
                          </span>
                          <p className="text-slate-800 font-semibold">
                            "{data.aiOutputWithHindsight}"
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold mt-2">
                            Retrieved cognitive memory vectors. Directly cites recorded client constraints and preferences!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Meeting Brief Preview */}
                    {s.step === 5 && data.briefOverview && (
                      <div className="p-3 bg-white rounded-lg border border-violet-100 space-y-1">
                        <div className="font-bold text-slate-900">
                          Strategic Brief Synthesized:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                          <li><strong>Client:</strong> {data.briefOverview.client}</li>
                          <li><strong>Budget Limit:</strong> {data.briefOverview.budgetCeiling}</li>
                          <li><strong>WhatsApp Integration:</strong> {data.briefOverview.priorityPreference}</li>
                          <li className="text-rose-700 font-semibold"><strong>Critical Pitfall:</strong> {data.briefOverview.pitfallAvoidance}</li>
                        </ul>
                      </div>
                    )}

                    {/* Step 6: Revised Proposal Adaptation */}
                    {s.step === 6 && (
                      <div className="p-3 bg-white rounded-lg border border-violet-100 space-y-1">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Proposal Adaptation Success:
                        </div>
                        <p className="text-slate-800 font-medium text-[11px]">
                          {data.resultSummary}
                        </p>
                        <p className="text-emerald-700 font-semibold text-[11px]">
                          Prevented Failure: {data.mistakeAvoided}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
