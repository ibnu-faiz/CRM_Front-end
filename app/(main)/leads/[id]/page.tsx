"use client";
import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Trash2,
  Users,
  User,
  Globe,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import LeadSummary from "@/components/leads/LeadSummary";
import LeadActivities from "@/components/leads/LeadActivities";
import DeleteLeadDialog from "@/components/leads/DeleteLeadDialog";
import EditSummaryModal from "@/components/leads/EditSummaryModal";
import { getLeadById, deleteLead, updateLead } from "@/lib/api/leads";
import { Lead, LeadStatus } from "@/lib/types";
import { Toaster, toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formatStatus = (status: string) => {
  if (!status) return "N/A";
  return status.replace(/_/g, " ").toLowerCase();
};

const ALL_STATUSES = [
  LeadStatus.LEAD_IN,
  LeadStatus.CONTACT_MADE,
  LeadStatus.NEED_IDENTIFIED,
  LeadStatus.PROPOSAL_MADE,
  LeadStatus.NEGOTIATION,
  LeadStatus.CONTRACT_SEND,
  LeadStatus.WON,
  LeadStatus.LOST,
];

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;

  // 1. useSWR provides 'mutate' which is the function to re-fetch data
  const {
    data: leadResponse,
    error,
    isLoading,
    mutate,
  } = useSWR(leadId ? `${API_URL}/leads/${leadId}` : null, fetcher);

  const lead: Lead | undefined = leadResponse?.lead || leadResponse;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false);

  // 2. FIX: Define fetchLead to call SWR's mutate function
  const fetchLead = async () => {
    await mutate();
  };

  const handleBack = () => {
    router.push("/leads");
  };

  const handleDelete = async () => {
    try {
      await deleteLead(leadId);
      toast.success("Success", { description: "Lead deleted successfully" });
      router.push("/leads");
    } catch (error: any) {
      toast.error("Error", { description: "Failed to delete lead" });
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    try {
      // Optimistic update (opsional, tapi bagus untuk UX)
      // mutate({ ...lead, status: newStatus }, false);

      await updateLead(lead.id, { status: newStatus });
      toast.success(
        `Status updated to ${newStatus.replace(/_/g, " ").toLowerCase()}`
      );

      mutate(); // Refresh data otomatis dari server
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 mb-4">Lead not found</p>
        <Button onClick={handleBack}>Back to Leads</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to leads
      </Button>

      {/* --- KOTAK HEADER BARU --- */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Baris Atas: Judul, Perusahaan, dan Tombol Aksi */}
          <div className="flex items-start justify-between mb-4">
            {/* Bagian Kiri: Judul & Perusahaan */}
            <div className="flex items-center gap-3">
              <Globe className="w-10 h-10 text-gray-500 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold">
                  {lead.title || "No Title"}
                </h1>
                {lead.company && (
                  <p className="text-sm text-gray-500">{lead.company}</p>
                )}
              </div>
            </div>

            {/* Bagian Kanan: Status, Label, dan Tombol Delete */}
            <div className="flex items-center gap-2">
              <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* UBAH STYLE DI SINI: Menggunakan variant="outline" agar sama dengan tombol Delete */}
                  <Button variant="outline" className="gap-2 capitalize">
                    <Check className="w-4 h-4" />
                    <span>{formatStatus(lead.status)}</span>
                    <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="start" className="w-56">
                  {ALL_STATUSES.map((status) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="flex items-center justify-between cursor-pointer py-2"
                    >
                      <span className="capitalize">{formatStatus(status)}</span>
                      {lead.status === status && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

              {lead.label && (
                <div>
                  <Badge
                    variant="outline"
                    className="capitalize py-2 px-3 text-sm"
                  >
                    {lead.label}
                  </Badge>
                </div>
              )}

              {/* Tombol Delete */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" /> {/* Adjusted icon size to standard */}
              </Button>
            </div>
          </div>

          {/* Baris Bawah: Admin & Team */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {/* Admin by (CreatedBy) */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Created by</p>
                <p className="text-sm font-medium">
                  {lead.createdBy?.name || "N/A"}
                </p>
              </div>
            </div>

            {/* Team (AssignedUsers) */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Team</p>
                <div className="flex items-center gap-1">
                  {lead.assignedUsers && lead.assignedUsers.length > 0 ? (
                    <p className="text-sm font-medium">
                      {lead.assignedUsers.map((user) => user.name).join(", ")}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-500 italic">
                      Unassigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Summary */}
        <div className="lg:col-span-1">
          <LeadSummary lead={lead} onEdit={() => setIsEditSummaryOpen(true)} />
        </div>

        {/* Right Content - Activities */}
        <div className="lg:col-span-2">
          <LeadActivities leadId={leadId} />
        </div>
      </div>

      <DeleteLeadDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        leadTitle={lead?.title}
        onConfirm={handleDelete}
      />

      <EditSummaryModal
        open={isEditSummaryOpen}
        onOpenChange={setIsEditSummaryOpen}
        lead={lead}
        // 3. Now fetchLead exists and will trigger SWR revalidation
        onLeadUpdated={fetchLead}
      />
    </div>
  );
}
