"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Phone,
  Video,
  Mail,
  StickyNote,
  ReceiptText,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { LeadActivity, ActivityType } from "@/lib/types";

interface GlobalActivityTableProps {
  activities: LeadActivity[] | undefined;
  loading?: boolean;
}

// --- HELPERS ---
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIcon = (type: string) => {
  switch (type) {
    case ActivityType.MEETING: return <Video className="w-4 h-4 text-blue-500" />;
    case ActivityType.CALL: return <Phone className="w-4 h-4 text-green-500" />;
    case ActivityType.EMAIL: return <Mail className="w-4 h-4 text-indigo-500" />;
    case ActivityType.INVOICE: return <ReceiptText className="w-4 h-4 text-slate-700" />;
    case ActivityType.NOTE: return <StickyNote className="w-4 h-4 text-yellow-600" />;
    default: return <Calendar className="w-4 h-4 text-gray-500" />;
  }
};

const getInitials = (name: string) => {
  return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "??";
};

export default function GlobalActivityTable({ activities, loading }: GlobalActivityTableProps) {
  
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading data...</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="p-12 text-center border rounded-lg bg-gray-50">
        <p className="text-gray-500">No activities found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[180px]">Date</TableHead>
            <TableHead className="w-[50px] text-center">Type</TableHead>
            <TableHead className="min-w-[250px]">Activity Detail</TableHead>
            <TableHead className="w-[200px]">Lead / Company</TableHead>
            <TableHead className="w-[150px]">PIC (Sales)</TableHead>
            <TableHead className="w-[120px] text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const meta = activity.meta || {};
            // Menggunakan 'title' (schema baru) atau fallback ke 'content'
            const title = activity.title || activity.content || "(No Title)";
            
            // Mengambil info Lead (Pastikan backend mengirim include: { lead: true })
            const lead = (activity as any).lead;

            return (
              <TableRow key={activity.id} className="hover:bg-gray-50/50">
                {/* 1. Date */}
                <TableCell className="text-xs text-gray-600 font-medium">
                  {formatDate(activity.createdAt)}
                </TableCell>

                {/* 2. Type Icon */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mx-auto">
                    {getIcon(activity.type)}
                  </div>
                </TableCell>

                {/* 3. Activity Detail */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {title}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {/* Deskripsi singkat berdasarkan tipe */}
                      {activity.type === ActivityType.NOTE && (activity.description || activity.content)}
                      {activity.type === ActivityType.MEETING && meta.description}
                      {activity.type === ActivityType.CALL && `Result: ${meta.callResult || '-'}`}
                      {activity.type === ActivityType.EMAIL && `Subject: ${meta.subject || '-'}`}
                      {activity.type === ActivityType.INVOICE && `Total: IDR ${(meta.totalAmount || 0).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </TableCell>

                {/* 4. Lead Name (Link ke Detail) */}
                <TableCell>
                  {lead ? (
                    <Link 
                      href={`/leads/${lead.id}`} 
                      className="group flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors w-fit"
                    >
                      <span className="font-medium text-sm line-clamp-1">
                        {lead.company || lead.contacts || "Unknown Lead"}
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Deleted Lead</span>
                  )}
                </TableCell>

                {/* 5. PIC (Sales) */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={activity.createdBy?.avatar} />
                      <AvatarFallback className="text-[10px] bg-gray-200">
                        {getInitials(activity.createdBy?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-700 font-medium truncate max-w-[100px]">
                      {activity.createdBy?.name || "System"}
                    </span>
                  </div>
                </TableCell>

                {/* 6. Status Badge */}
                <TableCell className="text-right">
                  {/* Custom Badge Logic based on Type */}
                  {activity.type === ActivityType.INVOICE && (
                    <Badge variant={meta.status === 'paid' ? 'default' : 'outline'} className="text-[10px] capitalize">
                      {meta.status || 'Draft'}
                    </Badge>
                  )}
                  {activity.type === ActivityType.CALL && (
                    <div className="flex justify-end">
                       {meta.callStatus === 'missed' ? (
                         <Badge variant="destructive" className="text-[10px]">Missed</Badge>
                       ) : (
                         <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                       )}
                    </div>
                  )}
                  {activity.type === ActivityType.MEETING && (
                     <span className="text-xs text-gray-500">
                        {meta.startTime ? new Date(meta.startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-'}
                     </span>
                  )}
                  {activity.type === ActivityType.NOTE && (
                    <span className="text-xs text-gray-400 italic">Log</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}