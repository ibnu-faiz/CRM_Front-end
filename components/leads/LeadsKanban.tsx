"use client";

import { useState } from "react";
import LeadCard from "./LeadCard";
import LeadListItem from "./LeadListItem";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Lead, LeadStatus } from "@/lib/types";
import { UpdateLeadData } from "@/lib/api/leads";

interface LeadsKanbanProps {
  grouped: Record<string, Lead[]>;
  stats: Array<{ status: string; count: number; totalValue: number }>;
  loading: boolean;
  onUpdateLead: (id: string, data: UpdateLeadData) => Promise<any>;
  onArchiveLead: (id: string) => void;
  viewMode?: "grid" | "list";
}

const stageConfig = [
  { id: LeadStatus.LEAD_IN, title: "Lead In", color: "bg-gray-100", iconColor: "bg-gray-500" },
  { id: LeadStatus.CONTACT_MADE, title: "Contact Made", color: "bg-blue-100", iconColor: "bg-blue-500" },
  { id: LeadStatus.NEED_IDENTIFIED, title: "Need Identified", color: "bg-purple-100", iconColor: "bg-purple-500" },
  { id: LeadStatus.PROPOSAL_MADE, title: "Proposal Made", color: "bg-yellow-100", iconColor: "bg-yellow-500" },
  { id: LeadStatus.NEGOTIATION, title: "Negotiation", color: "bg-orange-100", iconColor: "bg-orange-500" },
  { id: LeadStatus.CONTRACT_SEND, title: "Contract Send", color: "bg-pink-100", iconColor: "bg-pink-500" },
  { id: LeadStatus.WON, title: "Won", color: "bg-green-100", iconColor: "bg-green-500" },
  { id: LeadStatus.LOST, title: "Lost", color: "bg-red-100", iconColor: "bg-red-500" },
];

export default function LeadsKanban({
  grouped,
  stats,
  loading,
  onUpdateLead,
  onArchiveLead,
  viewMode = "grid",
}: LeadsKanbanProps) {
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    const newDate = new Date(historyDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setHistoryDate(newDate);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("leadId");
    const currentStatus = e.dataTransfer.getData("leadStatus");

    // Prevent dropping if it's same status
    if (!leadId || currentStatus === newStatus) return;

    try {
      await onUpdateLead(leadId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update lead status:", error);
    }
  };

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

  // --- LOGIC FILTER ---
  const getFilteredData = (stageId: string) => {
    let leads = grouped[stageId] || [];
    const isWonStage = stageId === 'WON';
    const isLostStage = stageId === 'LOST';
    const isCompletedStage = isWonStage || isLostStage;
    
    let totalValue = stats.find((s) => s.status === stageId)?.totalValue || 0;
    let count = stats.find((s) => s.status === stageId)?.count || 0;

    if (isCompletedStage) {
       leads = leads.filter(lead => {
          let dateString = null;
          if (isWonStage) dateString = lead.wonAt;
          else if (isLostStage) dateString = lead.lostAt;
          if (!dateString) dateString = lead.updatedAt; 

          const targetDate = new Date(dateString); 
          return (
             targetDate.getMonth() === historyDate.getMonth() && 
             targetDate.getFullYear() === historyDate.getFullYear()
          );
       });

       totalValue = leads.reduce((sum, item) => sum + (item.value || 0), 0);
       count = leads.length;
    }

    return { leads, isCompletedStage, totalValue, count };
  };

  // =========================================================
  // VIEW MODE: LIST
  // =========================================================
  if (viewMode === 'list') {
    return (
      <div className="px-1 pb-20 space-y-6"> 
        {stageConfig.map((stage) => {
          const { leads: leadsInGroup, isCompletedStage, totalValue, count } = getFilteredData(stage.id);
          const isDragOver = dragOverStage === stage.id;

          return (
            <div 
              key={stage.id} 
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id as LeadStatus)}
              className={`rounded-xl transition-all duration-200 ${
                isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
            >
              {/* HEADER LIST */}
              <div className="bg-white px-6 py-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${stage.iconColor || stage.color}`}></div>
                  <div>
                    <h2 className="font-bold text-base text-gray-900">{stage.title}</h2>
                    <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                      {/* ENGLISH: Currency & Month Name */}
                      IDR {totalValue.toLocaleString("en-US")} <span className="mx-1.5">•</span> {count} Leads
                    </p>
                  </div>
                </div>

                {isCompletedStage ? (
                   <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 shadow-sm gap-1">
                      <button className="p-1 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600" onClick={() => changeMonth(-1)} title="Previous Month">
                         <ChevronLeft className="w-4 h-4" />
                      </button>
                      {/* ENGLISH: Short Month (Jan, Feb) */}
                      <span className="text-xs font-bold text-gray-700 w-24 text-center select-none">
                         {historyDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <button className="p-1 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => changeMonth(1)} disabled={historyDate > new Date()} title="Next Month">
                         <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                ) : (
                   <div className={`p-1.5 rounded-full ${stage.iconColor} text-white shadow-sm opacity-80`}>
                      <Plus className="w-4 h-4" />
                   </div>
                )}
              </div>

              {/* BODY LIST */}
              <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 shadow-sm overflow-hidden min-h-[50px]">
                {leadsInGroup.length > 0 ? (
                  <>
                     <div className="bg-gray-50/50 px-6 py-2 border-y border-gray-100">
                        <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-4">Lead Details</div>
                            <div className="col-span-2">Value</div>
                            <div className="col-span-3">Priority & Client</div>
                            <div className="col-span-2">{isCompletedStage ? "Date Closed" : "Due Date"} & Team</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>
                     </div>
                     <div className="divide-y divide-gray-100">
                        {leadsInGroup.map((lead) => (
                          <LeadListItem 
                            key={lead.id} 
                            lead={lead} 
                            onArchive={onArchiveLead} 
                            // 👇 PROP BARU: Disable Drag untuk Won/Lost
                            isDragDisabled={isCompletedStage} 
                          />
                        ))}
                     </div>
                  </>
                ) : (
                   isDragOver ? (
                    <div className="h-24 m-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center text-blue-500 animate-in fade-in">
                       <span className="font-bold text-sm mb-1">Drop here</span>
                       <span className="text-xs opacity-80">to move to {stage.title}</span>
                    </div>
                   ) : (
                    <div className="py-6 flex items-center justify-center bg-gray-50/30">
                       <p className="text-sm text-gray-400 italic">
                         {isCompletedStage 
                            ? `No data in ${historyDate.toLocaleDateString('en-US', { month: 'long' })}`
                            : "No leads in this stage"
                         }
                       </p>
                    </div>
                   )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // =========================================================
  // VIEW MODE: GRID (KANBAN)
  // =========================================================
  return (
    <div className="flex gap-3 pb-20 min-w-max px-1 items-stretch">
      {stageConfig.map((stage) => {
        const { leads: stageLeads, isCompletedStage, totalValue, count } = getFilteredData(stage.id);
        const isDragOver = dragOverStage === stage.id;

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 flex flex-col gap-4 relative"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id as LeadStatus)}
          >
            {/* HEADER GRID */}
            <div className="sticky top-0 z-10">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="font-bold text-base text-gray-900">
                      {stage.title}
                    </h2>
                    
                    <p className="text-[12px] text-gray-500 font-medium">
                       {/* ENGLISH FORMAT */}
                       IDR {totalValue.toLocaleString("en-US")} • {count} Leads
                    </p>
                  </div>
                </div>

                {isCompletedStage ? (
                   <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-0.5 shadow-sm gap-0.5">
                      <button className="p-1 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600" onClick={() => changeMonth(-1)}>
                         <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-gray-700 w-12 text-center select-none">
                         {historyDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <button className="p-1 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => changeMonth(1)} disabled={historyDate > new Date()}>
                         <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                   </div>
                ) : (
                   <div className={`p-1.5 rounded-full ${stage.iconColor} text-white`}>
                      <Plus className="w-3 h-3" />
                   </div>
                )}
              </div>
              <div className="h-4 bg-gradient-to-b from-gray-50/50 to-transparent -mb-4 pointer-events-none" />
            </div>

            {/* CARDS */}
            <div
              className={`flex-1 flex flex-col space-y-3 pr-1 transition-all duration-200 rounded-lg min-h-[150px] h-full
                ${
                  isDragOver
                    ? "bg-blue-50 ring-2 ring-blue-400 ring-offset-2 border-blue-200"
                    : "border-transparent"
                }
              `}
            >
              {stageLeads.length > 0 ? (
                stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onArchive={onArchiveLead}
                    // 👇 PROP BARU: Disable Drag untuk Won/Lost
                    isDragDisabled={isCompletedStage}
                  />
                ))
              ) : (
                <div className={`flex flex-col items-center justify-center flex-1 min-h-[150px] text-xs border-2 border-dashed rounded-xl transition-colors
                    ${isDragOver
                        ? "border-blue-300 bg-blue-100/50 text-blue-600"
                        : "border-gray-200 bg-gray-50/30 text-gray-400"
                    }
                  `}
                >
                  {isDragOver ? (
                    <>
                      <span className="font-bold text-sm mb-1">Drop here</span>
                      <span className="text-xs opacity-80">to move to {stage.title}</span>
                    </>
                  ) : (
                    <span className="italic text-gray-400">
                        {isCompletedStage 
                            ? `No data in ${historyDate.toLocaleDateString('en-US', { month: 'long' })}`
                            : "No leads"
                        }
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}