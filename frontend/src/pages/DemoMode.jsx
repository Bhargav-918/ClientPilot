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

export default function DemoMode({ onRefreshGlobalState }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);

  const stepsConfig = [
    {
      step: 1,
      day: 'Day 1',
      title: 'Initial Client Request',
      input: 'Rahul from GreenLeaf Foods wants an e-commerce website.',
      description: 'First touchpoint. The agent logs core project scope.',
      memoryType: 'REQUIREMENT',
    },
    {
      step: 2,
      day: 'Day 2',
      title: 'Preferences & Budget Cap Learned',
      input: 'Rahul wants WhatsApp integration and wants the project to stay within a budget of ₹2 lakh.',
      description: 'Extracts communication preference and critical financial limit.',
      memoryType: 'PREFERENCE & BUDGET_CONSTRAINT',
    },
    {
      step: 3,
      day: 'Day 3',
      title: 'Critical Past Proposal Rejection',
      input: 'Rahul rejected our previous proposal because the implementation cost was too high.',
      description: 'Captures past objection to prevent repeating costly pricing mistakes.',
      memoryType: 'OBJECTION_OUTCOME',
    },
    {
      step: 4,
      day: 'Day 4',
      title: 'Query: What are Rahul\'s main concerns?',
      input: 'What are Rahul\'s main concerns?',
      description: 'Hindsight retrieves memories and responds with nuanced concerns.',
      memoryType: 'RECALL & REASON',
    },
    {
      step: 5,
      day: 'Day 5',
      title: 'Prepare Strategic Meeting Brief',
      input: 'Prepare me for tomorrow\'s meeting with Rahul.',
      description: 'Generates structured brief warning against pricing over ₹2L.',
      memoryType: 'SYNTHESIS & PITFALL CHECK',
    },
    {
      step: 6,
      day: 'Day 10',
      title: 'Generate Revised Proposal',
      input: 'Create a revised proposal for Rahul.',
      description: 'Adapts proposal: respects ₹2L cap, includes WhatsApp, offers milestones.',
      memoryType: 'ADAPTIVE OUTPUT',
    },
  ];

  const executeStep = async (stepNum) => {
    setLoading(true);
    try {
      const res = await api.runDemoStep(stepNum);
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
    setIsRunningAll(true);
    setStepData({});
    setCurrentStep(0);

    for (let i = 1; i <= 6; i++) {
      await executeStep(i);
      // Brief pause between steps for visual clarity
      await new Promise((r) => setTimeout(r, 1400));
    }
    setIsRunningAll(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetDemo();
      setStepData({});
      setCurrentStep(0);
      if (onRefreshGlobalState) onRefreshGlobalState();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Hackathon Live Demo
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Challenge: AI Agents That Learn Using Hindsight
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Client Learning Journey: Rahul Sharma (GreenLeaf Foods)
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Watch ClientPilot evolve in real-time. Notice how the agent transitions from a generic bot into a hyper-personalized partner that respects hard budget constraints and never repeats a rejected pitch.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={loading || isRunningAll}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={handleRunCompleteDemo}
            disabled={loading || isRunningAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Play className={`w-4 h-4 fill-slate-950 ${isRunningAll ? 'animate-spin' : ''}`} />
            <span>{isRunningAll ? 'Executing Demo...' : 'Run Demo'}</span>
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
                            Misses budget, misses WhatsApp, unaware of past rejection.
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
                            Retrieved 4 memory vectors. Directly cites the ₹2L budget cap and WhatsApp priority!
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
