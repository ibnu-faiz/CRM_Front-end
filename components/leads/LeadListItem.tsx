"use client";
import { Lead, LeadPriority } from "@/lib/types";
import { CalendarClock, CalendarCheck, CalendarX, Archive, ArchiveRestore } from "lucide-react"; // Hanya pakai CalendarClock agar konsisten
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface LeadListItemProps {
  lead: Lead;
  onArchive?: (id: string) => void;
  isDragDisabled?: boolean;
}

const priorityColors = {
  [LeadPriority.LOW]: "bg-gray-100 text-gray-700",
  [LeadPriority.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [LeadPriority.HIGH]: "bg-red-100 text-red-700",
};

const getPriorityLabel = (type: string) => {
  if (type === 'low') return 'Low Priority';
  if (type === 'medium') return 'Medium Priority';
  if (type === 'high') return 'High Priority';
  return type;
}

const clientTypeColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",       // Biru untuk New Client
  existing: "bg-emerald-100 text-emerald-700", // Hijau/Emerald untuk Existing
};

const getClientTypeLabel = (type: string) => {
  if (type === 'new') return 'New Client';
  if (type === 'existing') return 'Existing Client';
  return type;
};

// Helper Format Date (Sama persis dengan LeadCard: Month Short, Year 2-digit)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
};

export default function LeadListItem({ lead, onArchive, isDragDisabled }: LeadListItemProps) {
  const router = useRouter();

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
      draggable={!isDragDisabled}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/80 transition-all cursor-pointer group relative items-center ${
        lead.isArchived ? "opacity-60 grayscale bg-gray-50" : ""
      }`}
    >
      {/* Visual Drag Dots */}
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-0.5 p-1">
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* 1. Lead Details (COL-SPAN-4) */}
      <div className="col-span-4 flex flex-col justify-center gap-1">
        <h4 className="font-bold text-l text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {lead.title}
        </h4>
        <p className="text-xs text-gray-500 truncate font-medium">
            {lead.company || "No Company"}
        </p>
      </div>

      {/* 2. Value (COL-SPAN-2) */}
      <div className="col-span-3 flex items-center">
        {/* Hapus background, font samakan dengan Card (text-base font-bold) */}
        <span className="text-base font-bold text-gray-900">
             {lead.currency} {(lead.value || 0).toLocaleString("id-ID")}
        </span>
      </div>

      {/* 3. Priority & Label (COL-SPAN-3) */}
      <div className="col-span-2 flex flex-col items-start gap-1.5" data-no-navigate>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
            priorityColors[lead.priority]
          }`}
        >
          {getPriorityLabel(lead.priority.toLowerCase())}
        </span>
        {lead.clientType && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              clientTypeColors[lead.clientType.toLowerCase()] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {getClientTypeLabel(lead.clientType)}
          </span>
        )}
      </div>

    {/* 4. Dates & Team (COL-SPAN-2) */}
      <div className="col-span-2 flex flex-col justify-center gap-1.5">
        
        {/* Date Display Logic Based on status */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
           
           {/* LOGIC: Cek status terlebih dahulu */}
           {lead.status === "WON" ? (
              /* KONDISI 1: status WON (Hijau & Check) */
              <>
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">
                    {/* Tampilkan wonAt, fallback ke string kosong biar aman TS */}
                    {formatDate(lead.wonAt || "")}
                </span>
              </>
           ) : lead.status === "LOST" ? (
              /* KONDISI 2: status LOST (Merah & Silang) */
              <>
                <CalendarX className="w-3.5 h-3.5 text-red-600" />
                <span className="text-red-600 font-medium">
                    {formatDate(lead.lostAt || "")}
                </span>
              </>
           ) : (
              /* KONDISI 3: status OPEN / Lainnya (Abu-abu & Jam) */
              <>
                <CalendarClock className="w-3.5 h-3.5" />
                <span>
                    {lead.dueDate ? formatDate(lead.dueDate) : "-"}
                </span>
              </>
           )}
        </div>
        
        {/* Assigned Users (Tetap sama) */}
        <div className="flex -space-x-2 overflow-hidden pl-0.5" data-no-navigate>
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

      {/* 5. Archive Action (COL-SPAN-1) */}
      <div className="col-span-1 flex items-center justify-end">
        {onArchive && (
          <Button
            onClick={handleArchiveClick}
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-all hover:scale-110 active:scale-95 ${
              lead.isArchived 
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
              : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {lead.isArchived ? (
              <ArchiveRestore className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}