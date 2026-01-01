"use client";
import { Lead, LeadPriority } from "@/lib/types";
import { CalendarClock, CalendarCheck, CalendarX, Archive, ArchiveRestore } from "lucide-react"; // Import icon Archive
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface LeadCardProps {
  lead: Lead;
  // Tambahkan prop onArchive (opsional, agar fleksibel)
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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
};

export default function LeadCard({ lead, onArchive, isDragDisabled }: LeadCardProps) {
  const router = useRouter();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("leadTitle", lead.title);
    e.dataTransfer.setData("leadStatus", lead.status);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if dragging or clicking button
    if (
      (e.target as HTMLElement).closest("[data-drag-handle]") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    router.push(`/leads/${lead.id}`);
  };

  // Handle Archive Click
  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah card click (pindah halaman)
    if (onArchive) {
      onArchive(lead.id);
    }
  };

  return (
    <div
      draggable={!isDragDisabled}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow group ${
        lead.isArchived ? "opacity-60 grayscale bg-gray-50" : ""
      }`}
    >
      {/* Header & Archive Button */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h4 className="font-bold text-l text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {lead.title}
        </h4>

        {/* Tombol Archive (Hanya muncul saat hover di desktop, atau selalu di mobile) */}
        {onArchive && (
          <Button
            onClick={handleArchiveClick}
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-all hover:scale-110 active:scale-95 ${
              lead.isArchived
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100" // Warna untuk Restore (Unarchive)
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100" // Warna untuk Archive biasa
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

      {/* Company */}
      {lead.company && (
        <p className="text-xs text-gray-500 mb-2">{lead.company}</p>
      )}

      {/* Value */}
      <div className="mb-3">
        <p className="text-lg font-bold text-gray-900">
          {lead.currency} {(lead.value || 0).toLocaleString("id-ID")}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-3 mb-3 justify-between">
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        {/* Bagian Kiri: Tanggal */}
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

        {/* Bagian Kanan: Avatar */}
        <div className="flex -space-x-2 overflow-hidden pl-2">
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

          {/* Counter + */}
          {lead.assignedUsers && lead.assignedUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-[9px] text-gray-600 font-medium">
              +{lead.assignedUsers.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
