"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Mail,
  Calendar,
  Edit,
  Trash2,
  User,
  Briefcase,
  Loader2,
  BarChart3,
} from "lucide-react";
import EditTeamModal from "@/components/team/EditTeamModal";
import DeleteConfirmDialog from "@/components/team/DeleteConfirmDialog";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TeamMember, UserStatus, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"; // Tambahkan Label

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusColors: Record<string, string> = {
  [UserStatus.ACTIVE]: "bg-emerald-600 hover:bg-emerald-700 text-white",
  [UserStatus.INACTIVE]: "bg-gray-600 hover:bg-gray-700 text-white",
  [UserStatus.ONBOARDING]: "bg-blue-600 hover:bg-blue-700 text-white",
  [UserStatus.ON_LEAVE]: "bg-amber-600 hover:bg-amber-700 text-white",
};

const statusLabels: Record<string, string> = {
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.ONBOARDING]: "Onboarding",
  [UserStatus.ON_LEAVE]: "On Leave",
};

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Ambil data member
  const {
    data: member,
    error,
    isLoading,
    mutate,
  } = useSWR<TeamMember>(id ? `${API_URL}/team/${id}` : null, fetcher);

  const handleBack = () => {
    router.push("/team");
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/team/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("Anggota tim telah dihapus.");
      setIsDeleteDialogOpen(false);
      router.push("/team");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  if (isLoading)
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  if (error || !member)
    return <div className="p-6">Gagal memuat data anggota tim.</div>;

  const skillsArray =
    typeof member.skills === "string"
      ? JSON.parse(member.skills)
      : Array.isArray(member.skills)
      ? member.skills
      : [];

  // Cek apakah member ini adalah SALES
  const isSales = member.role === UserRole.SALES;

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-medium text-gray-900">Back to Team</span>
      </div>

      {/* Profile Card & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-gray-300 text-gray-700 text-2xl font-semibold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-gray-600">
                  {member.department || "N/A"}
                </Badge>
                <Badge className={statusColors[member.status] || "bg-gray-400"}>
                  {statusLabels[member.status]}
                </Badge>
              </div>
              <div className="w-full space-y-3 text-left mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined at{" "}
                    {new Date(
                      member.joinedAt || member.createdAt
                    ).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Tabs Content */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-6 py-4"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="deals"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-6 py-4"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Deals
                    <Badge variant="secondary" className="ml-2">
                      {member.assignedLeads?.length || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-6 py-4"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">About</h3>
                    <div className="space-y-4">
                      {/* Bio */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Bio
                        </h4>
                        <p className="text-gray-700">
                          {member.bio || "No bio provided."}
                        </p>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsArray.length > 0 ? (
                            skillsArray.map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="px-3 py-1"
                              >
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No skills added.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reports To */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Reports To
                        </h4>
                        <p className="text-gray-700">
                          {member.reportsTo?.name || "No manager assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Deals Tab (Bisa juga menampilkan leads di sini jika mau) */}
              <TabsContent value="deals" className="p-6">
                {isSales ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Assigned Leads
                    </h4>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                      {member.assignedLeads &&
                      member.assignedLeads.length > 0 ? (
                        <ul className="space-y-2">
                          {member.assignedLeads.map((lead) => (
                            <li
                              key={lead.id}
                              className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-100 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {lead.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {lead.company || "No Company"}
                                </p>
                              </div>

                              <Badge
                                variant="outline"
                                className="text-xs ml-3 flex-shrink-0"
                              >
                                {lead.status.replace("_", " ")}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-400">
                            No leads assigned yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No deals information available.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-500">Performance data coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTeamModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={member}
        onTeamUpdated={mutate} // Kirim mutate
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        memberName={member?.name || "Team Member"}
      />
    </div>
  );
}
