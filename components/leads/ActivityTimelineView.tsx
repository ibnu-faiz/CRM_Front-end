"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Video,
  Mail,
  StickyNote,
  CheckSquare,
  Activity,
  ReceiptText,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import { LeadActivity, ActivityType, TeamMember } from "@/lib/types";

interface ActivityTimelineViewProps {
  activities: LeadActivity[] | undefined;
  error: any;
  teamMembers?: TeamMember[];
}

const activityIconMap: Record<string, any> = {
  [ActivityType.CALL]: Phone,
  [ActivityType.MEETING]: Video,
  [ActivityType.EMAIL]: Mail,
  [ActivityType.NOTE]: StickyNote,
  [ActivityType.TASK]: CheckSquare,
  [ActivityType.INVOICE]: ReceiptText,
  [ActivityType.STATUS_CHANGE]: Activity,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleString("en-UK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatdDueDateInvoice = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleString("en-UK", {
    dateStyle: "long",
  });
};



const formatMeetingDate = (startStr: string, endStr?: string) => {
  if (!startStr) return "-";
  const start = new Date(startStr);
  const datePart = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStart = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  let result = `${datePart} at ${timeStart}`;
  if (endStr) {
    const end = new Date(endStr);
    const timeEnd = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    result += ` - ${timeEnd}`;
  }
  return result;
};

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function ActivityTimelineView({
  activities,
  error,
  teamMembers = [],
}: ActivityTimelineViewProps) {
  // --- HELPER UNTUK MENDAPATKAN DETAIL USER ---
  const getAttendeeDetails = (attendeesInput: any) => {
    if (!attendeesInput) return [];

    // Pastikan jadi array
    const ids = Array.isArray(attendeesInput)
      ? attendeesInput
      : [attendeesInput];

    // Map ID ke User Object
    return ids.map((idOrName: string) => {
      // Cari di teamMembers
      const user = teamMembers.find((u) => u.id === idOrName);
      // Jika tidak ketemu, tandai sebagai unknown agar tidak menampilkan ID sebagai nama
      return (
        user || { id: idOrName, name: idOrName, avatar: null, isUnknown: true }
      );
    });
  };

  if (error) {
    return <div className="text-red-500 p-4">Failed to load activity</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium">No activity logged yet</p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Activity logs will appear here.
        </p>
      </div>
    );
  }

  const renderActivityDetails = (activity: LeadActivity) => {
    const meta = activity.meta || {};

    switch (activity.type) {
      case ActivityType.MEETING:
        // Ambil objek user berdasarkan ID yang ada di meta.attendees
        const attendeesObjects = getAttendeeDetails(meta.attendees);

        return (
          <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm space-y-3 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {formatMeetingDate(meta.startTime, meta.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="font-medium">
                {/* Tampilkan Lokasi, atau 'Online', atau 'Location not set' */}
                {meta.location ||
                  (meta.linkMeeting ? "Online" : "Location not set")}

                {/* Tombol Link */}
                {meta.linkMeeting && (
                  <a
                    href={meta.linkMeeting}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline ml-1 hover:text-blue-700"
                  >
                    (Link Meeting)
                  </a>
                )}
              </span>
            </div>

            {/* Tampilkan Attendees (Avatar Stack) */}
            {attendeesObjects.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <div
                    className="flex -space-x-2 overflow-hidden"
                    data-no-navigate
                  >
                    {attendeesObjects.map((user: any, idx: number) =>
                      idx < 3 ? (
                        <Avatar
                          key={user.id || idx}
                          className="w-6 h-6 border-2 border-white"
                        >
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback className="text-[9px] bg-gray-900 text-white font-medium">
                            {/* Tampilkan '?' jika user tidak ditemukan (isUnknown), atau jika nama terlihat seperti angka/ID */}
                            {user.isUnknown
                              ? "?"
                              : user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                      ) : null
                    )}

                    {attendeesObjects.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-[9px] text-gray-600 font-medium z-10">
                        +{attendeesObjects.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {meta.description && (
              <p className="text-gray-600 mt-1 border-t border-gray-200 pt-2 font-medium">
                Description: {meta.description}
              </p>
            )}
            {meta.outcome && (
              <p className="text-gray-600 pt-1 font-medium">
                Outcome: {meta.outcome}
              </p>
            )}
          </div>
        );

      case ActivityType.CALL:
        return (
          <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm space-y-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-green-500 mt-0.5" />
                <span className="text-gray-600 font-medium">
                  Contact: <b>{meta.contactName || "-"}</b>
                </span>
              </div>
              <Badge
                variant="outline"
                className={`capitalize ${
                  meta.callStatus === "completed"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {meta.callStatus || "No Status"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 font-medium">
                  Duration: <b>{meta.duration || "-"}</b>
                </span>
              </div>
              <Badge
                variant="outline"
                className={`capitalize ${
                  meta.callResult === "interested"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {meta.callResult || "No Result yet"}
              </Badge>
            </div>
            {meta.callNotes && (
              <p className="text-gray-600 mt-1 border-t border-gray-200 pt-2 font-medium">
                Call notes: {meta.callNotes}
              </p>
            )}
          </div>
        );

      case ActivityType.EMAIL:
        const isEmailSent = (meta.status || "").toUpperCase() === "SENT";

        // Fungsi kecil untuk mengubah "SENT" menjadi "Sent", atau "draft" menjadi "Draft"
        const formatStatus = (status: string | null | undefined) => {
          if (!status) return "Draft";
          return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        };

        return (
          <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm space-y-2 border border-gray-100">
            <div className="flex justify-between items-center text-gray-500">
              <div>
                From:{" "}
                <span className="text-gray-900 font-medium">
                  {activity.createdBy?.name || "System"}
                </span>
              </div>
              {/* Teks status sudah diformat */}
              <Badge
                variant={isEmailSent ? "secondary" : "secondary"}
                className="text-[10px] h-5 border-gray-300"
              >
                {formatStatus(meta.status)}
              </Badge>
            </div>

            <div className="text-gray-500 flex items-center gap-1">
              To:{" "}
              <span className="text-gray-900 font-medium">
                {meta.to || "-"}
              </span>
            </div>

            {meta.messageBody && (
              <div className="text-gray-600 mt-1 border-t border-gray-200 pt-2 font-medium">
                {meta.messageBody}
              </div>
            )}
          </div>
        );

      case ActivityType.INVOICE:
        return (
          <div className="mt-3 bg-white p-3 rounded-md text-sm flex justify-between items-center border border-gray-200 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-gray-500" />
                <span className="font-bold text-gray-900">
                  {activity.content}
                </span>
              </div>
              <span className="text-gray-500 text-xs mt-1">
                Due: {meta.dueDate ? formatdDueDateInvoice(meta.dueDate) : "-"}
              </span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-base">
                {formatCurrency(meta.totalAmount || 0)}
              </div>
              <Badge
                variant={meta.status === "paid" ? "default" : "outline"}
                className={`mt-1 capitalize text-[10px] ${
                  meta.status === "overdue"
                    ? "text-red-600 border-red-200 bg-red-50"
                    : ""
                }`}
              >
                {meta.status || "No Status"}
              </Badge>
            </div>
          </div>
        );

      case ActivityType.NOTE:
        return (
          <div className="mt-2 text-sm text-gray-800 bg-yellow-50 p-3 rounded-md border border-yellow-100 leading-relaxed whitespace-pre-wrap">
            {activity.content}
          </div>
        );

      default:
        return meta.description ? (
          <p className="text-sm text-gray-600 mt-1">{meta.description}</p>
        ) : null;
    }
  };

  return (
    <div className="space-y-6 pl-2">
      {activities.map((activity, index) => {
        const Icon = activityIconMap[activity.type] || Activity;
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-4">
            {/* Garis Timeline Vertical */}
            {!isLast && (
              <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200"></div>
            )}

            {/* Icon Bulat */}
            <div className="relative z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
              <Icon className="w-5 h-5 text-gray-500" />
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-2">
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {activity.type === ActivityType.NOTE
                        ? "Note Added"
                        : activity.type === ActivityType.INVOICE
                        ? "Invoice Created"
                        : activity.content || "Activity Log"}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {activity.createdBy?.name || "User"}
                    </span>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gray-900 text-white text-[10px]">
                        {getInitials(activity.createdBy?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Body Content (Render Spesifik) */}
                {renderActivityDetails(activity)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
