"use client";
import { Lead, LeadPriority } from "@/lib/types";
import { CalendarClock, Archive, ArchiveRestore } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface LeadListItemProps {
  lead: Lead;
  onArchive?: (id: string) => void;
}

const priorityColors = {
  [LeadPriority.LOW]: "bg-gray-100 text-gray-700",
  [LeadPriority.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [LeadPriority.HIGH]: "bg-red-100 text-red-700",
};

const labelColors: Record<string, string> = {
  cold: "bg-blue-100 text-blue-700",
  hot: "bg-red-100 text-red-700",
  pitching: "bg-purple-100 text-purple-700",
  deal: "bg-green-100 text-green-700",
};

const stageConfig: Record<string, { color: string; textColor: string }> = {
  LEAD_IN: {
    color: "bg-gray-100",
    textColor: "text-gray-700",
  },
  CONTACT_MADE: {
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  NEED_IDENTIFIED: {
    color: "bg-purple-100",
    textColor: "text-purple-700",
  },
  PROPOSAL_MADE: {
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  NEGOTIATION: {
    color: "bg-orange-100",
    textColor: "text-orange-700",
  },
  CONTRACT_SEND: {
    color: "bg-pink-100",
    textColor: "text-pink-700",
  },
  WON: {
    color: "bg-green-100",
    textColor: "text-green-700",
  },
  LOST: {
    color: "bg-red-100",
    textColor: "text-red-700",
  },
};

const stageLabels: Record<string, string> = {
  LEAD_IN: "Lead In",
  CONTACT_MADE: "Contact Made",
  NEED_IDENTIFIED: "Need Identified",
  PROPOSAL_MADE: "Proposal Made",
  NEGOTIATION: "Negotiation",
  CONTRACT_SEND: "Contract Send",
  WON: "Won",
  LOST: "Lost",
};

export default function LeadListItem({ lead, onArchive }: LeadListItemProps) {
  const router = useRouter();
  const stage = stageConfig[lead.status] || stageConfig.LEAD_IN;
  const stageLabel = stageLabels[lead.status] || lead.status;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("leadTitle", lead.title);
    e.dataTransfer.setData("leadStatus", lead.status);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("[data-no-navigate]")
    ) {
      return;
    }
    router.push(`/leads/${lead.id}`);
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(lead.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`grid grid-cols-12 gap-3 px-8 py-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all cursor-pointer group relative border-b border-gray-100 last:border-b-0 ${
        lead.isArchived ? "opacity-60 grayscale bg-gray-50" : ""
      }`}
    >
      {/* Drag Indicator */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-0.5">
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        </div>
      </div>

      {/* Lead Title & Company */}
      <div className="col-span-3 flex flex-col justify-center gap-1">
        <h4 className="font-bold text-base text-gray-900 line-clamp-1">
          {lead.title}
        </h4>
        <p className="text-xs text-gray-500 truncate">{lead.company || "-"}</p>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${stage.color} ${stage.textColor}`}
        >
          {stageLabel}
        </span>
      </div>

      {/* Value */}
      <div className="col-span-2 flex items-center">
        <div className="flex flex-col">
          <span className="text-base font-bold text-gray-900">
            {lead.currency} {(lead.value || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Priority & Label */}
      <div className="col-span-2 flex items-center gap-2" data-no-navigate>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
            // Ganti uppercase jadi capitalize
            priorityColors[lead.priority]
          }`}
        >
          {lead.priority.toLowerCase()}{" "}
          {/* Pastikan text aslinya kecil semua dulu */}
        </span>

        {lead.label && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              // Pastikan ada capitalize
              labelColors[lead.label.toLowerCase()] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {lead.label}
          </span>
        )}
      </div>

      {/* Due Date & Assigned Users */}
      <div className="col-span-2 flex items-center gap-4">
        {/* Due Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>
            {lead.dueDate
              ? new Date(lead.dueDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "numeric",
                  year: "2-digit",
                })
              : "-"}
          </span>
        </div>

        {/* Assigned Users */}
        <div className="flex -space-x-2 overflow-hidden" data-no-navigate>
          {lead.assignedUsers && lead.assignedUsers.length > 0 ? (
            lead.assignedUsers.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="w-6 h-6 border-2 border-white">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback className="text-[9px] bg-gray-900 text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
              <span className="text-[10px] text-gray-400">?</span>
            </div>
          )}

          {lead.assignedUsers && lead.assignedUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-[9px] text-gray-600 font-medium">
              +{lead.assignedUsers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Archive Action */}
      <div className="col-span-1 flex items-center justify-end">
        {onArchive && (
          <Button
            onClick={handleArchiveClick}
            variant="outline"
            size="icon" // Mengunci ukuran tombol agar kotak/bulat kecil
            className={`h-7 w-7 rounded-full transition-all hover:scale-110 active:scale-95 ${
              lead.isArchived
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-200"
            }`}
            title={lead.isArchived ? "Unarchive" : "Archive"}
          >
            {lead.isArchived ? (
              <ArchiveRestore className="w-3.5 h-3.5" /> // Ukuran ikon disesuaikan
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
