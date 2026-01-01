"use client";

import { useState } from "react";
import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Loader2,
  Video,
  Phone,
  Mail,
  ReceiptText,
  Clock,
  User,
  ArrowUpRight,
} from "lucide-react";

import { fetcher } from "@/lib/fetcher";
import { LeadActivity } from "@/lib/types";
import GlobalActivityTable from "@/components/dashboard/GlobalActivityTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const tabs = [
  { id: "MEETING", label: "Meeting" },
  { id: "CALL", label: "Call" },
  { id: "EMAIL", label: "E-mail" },
  { id: "INVOICE", label: "Invoice" },
];

// --- HELPERS FORMATTING ---

const isToday = (dateString: string | undefined) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (dateString: string | undefined) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

const formatTime = (isoString?: string) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDayDate = (isoString?: string) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDueDateInvoice = (isoString?: string) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-uk", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ActivityList() {
  const [activeTab, setActiveTab] = useState<string>("MEETING");

  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

 useEffect(() => {
    // 👇 Ganti "user_data" menjadi "user"
    const rawData = localStorage.getItem("user"); 

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        // Simpan data user ke state
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Gagal parse user data", e);
      }
    }
  }, []);

  const { data: activitiesData, isLoading } = useSWR<LeadActivity[]>(
    `${API_URL}/activities`,
    fetcher
  );

  const activities = activitiesData || [];
  const now = new Date();

  /// --- [LOGIKA FILTER "SATPAM"] ---
  // Filter dulu: Tampilkan HANYA jika Admin ATAU Lead-nya milik Sales ini
  const myActivities = activities.filter((act) => {
    // 1. Cek User Login
    if (!currentUser) return false;

    // 2. [PENTING] CEK STATUS LEAD (ARCHIVED / DRAFT)
    // Ambil data lead yang menempel di aktivitas ini
    const associatedLead = (act as any).lead;
    
    if (associatedLead) {
        // 1. Cek Archive
        if (associatedLead.isArchived) return false;

        // 2. Cek Status WON / LOST
        const status = associatedLead.status; // Pastikan backend kirim field 'status'
        if (status === "WON" || status === "LOST") return false;
    }

    // 3. LOGIKA ROLE (ADMIN vs SALES)
    if (currentUser.role?.toUpperCase() === "ADMIN") return true;

    if (currentUser.role?.toUpperCase() === "SALES") {
        const assignedUsers = associatedLead?.assignedUsers || [];
        const isAssigned = assignedUsers.some((u: any) => String(u.id) === String(currentUser.id));
        const isCreator = (act.createdBy as any)?.id === currentUser.id;

        return isAssigned || isCreator;
    }

    return false;
  });
  // 1. FILTER UMUM (⚠️ Ubah 'activities' jadi 'myActivities')
  const filteredByType = myActivities.filter((act) => act.type === activeTab);
  // 2. FILTER TODAY
  const todayActivities = filteredByType
    .filter((act) => {
      const timeValue =
        act.scheduledAt ||
        act.meta?.startTime ||
        act.createdAt ||
        act.meta?.dueDate;
      if (!timeValue) return false;

      // --- LOGIKA INVOICE TODAY ---
      if (activeTab === "INVOICE") {
        const status = act.meta?.status?.toUpperCase();
        const dueDate = act.meta?.dueDate;
        return status === "PAID" || status === "OVERDUE" || isToday(dueDate);
      }

      // --- LOGIKA EMAIL ---
      if (
        activeTab === "EMAIL" &&
        act.meta?.status?.toUpperCase() === "DRAFT"
      ) {
        return false;
      }
      if (activeTab === "EMAIL" && act.meta?.status?.toUpperCase() === "SENT") {
        return isToday(timeValue);
      }

      // --- LOGIKA MEETING / CALL ---
      return isToday(timeValue) && new Date(timeValue) > now;
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.scheduledAt || a.meta?.startTime || a.createdAt || 0
      ).getTime();
      const dateB = new Date(
        b.scheduledAt || b.meta?.startTime || b.createdAt || 0
      ).getTime();
      return dateB - dateA;
    });

  // 3. FILTER UPCOMING
  const upcomingActivities = filteredByType
    .filter((act) => {
      if (activeTab === "INVOICE") {
        const status = act.meta?.status?.toUpperCase();
        const dueDate = act.meta?.dueDate;

        // 1. Buang PAID / OVERDUE
        if (status === "PAID" || status === "OVERDUE") return false;

        // 2. Prioritas Cek Tanggal (Berlaku untuk SENT, PENDING, DAN DRAFT)
        if (dueDate) {
          // Jika Hari Ini -> Buang (Masuk Today)
          if (isToday(dueDate)) return false;

          // Jika Masa Lalu -> Buang
          // Jika Masa Depan -> Ambil
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          return new Date(dueDate) > todayEnd;
        }

        // 3. Jika DRAFT tapi TIDAK ADA Due Date -> Masukkan ke Upcoming (Backlog)
        if (status === "DRAFT") return true;

        // Sisanya (Sent/Pending tanpa tanggal??) -> False
        return false;
      }

      if (
        activeTab === "EMAIL" &&
        act.meta?.status?.toUpperCase() === "DRAFT"
      ) {
        return true;
      }

      const timeValue = act.scheduledAt || act.meta?.startTime || act.createdAt;
      if (!timeValue) return false;

      const date = new Date(timeValue);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      return date > todayEnd;
    })
    .sort((a, b) => {
      const isADraft = a.meta?.status?.toUpperCase() === "DRAFT";
      const isBDraft = b.meta?.status?.toUpperCase() === "DRAFT";
      if (isADraft && !isBDraft) return -1;
      if (!isADraft && isBDraft) return 1;

      const dateA = new Date(
        a.scheduledAt || a.meta?.startTime || a.createdAt || 0
      ).getTime();
      const dateB = new Date(
        b.scheduledAt || b.meta?.startTime || b.createdAt || 0
      ).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  return (
    <Card className="flex flex-col">
      <CardHeader className="justify-center">
        <CardTitle className="text-lg font-bold text-center">
          Upcoming Activities
        </CardTitle>
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Badge
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "secondary"}
              className={`cursor-pointer px-4 py-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="justify-center">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* === TODAY ACTIVITIES SECTION (DIPISAH BERDASARKAN TIPE) === */}
            <div className="mb-5">
              <h3 className="font-semibold text-m text-gray-900 mb-3 flex items-center gap-2">
                Today Activities
              </h3>

              {todayActivities.length > 0 ? (
                <div className="space-y-4">
                  {todayActivities.map((activity) => {
                    const leadId =
                      activity.leadId || (activity as any).lead?.id;
                    const title = activity.title || activity.content;
                    const picName = activity.createdBy?.name || "System";

                  // --- A. TAMPILAN INVOICE (TODAY) ---
                    if (activeTab === "INVOICE") {
                      // ... (variabel lain tetap sama)
                      const invoiceNo = activity.title || activity.content || activity.meta?.invoiceNo || "(No Number)";
                      const rawAmount = activity.meta?.totalAmount || activity.meta?.amount || 0;
                      const amount = Number(rawAmount);
                      const status = activity.meta?.status || "Pending";
                      const dueDate = activity.meta?.dueDate;
                      
                      // Logika Nama Perusahaan
                      const rawBilledTo = activity.meta?.billedTo || "";
                      const billedToName = rawBilledTo.split('\n')[0];
                      const companyName = activity.meta?.companyName || billedToName || "Client Name";

                      // LOGIKA TANGGAL PINTAR (TODAY / DATE)
                      const isDueToday = isToday(dueDate);
                      const dateText = isDueToday ? "Today" : (dueDate ? formatDueDateInvoice(dueDate) : "-");

                      return (
                        <div
                          key={activity.id}
                          className="bg-gray-900 text-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500 mb-3"
                        >
                          {/* 1. Header: No Invoice & Status */}
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-base truncate pr-2">
                              {invoiceNo}
                            </h4>
                            <Badge
                              className={`text-[10px] h-5 uppercase px-1.5 font-bold ${
                                status.toUpperCase() === "PAID"
                                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                                  : status.toUpperCase() === "OVERDUE"
                                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                              }`}
                            >
                              {status}
                            </Badge>
                          </div>

                          {/* 2. Middle: Harga & Tanggal */}
                          <div className="flex justify-between items-end mb-3">
                            {/* Harga (Kiri) */}
                            <div className="text-xs font-bold text-white">
                              Rp {amount.toLocaleString("id-ID")}
                            </div>

                            {/* Tanggal Due Date (Kanan) */}
                            <div
                              className={`text-xs font-medium ${
                                status.toUpperCase() === "OVERDUE"
                                  ? "text-red-400"
                                  : isDueToday 
                                  ? "text-orange-400" // Warna khusus jika jatuh tempo HARI INI
                                  : "text-gray-400"
                              }`}
                            >
                              Due {dateText}
                            </div>
                          </div>

                          {/* 3. Garis Pemisah */}
                          <div className="border-t border-gray-700 my-2"></div>

                          {/* 4. Footer: Company & Button */}
                          <div className="flex items-center justify-between pt-1">
                            {/* Company Name */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium truncate pr-2 max-w-[60%]">
                              <ReceiptText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="truncate" title={companyName}>
                                {companyName}
                              </span>
                            </div>

                            {/* Tombol View Detail */}
                            {leadId && (
                              <Link
                                href={`/leads/${leadId}?tab=invoice&highlight=${activity.id}`}
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  View Detail{" "}
                                  <ArrowUpRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    }
                    // --- B. TAMPILAN EMAIL (TODAY) ---
                    if (activeTab === "EMAIL") {
                      const recipientEmail =
                        activity.meta?.to ||
                        activity.meta?.recipientEmail ||
                        "-";
                      const sentTime =
                        activity.createdAt || activity.scheduledAt;

                      return (
                        // Tambahkan border-l-4 border-blue-500 disini
                        <div
                          key={activity.id}
                          className="bg-gray-900 text-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500 mb-3"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-base truncate pr-2">
                              {title}
                            </h4>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px] h-5 uppercase px-1.5 font-bold">
                              SENT
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1 text-xs text-gray-300 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span>Sent at {formatTime(sentTime)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-300">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">
                                To: {recipientEmail}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <User className="w-3 h-3" />{" "}
                              <span>From: {picName}</span>
                            </div>
                            {leadId && (
                              <Link
                                href={`/leads/${leadId}?tab=email&highlight=${activity.id}`}
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  View Detail{" "}
                                  <ArrowUpRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // --- C. TAMPILAN MEETING (TODAY) ---
                    if (activeTab === "MEETING") {
                      const startTime =
                        activity.scheduledAt || activity.meta?.startTime;
                      const endTime = activity.meta?.endTime;
                      const location =
                        activity.location ||
                        activity.meta?.location ||
                        "Online";
                      const timeDisplay = endTime
                        ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                        : formatTime(startTime);

                      return (
                        <div
                          key={activity.id}
                          className="bg-gray-900 text-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500 mb-3"
                        >
                          {/* 1. Judul */}
                          <h4 className="font-semibold text-base mb-2 truncate">
                            {title}
                          </h4>

                          {/* 2. Baris Waktu & Lokasi (Kecil) */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3 justify-between">
                            {/* Tulisan Today at ... */}
                            <span>
                              Today at{" "}
                              <span className="text-gray-200 font-medium">
                                {timeDisplay}
                              </span>
                            </span>

                            {/* Lokasi di kanannya */}
                            <div className="flex items-center gap-1 text-gray-300">
                              {location.toLowerCase() === "online" ? (
                                <Video className="w-3 h-3 text-blue-400" />
                              ) : (
                                <MapPin className="w-3 h-3 text-red-400" />
                              )}
                              <span>{location}</span>
                            </div>
                          </div>

                          {/* 3. Garis Pemisah */}
                          <div className="border-t border-gray-700 my-2"></div>

                          {/* 4. PIC & Tombol View Detail */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>
                                PIC:{" "}
                                <span className="text-gray-300">{picName}</span>
                              </span>
                            </div>

                            {leadId && (
                              <Link
                                href={`/leads/${leadId}?tab=meeting&highlight=${activity.id}`}
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  View Detail{" "}
                                  <ArrowUpRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // --- D. DEFAULT / CALL (TODAY) ---
                    const contactName = activity.meta?.contactName || "Contact";
                    const duration = activity.meta?.duration || "-";
                    const callTime = activity.scheduledAt || activity.meta?.startTime;

                    return (
                      <div
                        key={activity.id}
                        className="bg-gray-900 text-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500 mb-3"
                      >
                        {/* 1. Judul */}
                        <h4 className="font-semibold text-base mb-2 truncate">
                          {title}
                        </h4>

                        {/* 2. Baris Waktu & Durasi */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-3 justify-between">
                          {/* Tulisan Today at ... */}
                          <span>
                            Today at <span className="text-gray-200 font-medium">{formatTime(callTime)}</span>
                          </span>

                      
                          {/* Duration di kanannya */}
                          <div className="flex items-center gap-1 text-gray-300">
                            <Clock className="w-3 h-3 text-green-400" />
                            <span>{duration}</span>
                          </div>
                        </div>

                        {/* 3. Garis Pemisah */}
                        <div className="border-t border-gray-700 my-2"></div>

                        {/* 4. Contact & Tombol View Detail */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>Contact: <span className="text-gray-300">{contactName}</span></span>
                          </div>

                          {leadId && (
                            <Link
                              href={`/leads/${leadId}?tab=call&highlight=${activity.id}`}
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-6 px-2 text-[10px] bg-white/10 hover:bg-white/20 text-white border-0"
                              >
                                View Detail{" "}
                                <ArrowUpRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-2 border-l-2 border-gray-200 pl-3">
                  No {activeTab.toLowerCase()} activities for today.
                </div>
              )}
            </div>

            {/* === UPCOMING ACTIVITIES SECTION (DIPISAH BERDASARKAN TIPE) === */}
            <div>
              <h3 className="font-semibold text-m text-gray-900 mb-3">
                Upcoming
              </h3>

              {upcomingActivities.length > 0 ? (
                <div className="space-y-4">
                  {upcomingActivities.map((activity) => {
                    const leadId =
                      activity.leadId || (activity as any).lead?.id;
                    const title = activity.title || activity.content;

                   // --- A. TAMPILAN INVOICE (UPCOMING) ---
                    if (activeTab === "INVOICE") {
                      const invoiceNo = activity.title || activity.content || activity.meta?.invoiceNo || "(No Number)";
                      const rawAmount = activity.meta?.totalAmount || activity.meta?.amount || 0;
                      const amount = Number(rawAmount);
                      const status = activity.meta?.status || "Pending";
                      const isDraft = status.toUpperCase() === "DRAFT";
                      const dueDate = activity.meta?.dueDate || activity.createdAt;
                      
                      // Logika Nama Client
                      const rawBilledTo = activity.meta?.billedTo || "";
                      const billedToName = rawBilledTo.split('\n')[0];
                      const clientName = activity.meta?.companyName || billedToName || "Client";

                      // Logika Tanggal
                      const isTmr = isTomorrow(dueDate);
                      const dateText = isTmr ? "Tomorrow" : formatDueDateInvoice(dueDate);

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 group"
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0 bg-gray-100 border border-gray-200 mt-1">
                            <AvatarFallback className="text-gray-500 bg-transparent">
                              <ReceiptText className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Container Utama: Flex Row untuk membagi Kiri & Kanan */}
                          <div className="flex-1 min-w-0 flex justify-between items-start">
                            
                            {/* BAGIAN KIRI (Info Utama) */}
                            <div className="min-w-0 flex-1 pr-3">
                              {/* 1. Nomor Invoice */}
                              {leadId ? (
                                <Link
                                  href={`/leads/${leadId}?tab=invoice&highlight=${activity.id}`}
                                >
                                  <h4 className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600 cursor-pointer">
                                    {invoiceNo}
                                  </h4>
                                </Link>
                              ) : (
                                <h4 className="font-semibold text-sm text-gray-900 truncate">
                                  {invoiceNo}
                                </h4>
                              )}

                              {/* 2. Nama Client & Due Date */}
                              <div className="mt-1 text-xs text-gray-500 truncate">
                                <span className="text-gray-700 font-medium truncate">
                                  {clientName}
                                </span>
                                <span className="mx-1.5 text-gray-300">|</span>
                                <span className={isTmr ? "text-orange-600 font-medium" : ""}>
                                  Due {dateText}
                                </span>
                              </div>
                            </div>

                            {/* BAGIAN KANAN (Status & Harga) */}
                            <div className="flex flex-col items-end gap-1">
                              {/* 1. Status (Atas) */}
                              <Badge
                                variant="outline"
                                className={`text-[9px] h-4 uppercase ${
                                  isDraft
                                    ? "bg-gray-50 text-gray-600 border-gray-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {status}
                              </Badge>

                              {/* 2. Harga (Bawah) */}
                              <div className="text-xs font-bold text-gray-900">
                                Rp {amount.toLocaleString("id-ID")}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    }

                    // --- B. TAMPILAN EMAIL (UPCOMING) ---
                    if (activeTab === "EMAIL") {
                      const isDraft =
                        activity.meta?.status?.toUpperCase() === "DRAFT";
                      const recipient = activity.meta?.to || "Recipient";
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 group"
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0 bg-gray-100 border border-gray-200 mt-1">
                            <AvatarFallback className="text-gray-500 bg-transparent">
                              <Mail className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {leadId ? (
                                  <Link
                                    href={`/leads/${leadId}?tab=email&highlight=${activity.id}`}
                                  >
                                    <h4 className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600 cursor-pointer">
                                      {title}
                                    </h4>
                                  </Link>
                                ) : (
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {title}
                                  </h4>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-400 truncate flex-1 pr-4">
                                To: {recipient} - Not sent yet
                              </p>
                              {isDraft && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 uppercase bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  DRAFT
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // --- C. TAMPILAN MEETING (UPCOMING) ---
                    if (activeTab === "MEETING") {
                      const startTime =
                        activity.scheduledAt || activity.meta?.startTime;
                      const endTime = activity.meta?.endTime;
                      const location =
                        activity.location ||
                        activity.meta?.location ||
                        "Online";
                      const isTmr = isTomorrow(startTime);
                      const datePart = isTmr
                        ? "tomorrow"
                        : `on ${formatDayDate(startTime)}`;
                      const timeRange = endTime
                        ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                        : formatTime(startTime);

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 group"
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0 bg-gray-100 border border-gray-200 mt-1">
                            <AvatarFallback className="text-gray-500 bg-transparent">
                              <Video className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {leadId ? (
                                  <Link
                                    href={`/leads/${leadId}?tab=meeting&highlight=${activity.id}`}
                                  >
                                    <h4 className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600 cursor-pointer">
                                      {title}
                                    </h4>
                                  </Link>
                                ) : (
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {title}
                                  </h4>
                                )}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded flex-shrink-0">
                                {timeRange}
                              </div>
                            </div>
                            <div className="mt-1">
                              <p className="text-xs text-gray-400 break-words leading-tight">
                                Meeting at {location} {datePart}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                   // --- D. DEFAULT / CALL (UPCOMING) ---
                    const startTime = activity.scheduledAt || activity.meta?.startTime;
                    const contactName = activity.meta?.contactName || "Contact";
                    
                    // Logika Tanggal: Cek apakah besok atau hari lain
                    const isTmr = isTomorrow(startTime);
                    const datePart = isTmr ? "tomorrow" : `on ${formatDayDate(startTime)}`;

                    return (
                        <div key={activity.id} className="flex items-start gap-3 group">
                            <Avatar className="w-10 h-10 flex-shrink-0 bg-gray-100 border border-gray-200 mt-1">
                                <AvatarFallback className="text-gray-500 bg-transparent"><Phone className="w-5 h-5" /></AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        {leadId ? (
                                            <Link href={`/leads/${leadId}?tab=call&highlight=${activity.id}`}>
                                                <h4 className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600 cursor-pointer">{title}</h4>
                                            </Link>
                                        ) : (
                                            <h4 className="font-semibold text-sm text-gray-900 truncate">{title}</h4>
                                        )}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-2 py-1 rounded flex-shrink-0">
                                        {formatTime(startTime)}
                                    </div>
                                </div>
                                
                                <div className="mt-1">
                                    <p className="text-xs text-gray-400 break-words leading-tight">
                                        There is a call to {contactName} {datePart}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-md border border-dashed">
                  No upcoming {activeTab.toLowerCase()} activities found.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <div className="p-6 pt-0 mt-auto">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-xs text-gray-500">
              View All Activities
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Global Activity History</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-1 mt-4">
              <GlobalActivityTable
                activities={activities}
                loading={isLoading}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
