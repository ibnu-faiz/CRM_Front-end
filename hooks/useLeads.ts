// hooks/useLeads.ts
import { useState, useEffect } from 'react';
import { leadsApi, UpdateLeadData, getLeadsByStatus } from '@/lib/api/leads';
import { toast } from 'sonner';
import { Lead, LeadStatus, CreateLeadData } from '@/lib/types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAll();
      setLeads(data.leads);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return { leads, loading, error, refetch: fetchLeads };
}

export function useLeadsByStatus(showArchived: boolean = false) {
  const [grouped, setGrouped] = useState<Record<LeadStatus, Lead[]>>({} as Record<LeadStatus, Lead[]>);
  const [stats, setStats] = useState<Array<{ status: LeadStatus; count: number; totalValue: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadsByStatus = async () => {
    try {
      setLoading(true);
      // 2. KIRIM PARAMETER KE API
      const data = await getLeadsByStatus(showArchived);
      
      setGrouped(data.grouped);
      setStats(data.stats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // toast.error('Failed to load leads'); // Opsional, biar gak spam error saat loading awal
    } finally {
      setLoading(false);
    }
  };

  // 3. REFRESH SAAT showArchived BERUBAH
  useEffect(() => {
    fetchLeadsByStatus();
  }, [showArchived]);

  
  const createLead = async (data: CreateLeadData) => {
    try {
      const result = await leadsApi.create(data);
      toast.success(result.message);
      await fetchLeadsByStatus(); // Refresh data
      return result.lead;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
      throw err;
    }
  };

  const updateLead = async (id: string, data: UpdateLeadData) => {
    try {
      const result = await leadsApi.update(id, data);
      toast.success(result.message);
      await fetchLeadsByStatus(); // Refresh data
      return result.lead;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update lead');
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const result = await leadsApi.delete(id);
      toast.success(result.message);
      await fetchLeadsByStatus(); // Refresh data
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete lead');
      throw err;
    }
  };

  return {
    grouped,
    stats,
    loading,
    error,
    refetch: fetchLeadsByStatus,
    createLead,
    updateLead,
    deleteLead,
  };
}