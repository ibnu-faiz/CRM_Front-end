// lib/api/leads.ts
import { apiClient } from './client';
import { CreateLeadData,
         LeadStatus,
         Lead,
 } from '../types';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UpdateLeadData extends Partial<CreateLeadData> {}

export interface LeadsByStatusResponse {
  grouped: Record<LeadStatus, Lead[]>;
  stats: Array<{
    status: LeadStatus;
    count: number;
    totalValue: number;
  }>;
}

// API versi axios (default)
export const leadsApi = {
  // Get all leads
  getAll: async (params?: { status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const response = await apiClient.get<{ leads: Lead[]; total: number }>(
      `/leads${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Get lead by ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ lead: Lead }>(`/leads/${id}`);
    return response.data.lead;
  },

  // Get leads grouped by status (for Kanban)
  getByStatus: async () => {
    const response = await apiClient.get<LeadsByStatusResponse>('/leads/by-status');
    return response.data;
  },

  // Create new lead
  create: async (data: CreateLeadData) => {
    const response = await apiClient.post<{ lead: Lead; message: string }>('/leads', data);
    return response.data;
  },

  // Update lead
  update: async (id: string, data: UpdateLeadData) => {
    const response = await apiClient.put<{ lead: Lead; message: string }>(`/leads/${id}`, data);
    return response.data;
  },

  // Delete lead
  delete: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/leads/${id}`);
    return response.data;
  },
};

// ===================================================================
// API versi fetch (untuk penggunaan langsung di browser dengan token)
// ===================================================================

// Get lead by ID
// Get lead by ID (with Authorization fix)
export async function getLeadById(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}/leads/${id}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch lead (${res.status})`);
  }

  return await res.json(); // langsung return data lead
}



// Update lead
export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update lead');
  }

  return response.json();
}

// Delete lead
export async function deleteLead(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete lead');
  }
}

export async function getLeadsByStatus(isArchived: boolean = false) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/leads/by-status?archived=${isArchived}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch leads by status');
  }

  return res.json();
}

