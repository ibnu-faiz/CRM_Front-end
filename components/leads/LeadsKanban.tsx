// components/leads/LeadsKanban.tsx
'use client';

import LeadCard from './LeadCard';
import { Plus } from 'lucide-react';

const stages = [
  {
    id: 'lead-in',
    title: 'Lead In',
    value: 'IDR 30.000',
    count: 2,
    color: 'bg-gray-100',
  },
  {
    id: 'contact-made',
    title: 'Contact Made',
    value: 'IDR 0',
    count: 2,
    color: 'bg-gray-100',
  },
  {
    id: 'need-identified',
    title: 'Need Identified',
    value: 'IDR 30.000',
    count: 2,
    color: 'bg-gray-100',
  },
  {
    id: 'proposal-made',
    title: 'Proposal Made',
    value: 'IDR 30.000',
    count: 1,
    color: 'bg-gray-100',
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    value: 'IDR 30.000',
    count: 1,
    color: 'bg-gray-100',
  },
  {
    id: 'contract-send',
    title: 'Contract Send',
    value: 'IDR 30.000',
    count: 1,
    color: 'bg-gray-100',
  },
  {
    id: 'won',
    title: 'Won',
    value: 'IDR 0',
    count: 0,
    color: 'bg-gray-100',
  },
  {
    id: 'lost',
    title: 'Lost',
    value: 'IDR 0',
    count: 0,
    color: 'bg-gray-100',
  },
];

const mockLeads = [
  {
    id: 1,
    title: 'Leads id 1',
    company: 'Company Name',
    value: 'IDR 1.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'lead-in',
  },
  {
    id: 2,
    title: 'Leads id 2',
    company: 'Company Name',
    value: 'IDR 20.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'lead-in',
  },
  {
    id: 3,
    title: 'Leads id 3',
    company: 'Company Name',
    value: 'IDR 3.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'need-identified',
  },
  {
    id: 4,
    title: 'Leads id 4',
    company: 'Company Name',
    value: 'IDR 4.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'need-identified',
  },
  {
    id: 5,
    title: 'Leads id 5',
    company: 'Company Name',
    value: 'IDR 5.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'proposal-made',
  },
  {
    id: 6,
    title: 'Leads id 6',
    company: 'Company Name',
    value: 'IDR 7.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'negotiation',
  },
  {
    id: 7,
    title: 'Leads id 7',
    company: 'Company Name',
    value: 'IDR 7.000',
    priority: 'High Priority',
    status: 'New Client',
    responsible: 'Responsible Team',
    stage: 'contract-send',
  },
];

export default function LeadsKanban() {
  return (
    <div className="flex gap-4 h-full pb-4">
      {stages.map((stage) => {
        const stageLeads = mockLeads.filter(lead => lead.stage === stage.id);
        
        return (
          <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col">
            {/* Stage Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-800">
                  <Plus className="w-3 h-3" />
                </button>
                <div>
                  <h3 className="font-semibold text-sm">{stage.title}</h3>
                  <p className="text-xs text-gray-500">
                    {stage.value} • {stage.count} Leads
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {stageLeads.length > 0 ? (
                stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  No leads in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}