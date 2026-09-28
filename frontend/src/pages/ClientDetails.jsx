import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Send,
  FileText,
  MessageSquare,
  Brain,
  PlusCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowLeft,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import InteractionCard from '../components/InteractionCard';
import MemoryCard from '../components/MemoryCard';
import MeetingBrief from '../components/MeetingBrief';
import FollowUpPanel from '../components/FollowUpPanel';
import ProposalPanel from '../components/ProposalPanel';
import ChatBox from '../components/ChatBox';

export default function ClientDetails({
  client,
  interactions = [],
  memories = [],
  onBack,
  onAddInteractionClick,
  onPrepareMeeting,
  onGenerateFollowUp,
  onCreateProposal,
  meetingData,
  meetingLoading,
  followUpData,
  followUpLoading,
  proposalData,
  proposalLoading,
  chatMessages,
  chatLoading,
  onSendChatMessage,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const clientInteractions = interactions
    .filter((i) => i.clientId === client.id)
    .sort((a, b) => new Date(a.interactionDate).getTime() - new Date(b.interactionDate).getTime());

  const clientMemories = memories.filter((m) => m.clientId === client.id);

  const preferences = clientMemories.filter((m) => m.category === 'PREFERENCE');
  const budgetConstraints = clientMemories.filter((m) => m.category === 'BUDGET_CONSTRAINT');
  const objections = clientMemories.filter((m) => m.category === 'OBJECTION_OUTCOME');

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700">{client.name}</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {client.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {client.project}
            </span>
          </div>

          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <strong className="text-slate-800">{client.company}</strong>
            <span className="text-slate-300">•</span>
            <span>{client.industry}</span>
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span>Email: <strong className="text-slate-700">{client.email || 'N/A'}</strong></span>
            <span>Phone: <strong className="text-slate-700">{client.phone || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Quick AI Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('meeting');
              onPrepareMeeting(client);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Prepare Meeting</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('followup');
              onGenerateFollowUp(client);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Follow-up</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('proposal');
              onCreateProposal(client);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Proposal</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        {[
          { id: 'overview', label: 'Timeline & Overview' },
          { id: 'memory', label: `Hindsight Memory Bank (${clientMemories.length})` },
          { id: 'meeting', label: 'Meeting Brief' },
          { id: 'followup', label: 'Follow-up Draft' },
          { id: 'proposal', label: 'Revised Proposal' },
          { id: 'chat', label: 'Agent Chat' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 relative transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Timeline & Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline of interactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Interactions Timeline ({clientInteractions.length})
              </h3>
              <button
                onClick={onAddInteractionClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Interaction</span>
              </button>
            </div>

            <div className="pt-2">
              {clientInteractions.map((item, index) => (
                <InteractionCard key={item.id} interaction={item} index={index} />
              ))}
            </div>
          </div>

          {/* Memory Summary Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-violet-600" />
                  Learned Memory Highlights
                </h4>
                <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                  Hindsight
                </span>
              </div>

              {/* Preferences */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Learned Preferences:
                </span>
                {preferences.length > 0 ? (
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {preferences.map((p) => (
                      <li key={p.id}>{p.fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">None logged yet.</p>
                )}
              </div>

              {/* Budget constraints */}
              <div>
                <span className="text-xs font-bold text-rose-700 block mb-1">
                  Budget Ceiling:
                </span>
                {budgetConstraints.length > 0 ? (
                  <ul className="text-xs text-rose-900 font-semibold space-y-1 list-disc list-inside">
                    {budgetConstraints.map((b) => (
                      <li key={b.id}>{b.fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">None logged yet.</p>
                )}
              </div>

              {/* Objections */}
              <div>
                <span className="text-xs font-bold text-amber-800 block mb-1">
                  Past Objections & Rejections:
                </span>
                {objections.length > 0 ? (
                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                    {objections.map((o) => (
                      <li key={o.id}>{o.fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">None logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Memory Bank */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-xl flex items-center justify-between text-xs text-violet-900">
            <span className="flex items-center gap-2 font-medium">
              <Brain className="w-4 h-4 text-violet-600" />
              Showing all episodic memory blocks retained in Hindsight for <strong>{client.name} ({client.company})</strong>.
            </span>
            <span className="font-mono text-[11px] font-bold text-violet-800">
              Namespace: bank_{client.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientMemories.map((mem) => (
              <MemoryCard key={mem.id} memory={mem} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Meeting Brief */}
      {activeTab === 'meeting' && (
        <MeetingBrief
          client={client}
          briefData={meetingData}
          loading={meetingLoading}
          onRegenerate={() => onPrepareMeeting(client)}
        />
      )}

      {/* Tab 4: Follow-up */}
      {activeTab === 'followup' && (
        <FollowUpPanel
          client={client}
          followUpData={followUpData}
          loading={followUpLoading}
          onGenerate={(tone) => onGenerateFollowUp(client, tone)}
        />
      )}

      {/* Tab 5: Proposal */}
      {activeTab === 'proposal' && (
        <ProposalPanel
          client={client}
          proposalData={proposalData}
          loading={proposalLoading}
          onGenerate={() => onCreateProposal(client)}
        />
      )}

      {/* Tab 6: Chat */}
      {activeTab === 'chat' && (
        <ChatBox
          client={client}
          onSendMessage={onSendChatMessage}
          loading={chatLoading}
          messages={chatMessages}
        />
      )}
    </div>
  );
}
