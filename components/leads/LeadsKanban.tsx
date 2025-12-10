'use client';

import { useState } from 'react';
import LeadCard from './LeadCard';
import LeadListItem from './LeadListItem';
import { Plus } from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { UpdateLeadData } from '@/lib/api/leads';

interface LeadsKanbanProps {
  grouped: Record<string, Lead[]>; 
  stats: Array<{ status: string; count: number; totalValue: number }>;
  loading: boolean;
  onUpdateLead: (id: string, data: UpdateLeadData) => Promise<any>;
  onArchiveLead: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

const stageConfig = [
  { id: LeadStatus.LEAD_IN, title: 'Lead In', color: 'bg-gray-100', iconColor: 'bg-gray-500' },
  { id: LeadStatus.CONTACT_MADE, title: 'Contact Made', color: 'bg-blue-100', iconColor: 'bg-blue-500' },
  { id: LeadStatus.NEED_IDENTIFIED, title: 'Need Identified', color: 'bg-purple-100', iconColor: 'bg-purple-500' },
  { id: LeadStatus.PROPOSAL_MADE, title: 'Proposal Made', color: 'bg-yellow-100', iconColor: 'bg-yellow-500' },
  { id: LeadStatus.NEGOTIATION, title: 'Negotiation', color: 'bg-orange-100', iconColor: 'bg-orange-500' },
  { id: LeadStatus.CONTRACT_SEND, title: 'Contract Send', color: 'bg-pink-100', iconColor: 'bg-pink-500' },
  { id: LeadStatus.WON, title: 'Won', color: 'bg-green-100', iconColor: 'bg-green-500' },
  { id: LeadStatus.LOST, title: 'Lost', color: 'bg-red-100', iconColor: 'bg-red-500' },
];

export default function LeadsKanban({ 
  grouped, 
  stats, 
  loading, 
  onUpdateLead, 
  onArchiveLead, 
  viewMode = 'grid' 
}: LeadsKanbanProps) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('leadId');
    const currentStatus = e.dataTransfer.getData('leadStatus');
    
    if (!leadId || currentStatus === newStatus) return;
    
    try {
      await onUpdateLead(leadId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex gap-6 h-full pb-4 overflow-x-auto px-6">
        {stageConfig.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="h-[72px] bg-white rounded-xl border border-gray-200 animate-pulse" />
            <div className="flex-1 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="w-full h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // LIST VIEW
  if (viewMode === 'list') {
    const allLeads = Object.values(grouped).flat();
    
    return (
      <div className="px-6 pb-20">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 px-8 py-4">
            <div className="grid grid-cols-12 gap-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <div className="col-span-3">Lead Details</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Value</div>
              <div className="col-span-2">Priority & Label</div>
              <div className="col-span-2">Due Date & Team</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {allLeads.length > 0 ? (
              allLeads.map((lead) => (
                <LeadListItem 
                  key={lead.id} 
                  lead={lead} 
                  onArchive={onArchiveLead}
                />
              ))
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">No leads found</h3>
                <p className="text-sm text-gray-500">Start by adding your first lead to begin tracking</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW (KANBAN) - DEFAULT
  return (
    <div className="flex gap-6 pb-20 min-w-max px-1 items-stretch">
      {stageConfig.map((stage) => {
        const stageLeads = grouped[stage.id] || [];
        const stageStat = stats.find(s => s.status === stage.id);
        const isDragOver = dragOverStage === stage.id;
        
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 flex flex-col gap-4 relative"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id as LeadStatus)}
          >
            {/* HEADER */}
            <div className="sticky top-0 z-10">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="font-bold text-base text-gray-900">{stage.title}</h2>
                    <p className="text-[12px] text-gray-500 font-medium">
                      IDR {(stageStat?.totalValue || 0).toLocaleString('id-ID')} • {stageStat?.count || 0} Leads
                    </p>
                  </div>
                  
                </div>
                <div className={`p-1.5 rounded-full ${stage.iconColor} text-white`}>
                    <Plus className="w-3 h-3" />
                  </div>
              </div>
              <div className="h-4 bg-gradient-to-b from-gray-50/50 to-transparent -mb-4 pointer-events-none" />
            </div>

            {/* CARDS */}
            <div 
              className={`flex-1 flex flex-col space-y-3 pr-1 transition-all duration-200 rounded-lg min-h-[150px] h-full
                ${isDragOver 
                  ? 'bg-blue-50 ring-2 ring-blue-400 ring-offset-2 border-blue-200' 
                  : 'border-transparent'
                }
              `}
            >
              {stageLeads.length > 0 ? (
                stageLeads.map((lead) => (
                  <LeadCard 
                    key={lead.id} 
                    lead={lead} 
                    onArchive={onArchiveLead}
                  />
                ))
              ) : (
                <div className={`flex flex-col items-center justify-center flex-1 min-h-[150px] text-xs border-2 border-dashed rounded-xl transition-colors
                  ${isDragOver 
                    ? 'border-blue-300 bg-blue-100/50 text-blue-600' 
                    : 'border-gray-200 bg-gray-50/30 text-gray-400'
                  }
                `}>
                  {isDragOver ? 'Drop here' : 'No leads'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}