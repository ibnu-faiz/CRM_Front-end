"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Archive,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  UserX,
  Check,
} from "lucide-react";
import LeadsKanban from "@/components/leads/LeadsKanban";
import CreateLeadModal from "@/components/leads/CreateLeadModal";
import DeleteLeadDialog from "@/components/leads/DeleteLeadDialog";
import WonConfirmDialog from "@/components/leads/WonConfirmDialog";
import LostConfirmDialog from "@/components/leads/LostConfirmDialog";
import LeadsDropZone from "@/components/leads/LeadsDropZone"; // Import DropZone
import { useLeadsByStatus } from "@/hooks/useLeads";
import { LeadStatus, Lead, LeadPriority } from "@/lib/types";
import { Toaster, toast } from "sonner";
import AIChatWidget from "@/components/ai/AIChatWidget";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewInitialized, setIsViewInitialized] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Hook Data
  const { grouped, stats, loading, createLead, updateLead, deleteLead } =
    useLeadsByStatus(showArchived);

  // State Dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWonDialogOpen, setIsWonDialogOpen] = useState(false);
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // State Drag & Drop
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedTimeFilters, setSelectedTimeFilters] = useState<string[]>([]); // Array untuk multi-select
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  const toggleTimeFilter = (value: string) => {
    setSelectedTimeFilters(
      (prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value) // Hapus (Uncheck)
          : [...prev, value] // Tambah (Check)
    );
  };

  const filteredGrouped: Record<string, Lead[]> = {};

  if (grouped) {
    Object.keys(grouped).forEach((key) => {
      const statusKey = key as LeadStatus;

      if (grouped[statusKey]) {
        filteredGrouped[key] = grouped[statusKey].filter((lead: Lead) => {
          // 1. Filter Archive (Bawaan lama)
          const matchesArchive = showArchived
            ? lead.isArchived === true
            : !lead.isArchived;

          // 2. Filter Unassigned (Baru)
          // Jika toggle aktif, hanya tampilkan yang assignedUsers kosong/null
          const matchesUnassigned = showUnassignedOnly
            ? !lead.assignedUsers || lead.assignedUsers.length === 0
            : true;

          // 3. Filter Waktu (Baru)
          // Asumsi filter berdasarkan 'createdAt'. Ubah ke 'dueDate' jika perlu.
          const leadDate = new Date(lead.createdAt); // Pastikan field ini benar (createdAt / dueDate)
          const now = new Date();

          let matchesTime = true;

          if (selectedTimeFilters.length > 0) {
            matchesTime = false; // Default false, akan jadi true jika cocok salah satu

            // A. Cek THIS MONTH
            if (selectedTimeFilters.includes("THIS_MONTH")) {
              const isThisMonth = isWithinInterval(leadDate, {
                start: startOfMonth(now),
                end: endOfMonth(now),
              });
              if (isThisMonth) matchesTime = true;
            }

            // B. Cek LAST MONTH
            if (selectedTimeFilters.includes("LAST_MONTH")) {
              const lastMonth = subMonths(now, 1);
              const isLastMonth = isWithinInterval(leadDate, {
                start: startOfMonth(lastMonth),
                end: endOfMonth(lastMonth),
              });
              if (isLastMonth) matchesTime = true;
            }

            // C. Cek 3RD MONTH (2 Bulan Lalu)
            // Contoh: Sekarang Januari. Last=Des. 3rd=November.
            if (selectedTimeFilters.includes("3RD_MONTH")) {
              const thirdMonth = subMonths(now, 2);
              const isThirdMonth = isWithinInterval(leadDate, {
                start: startOfMonth(thirdMonth),
                end: endOfMonth(thirdMonth),
              });
              if (isThirdMonth) matchesTime = true;
            }
          }

          // Gabungkan semua kondisi
          return matchesArchive && matchesUnassigned && matchesTime;
        });
      }
    });
  }

  const allFilteredLeads = grouped ? Object.values(filteredGrouped).flat() : [];
  const displayedTotalLeads = allFilteredLeads.length;
  const displayedTotalValue = allFilteredLeads.reduce((sum, lead) => {
    return sum + (Number(lead.value) || 0);
  }, 0);
  const hasActiveFilters = selectedTimeFilters.length > 0;

  const handleArchiveLead = async (id: string) => {
    try {
      await updateLead(id, { isArchived: !showArchived } as any);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Logic Drag Drop Handlers (Bubbling) ---
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverZone(null);
  };

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e: React.DragEvent, zone: "delete" | "won" | "lost") => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverZone(null);

    const leadId = e.dataTransfer.getData("leadId");
    const leadTitle = e.dataTransfer.getData("leadTitle");

    if (leadId) {
      setSelectedLead({ id: leadId, title: leadTitle });
      if (zone === "delete") setIsDeleteDialogOpen(true);
      else if (zone === "won") setIsWonDialogOpen(true);
      else if (zone === "lost") setIsLostDialogOpen(true);
    }
  };

  // --- Backend Actions ---
  const handleDeleteConfirm = async () => {
    if (selectedLead) {
      await deleteLead(selectedLead.id);
      setSelectedLead(null);
    }
  };
  const handleWonConfirm = async () => {
    if (selectedLead) {
      await updateLead(selectedLead.id, { status: LeadStatus.WON });
      setSelectedLead(null);
    }
  };
  const handleLostConfirm = async () => {
    if (selectedLead) {
      await updateLead(selectedLead.id, { status: LeadStatus.LOST });
      setSelectedLead(null);
    }
  };

  // --- Scroll Logic ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 340;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const savedView = localStorage.getItem("leadsViewMode");
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
    setIsViewInitialized(true);
  }, []);

  const changeViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("leadsViewMode", mode);
  };

  if (!isViewInitialized) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gray-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-gray-50/30 overflow-hidden relative">
      <Toaster position="top-right" />

      <div className="p-6 pb-0 flex-shrink-0 z-20 bg-gray-50/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {showArchived ? "Archived Leads" : "Leads"}
            </h1>
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading..."
                : `${displayedTotalLeads} leads • IDR ${displayedTotalValue.toLocaleString(
                    "id-ID"
                  )}`}
              {/* Opsional: Tambahkan indikator visual */}
              {hasActiveFilters && (
                <span className="ml-2 text-xs text-blue-600 font-medium">
                  (Filtered)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" /> Add Lead
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            >
              <Sparkles className="w-4 h-4" /> AI Chat
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => changeViewMode("grid")}
                // UBAH rounded-md JADI rounded-full DI SINI
                className={`p-2 rounded-full transition-all ${
                  viewMode === "grid"
                    ? "bg-gray-800 text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => changeViewMode("list")}
                // UBAH rounded-md JADI rounded-full DI SINI
                className={`p-2 rounded-full transition-all ${
                  viewMode === "list"
                    ? "bg-gray-800 text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              // size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={`gap-2 ${
                showArchived
                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  : ""
              }`}
            >
              <Archive className="w-4 h-4" />
              {showArchived ? "Show Active" : "Archive"}
            </Button>

            {/* --- FILTER BUTTON (MULTI SELECT UI) --- */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`gap-2 ${
                    selectedTimeFilters.length > 0 || showUnassignedOnly
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>

                  {/* Badge Counter */}
                  {(selectedTimeFilters.length > 0 || showUnassignedOnly) && (
                    <>
                      <Separator
                        orientation="vertical"
                        className="mx-1 h-4 bg-blue-200"
                      />
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {selectedTimeFilters.length +
                          (showUnassignedOnly ? 1 : 0)}
                      </span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[260px] p-0" align="end">
                <div className="p-4 space-y-4">
                  {/* HEADER */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">
                      Filter Settings
                    </h4>
                    {(selectedTimeFilters.length > 0 || showUnassignedOnly) && (
                      <button
                        onClick={() => {
                          setSelectedTimeFilters([]);
                          setShowUnassignedOnly(false);
                        }}
                        type="button"
                        className="px-2 py-1 text-[10px] font-medium rounded-full border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 hover:text-red-800 transition-all"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  <Separator />

                  {/* 1. SECTION: TIME PERIOD (CHECKBOXES) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      View Leads By
                    </label>
                    <div className="grid gap-1">
                      {[
                        { value: "THIS_MONTH", label: "This Month" },
                        { value: "LAST_MONTH", label: "Last Month" },
                        { value: "3RD_MONTH", label: "2 Months Ago" },
                      ].map((option) => {
                        const isSelected = selectedTimeFilters.includes(
                          option.value
                        );
                        return (
                          <div
                            key={option.value}
                            onClick={() => toggleTimeFilter(option.value)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Custom Checkbox UI */}
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedTimeFilters.length === 0 && (
                      <p className="text-[10px] text-gray-400 px-2 italic">
                        *Showing all time history
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* 2. SECTION: ASSIGNMENT */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Assignment
                    </label>
                    <div
                      onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                        showUnassignedOnly
                          ? "bg-orange-50 text-orange-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserX className="w-3.5 h-3.5 opacity-70" />
                        <span>Unassigned Only</span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          showUnassignedOnly
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {showUnassignedOnly && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {viewMode === "grid" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => scroll("left")}
                className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Button>

              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gray-800 rounded-full"
                  style={{
                    width: "20%",
                    left: `${scrollProgress * 0.8}%`,
                    transition: "left 0.1s ease-out",
                  }}
                />
              </div>

              <Button
                onClick={() => scroll("right")}
                variant="outline"
                className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto px-6 pb-32 scroll-smooth no-scrollbar"
        // Handler bubbling drag dari card
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <LeadsKanban
          grouped={filteredGrouped}
          hasActiveFilters={
            selectedTimeFilters.length > 0 || showUnassignedOnly
          }
          stats={stats}
          loading={loading}
          onUpdateLead={updateLead}
          onArchiveLead={handleArchiveLead}
          viewMode={viewMode}
        />
      </div>

      {/* POSISI TERPISAH: Di luar scroll container, tapi di dalam div utama (relative) 
          Agar 'absolute bottom-0' menempel di dasar layar */}
      <LeadsDropZone
        isDragging={isDragging}
        dragOverZone={dragOverZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <CreateLeadModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={createLead}
      />
      <DeleteLeadDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        leadTitle={selectedLead?.title}
        onConfirm={handleDeleteConfirm}
      />
      <WonConfirmDialog
        open={isWonDialogOpen}
        onOpenChange={setIsWonDialogOpen}
        leadTitle={selectedLead?.title}
        onConfirm={handleWonConfirm}
      />
      <LostConfirmDialog
        open={isLostDialogOpen}
        onOpenChange={setIsLostDialogOpen}
        leadTitle={selectedLead?.title}
        onConfirm={handleLostConfirm}
      />
      <AIChatWidget
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
