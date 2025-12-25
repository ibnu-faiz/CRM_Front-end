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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewInitialized, setIsViewInitialized] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Hook Data
  const { grouped, stats, loading, createLead, updateLead, deleteLead } =
    useLeadsByStatus(showArchived);

  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

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

  const filteredGrouped: Record<string, Lead[]> = {};

  if (grouped) {
    Object.keys(grouped).forEach((key) => {
      const statusKey = key as LeadStatus;
      if (grouped[statusKey]) {
        filteredGrouped[key] = grouped[statusKey].filter((lead: Lead) => {
          const matchesArchive = showArchived
            ? lead.isArchived === true
            : !lead.isArchived;
          const matchesPriority =
            selectedPriorities.length === 0 ||
            selectedPriorities.includes(lead.priority);
          return matchesArchive && matchesPriority;
        });
      }
    });
  }

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

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

  const totalLeads = stats.reduce((sum, s) => sum + s.count, 0);
  const totalValue = stats.reduce((sum, s) => sum + s.totalValue, 0);

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
                : `${totalLeads} leads • IDR ${totalValue.toLocaleString(
                    "id-ID"
                  )}`}
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

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  // size="lg"
                  className={`gap-2 ${
                    selectedPriorities.length > 0
                      ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {selectedPriorities.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="mx-1 h-4" />
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal lg:hidden"
                      >
                        {selectedPriorities.length}
                      </Badge>
                      <div className="hidden space-x-1 lg:flex">
                        {selectedPriorities.length > 2 ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-1 font-normal"
                          >
                            {selectedPriorities.length} selected
                          </Badge>
                        ) : (
                          selectedPriorities.map((option) => (
                            <Badge
                              variant="secondary"
                              key={option}
                              className="rounded-full px-1 font-normal capitalize"
                            >
                              {option.toLowerCase()}
                            </Badge>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      Priority
                    </h4>
                    <div className="grid gap-2">
                      {[
                        LeadPriority.HIGH,
                        LeadPriority.MEDIUM,
                        LeadPriority.LOW,
                      ].map((priority) => (
                        <div
                          key={priority}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`filter-${priority}`}
                            checked={selectedPriorities.includes(priority)}
                            onCheckedChange={() => togglePriority(priority)}
                          />
                          <Label
                            htmlFor={`filter-${priority}`}
                            className="text-sm font-normal capitalize cursor-pointer"
                          >
                            {priority.toLowerCase()}
                          </Label>
                        </div>
                      ))}
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