/**
 * API Service for ClientPilot
 * Connects frontend to the application backend
 */

const BASE_URL = '/api';

export const api = {
  // Clients
  async getClients() {
    const res = await fetch(`${BASE_URL}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  async getClient(id) {
    const res = await fetch(`${BASE_URL}/clients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch client');
    return res.json();
  },

  async createClient(clientData) {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
  },

  // Interactions
  async getInteractions(clientId) {
    const res = await fetch(`${BASE_URL}/clients/${clientId}/interactions`);
    if (!res.ok) throw new Error('Failed to fetch interactions');
    return res.json();
  },

  async createInteraction(clientId, interactionData) {
    const res = await fetch(`${BASE_URL}/clients/${clientId}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interactionData),
    });
    if (!res.ok) throw new Error('Failed to create interaction');
    return res.json();
  },

  // Hindsight Memory
  async getMemories(clientId) {
    const res = await fetch(`${BASE_URL}/clients/${clientId}/memories`);
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },

  async getAllMemories() {
    const res = await fetch(`${BASE_URL}/memories`);
    if (!res.ok) throw new Error('Failed to fetch all memories');
    return res.json();
  },

  async getRetrievedMemories() {
    const res = await fetch(`${BASE_URL}/memories/retrieved`);
    if (!res.ok) throw new Error('Failed to fetch retrieved memory logs');
    return res.json();
  },

  async searchMemories(clientId, query) {
    const res = await fetch(`${BASE_URL}/clients/${clientId}/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to search memories');
    return res.json();
  },

  // Health & Dashboard
  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getHindsightStatus() {
    const res = await fetch(`${BASE_URL}/hindsight/status`);
    if (!res.ok) throw new Error('Failed to fetch Hindsight status');
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to fetch health status');
    return res.json();
  },

  // AI Agent Operations
  async chatWithAgent(clientId, message) {
    const res = await fetch(`${BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, message }),
    });
    if (!res.ok) throw new Error('Failed to execute agent chat');
    return res.json();
  },

  async prepareMeeting(clientId) {
    const res = await fetch(`${BASE_URL}/agent/meeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    if (!res.ok) throw new Error('Failed to generate meeting brief');
    return res.json();
  },

  async generateFollowUp(clientId, tone = 'professional') {
    const res = await fetch(`${BASE_URL}/agent/followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, tone }),
    });
    if (!res.ok) throw new Error('Failed to generate follow-up');
    return res.json();
  },

  async generateProposal(clientId) {
    const res = await fetch(`${BASE_URL}/agent/proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    if (!res.ok) throw new Error('Failed to generate proposal');
    return res.json();
  },

  // Demo Mode Operations
  async resetDemo() {
    const res = await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo state');
    return res.json();
  },

  async runDemoStep(stepNumber) {
    const res = await fetch(`${BASE_URL}/demo/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepNumber }),
    });
    if (!res.ok) throw new Error('Failed to execute demo step');
    return res.json();
  },
};
