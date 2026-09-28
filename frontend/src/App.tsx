// @ts-nocheck
/**
 * CLIENTPILOT: AI Client Relationship & Follow-up Agent
 * Hack With Hyderabad 3.0: "AI Agents That Learn Using Hindsight"
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Memory from './pages/Memory';
import Assistant from './pages/Assistant';
import DemoMode from './pages/DemoMode';
import ArchitectureDocs from './pages/ArchitectureDocs';
import NewInteractionModal from './components/NewInteractionModal';
import { api } from './services/api';
import { Brain } from 'lucide-react';

export interface ClientItem {
  id: string;
  name: string;
  company: string;
  industry: string;
  email?: string;
  phone?: string;
  project: string;
}

export interface InteractionItem {
  id: string;
  clientId: string;
  type: string;
  content: string;
  interactionDate: string;
}

export interface MemoryItem {
  id: string;
  clientId: string;
  category: string;
  fact: string;
  confidence?: number;
  sourceDate?: string;
  hindsightMemoryId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  memoriesRetrieved?: any[];
  withoutMemoryComparison?: string;
  reasoningTrace?: any;
}

export default function App() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [hindsightStatus, setHindsightStatus] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);

  // AI Operation States
  const [meetingData, setMeetingData] = useState<any>(null);
  const [meetingLoading, setMeetingLoading] = useState<boolean>(false);

  const [followUpData, setFollowUpData] = useState<any>(null);
  const [followUpLoading, setFollowUpLoading] = useState<boolean>(false);

  const [proposalData, setProposalData] = useState<any>(null);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initial load
  const loadAllData = async () => {
    try {
      const clientList: ClientItem[] = await api.getClients();
      setClients(clientList);

      const activeId = selectedClientId || (clientList.length > 0 ? clientList[0].id : null);
      if (activeId && !selectedClientId) {
        setSelectedClientId(activeId);
      }

      // Fetch interactions and memories for all clients
      let allInteractions: InteractionItem[] = [];
      let allMemories: MemoryItem[] = [];
      for (const c of clientList) {
        try {
          const cInteractions: InteractionItem[] = await api.getInteractions(c.id);
          const cMemories: MemoryItem[] = await api.getMemories(c.id);
          allInteractions = [...allInteractions, ...cInteractions];
          allMemories = [...allMemories, ...cMemories];
        } catch (e) {
          console.error(`Error loading data for ${c.id}:`, e);
        }
      }
      setInteractions(allInteractions);
      setMemories(allMemories);

      // Status & Health
      try {
        const [status, health] = await Promise.all([
          api.getHindsightStatus(),
          api.getHealth(),
        ]);
        setHindsightStatus(status);
        setHealthData(health);
      } catch (e) {
        console.warn('System status & health check error:', e);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Switch active client
  const handleSelectClient = (client: ClientItem) => {
    setSelectedClientId(client.id);
    setActivePage('client-details');
  };

  // Create Client
  const handleCreateClient = async (clientData: any) => {
    try {
      const created: ClientItem = await api.createClient(clientData);
      setClients((prev) => [...prev, created]);
      setSelectedClientId(created.id);
      showNotification(`Client ${created.name} created successfully.`);
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  // Create Interaction
  const handleCreateInteraction = async ({
    clientId,
    type,
    content,
    interactionDate,
  }: {
    clientId: string;
    type: string;
    content: string;
    interactionDate: string;
  }) => {
    try {
      const result = await api.createInteraction(clientId, { type, content, interactionDate });
      setInteractions((prev) => [...prev, result.interaction]);

      // Refresh memories
      const updatedMemories: MemoryItem[] = await api.getMemories(clientId);
      setMemories((prev) => [
        ...prev.filter((m) => m.clientId !== clientId),
        ...updatedMemories,
      ]);

      showNotification(`Interaction saved. Hindsight retained ${result.hindsightRetainedCount} memory blocks.`);
    } catch (err) {
      console.error('Failed to save interaction:', err);
    }
  };

  // AI Operations
  const handlePrepareMeeting = async (client?: ClientItem) => {
    const target = client || clients.find((c) => c.id === selectedClientId);
    if (!target) return;
    setMeetingLoading(true);
    try {
      const res = await api.prepareMeeting(target.id);
      setMeetingData(res);
      setSelectedClientId(target.id);
      setActivePage('client-details');
    } catch (err) {
      console.error('Failed to prepare meeting:', err);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleGenerateFollowUp = async (client?: ClientItem, tone = 'professional') => {
    const target = client || clients.find((c) => c.id === selectedClientId);
    if (!target) return;
    setFollowUpLoading(true);
    try {
      const res = await api.generateFollowUp(target.id, tone);
      setFollowUpData(res);
      setSelectedClientId(target.id);
      setActivePage('client-details');
    } catch (err) {
      console.error('Failed to generate follow up:', err);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleCreateProposal = async (client?: ClientItem) => {
    const target = client || clients.find((c) => c.id === selectedClientId);
    if (!target) return;
    setProposalLoading(true);
    try {
      const res = await api.generateProposal(target.id);
      setProposalData(res);
      setSelectedClientId(target.id);
      setActivePage('client-details');
    } catch (err) {
      console.error('Failed to generate proposal:', err);
    } finally {
      setProposalLoading(false);
    }
  };

  const handleSendChatMessage = async (msg: string) => {
    const targetId = selectedClientId || (clients.length > 0 ? clients[0].id : null);
    if (!targetId || !msg) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await api.chatWithAgent(targetId, msg);
      const botMsg: ChatMessage = {
        role: 'assistant',
        content: res.response,
        memoriesRetrieved: res.memoriesRetrieved,
        withoutMemoryComparison: res.withoutMemoryComparison,
        reasoningTrace: res.reasoningTrace,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error executing reasoning over client memory.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        hindsightStatus={hindsightStatus}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          clients={clients}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          hindsightStatus={hindsightStatus}
          healthData={healthData}
          onOpenNewInteraction={() => setIsInteractionModalOpen(true)}
          onOpenNewClient={() => setActivePage('clients')}
          onTriggerDemo={() => setActivePage('demo')}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
            <Brain className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              clients={clients}
              interactions={interactions}
              memories={memories}
              healthData={healthData}
              hindsightStatus={hindsightStatus}
              onSelectClient={handleSelectClient}
              onNavigatePage={setActivePage}
            />
          )}

          {activePage === 'clients' && (
            <Clients
              clients={clients}
              memories={memories}
              interactions={interactions}
              onSelectClient={handleSelectClient}
              onCreateClient={handleCreateClient}
              onPrepareMeeting={handlePrepareMeeting}
              onGenerateFollowUp={handleGenerateFollowUp}
              onCreateProposal={handleCreateProposal}
              onAskAI={(c: ClientItem) => {
                setSelectedClientId(c.id);
                setActivePage('assistant');
              }}
            />
          )}

          {activePage === 'client-details' && currentClient && (
            <ClientDetails
              client={currentClient}
              interactions={interactions}
              memories={memories}
              onBack={() => setActivePage('clients')}
              onAddInteractionClick={() => setIsInteractionModalOpen(true)}
              onPrepareMeeting={handlePrepareMeeting}
              onGenerateFollowUp={handleGenerateFollowUp}
              onCreateProposal={handleCreateProposal}
              meetingData={meetingData}
              meetingLoading={meetingLoading}
              followUpData={followUpData}
              followUpLoading={followUpLoading}
              proposalData={proposalData}
              proposalLoading={proposalLoading}
              chatMessages={chatMessages}
              chatLoading={chatLoading}
              onSendChatMessage={handleSendChatMessage}
            />
          )}

          {activePage === 'memory' && (
            <Memory
              clients={clients}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              memories={memories}
              onSearchMemories={(q: string) => {
                if (selectedClientId) {
                  api.searchMemories(selectedClientId, q);
                }
              }}
            />
          )}

          {activePage === 'assistant' && (
            <Assistant
              clients={clients}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              messages={chatMessages}
              loading={chatLoading}
              onSendMessage={handleSendChatMessage}
            />
          )}

          {activePage === 'demo' && (
            <DemoMode onRefreshGlobalState={loadAllData} />
          )}

          {activePage === 'architecture' && <ArchitectureDocs />}
        </main>
      </div>

      {/* New Interaction Modal */}
      <NewInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        clients={clients}
        selectedClientId={selectedClientId}
        onSubmit={handleCreateInteraction}
      />
    </div>
  );
}
