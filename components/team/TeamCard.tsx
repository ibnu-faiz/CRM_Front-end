"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Briefcase, MoreVertical } from "lucide-react";
import { TeamMember, UserStatus } from "@/lib/types";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/team/DeleteConfirmDialog";
import EditTeamModal from "@/components/team/EditTeamModal"; // Import Edit Modal

interface TeamCardProps {
  member: TeamMember;
  onTeamUpdated: () => void;
}

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

const statusDotColors: Record<string, string> = {
  [UserStatus.ACTIVE]: "bg-emerald-600",
  [UserStatus.INACTIVE]: "bg-gray-600",
  [UserStatus.ONBOARDING]: "bg-blue-600",
  [UserStatus.ON_LEAVE]: "bg-amber-600",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TeamCard({ member, onTeamUpdated }: TeamCardProps) {
  const router = useRouter();

  // State lokal untuk modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleViewDetails = () => {
    router.push(`/team/${member.id}`);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/team/${member.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("Anggota tim telah dihapus.");
      setIsDeleteDialogOpen(false);

      // Refresh list di parent
      onTeamUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow w-full max-w-[350px] mx-auto">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-8">
            <Badge className={statusColors[member.status]}>
              {statusLabels[member.status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                {/* Buka Modal Edit Lokal */}
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </DropdownMenuItem>
                {/* Buka Modal Delete Lokal */}
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-2 ring-gray-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1">
                <div
                  className={`w-5 h-5 ${
                    statusDotColors[member.status]
                  } rounded-full border-4 border-white shadow-sm`}
                ></div>
              </div>
            </div>

            <h3
              className="font-bold text-gray-900 text-center mt-3 w-full px-2 truncate"
              title={member.name} // Opsional: Biar pas di-hover muncul nama lengkapnya
            >
              {member.name}
            </h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>

          <div className="space-y-2 text-sm background-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{member.department || "No Department"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Joined at{" "}
              {new Date(member.joinedAt || member.createdAt).toLocaleDateString(
                "en-US",
                { dateStyle: "medium" }
              )}
            </span>
            <button
              onClick={handleViewDetails}
              className="text-gray-600 hover:text-gray-900"
            >
              View Details →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modal-modal ditaruh di sini (di luar CardContent agar rapi, tapi di dalam komponen) */}

      <EditTeamModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        member={member}
        onTeamUpdated={onTeamUpdated}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        memberName={member.name}
      />
    </>
  );
}
