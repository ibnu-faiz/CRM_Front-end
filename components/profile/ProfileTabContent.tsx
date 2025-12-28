// components/profile/ProfileTabContent.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Building, Edit2, Save, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { TeamMember, UserRole } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper date
const formatToDate = (isoString?: string | null) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

interface Props {
  user: TeamMember;
  mutate: () => void; // Fungsi buat refresh data di parent
}

export default function ProfileTabContent({ user, mutate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Form
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [location, setLocation] = useState(user.location || "");
  const [bio, setBio] = useState(user.bio || "");
  const [department, setDepartment] = useState(user.department || "");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const inputStyle =
    "text-gray-900 disabled:opacity-100 disabled:cursor-default disabled:bg-gray-50";

  // Sinkronisasi data awal saat user berubah
  useEffect(() => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setLocation(user.location || "");
    setBio(user.bio || "");
    setDepartment(user.department || "");

    let skillsArray: string[] = [];
    if (typeof user.skills === "string") {
      try {
        skillsArray = JSON.parse(user.skills);
      } catch {
        skillsArray = [];
      }
    } else if (Array.isArray(user.skills)) {
      skillsArray = user.skills;
    }
    setSkills(skillsArray);
  }, [user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          location,
          bio,
          skills,
          department,
        }),
      });

      if (!res.ok) throw new Error("Failed update");

      toast.success("Profile updated");
      mutate(); // Refresh data parent!
      setIsEditing(false);
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((i) => i !== s));

  const formatLeadStatus = (status: string) => {
    // Kamus terjemahan: Kiri (Database) -> Kanan (Tampilan Layar)
    const statusMap: Record<string, string> = {
      LEAD_IN: "New Lead",            // Lebih profesional daripada "Lead In"
      CONTACT_MADE: "Contact Made",
      NEED_IDENTIFIED: "Needs Identified", // Pakai "Needs" (jamak) lebih umum
      PROPOSAL_MADE: "Proposal Sent",
      NEGOTIATION: "Negotiation",
      CONTRACT_SEND: "Contract Sent", // Perbaiki grammar (Send -> Sent)
      WON: "Closed Won",
      LOST: "Closed Lost"
    };

    // Kembalikan hasil terjemahan. 
    // Jika tidak ada di kamus, ganti underscore jadi spasi dan rapikan hurufnya.
    return statusMap[status] || status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      {/* Header Edit Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Personal Information
          </h3>
          <p className="text-sm text-gray-500">
            Update your personal details here.
          </p>
        </div>
        <div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(false)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
              <User className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-gray-900">Basic Details</h4>
            </div>
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label className="text-gray-900">Fullname</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  // Tambahkan className ini:
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-gray-900">Email</Label>

                <Input
                  value={user.email}
                  disabled
                  className={`
                  ${inputStyle} 
                  ${isEditing ? "!text-gray-400 !bg-gray-200" : ""}
                 `}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-gray-900">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-gray-900">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!isEditing}
                  className={inputStyle}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-gray-900">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className={`resize-none ${inputStyle}`}
                />
              </div>
            </div>
          </div>

          {/* Work Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
              <Building className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold text-gray-900">Work Details</h4>
            </div>
            <div className="space-y-4">
              {/* Department */}
              <div className="grid gap-1.5">
                <Label className="text-gray-900">Department</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!isEditing}
                  className={inputStyle}
                />
              </div>

              {/* Role (Permanen Disabled) */}
              <div className="grid gap-1.5">
                <Label className="text-gray-900">Role</Label>
                <Input
                  value={user.role}
                  disabled
                  className={`
                  ${inputStyle} 
                  ${isEditing ? "!text-gray-400 !bg-gray-200" : ""}
                  `}
                 />
              </div>

              {/* Joined Date (Permanen Disabled) */}
              <div className="grid gap-1.5">
                <Label className="text-gray-900">Joined Date</Label>
                <Input
                  type="date"
                  value={formatToDate(user.joinedAt || user.createdAt)}
                  disabled
                  className={`
                  ${inputStyle} 
                  ${isEditing ? "!text-gray-400 !bg-gray-200" : ""}
                 `}
                 />
              </div>

              {/* Skills (Div Kustom) */}
              <div className="grid gap-1.5">
                <Label className="text-gray-900">Skills</Label>
                <div
                  className={`
                min-h-[42px] p-2 border rounded-md flex flex-wrap gap-2 transition-colors
                ${
                  !isEditing ? "bg-gray-50" : "bg-white"
                } // Manual ganti background
            `}
                >
                  {skills.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="px-2 py-1 bg-gray-200 text-gray-900 hover:bg-gray-300"
                    >
                      {s}{" "}
                      {isEditing && (
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeSkill(s)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Add skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="h-9 text-sm text-gray-900"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={addSkill}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

{/* HANYA TAMPIL JIKA ROLE = SALES */}
{user.role === 'SALES' && (
  <div className="grid gap-1.5">
    <Label className="text-gray-900">Assigned Leads</Label>
    
    <div className="min-h-[42px] p-2 border rounded-md bg-gray-100 flex flex-wrap gap-2 items-center">
      
      {user.assignedLeads && user.assignedLeads.length > 0 ? (
        <TooltipProvider delayDuration={100}> 
          {user.assignedLeads.map((lead: any) => (
            <Tooltip key={lead.id}>
              <TooltipTrigger asChild>
                <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 shadow-sm cursor-help select-none hover:border-gray-400 transition-colors h-auto">
                  <span className="font-medium">
                    {lead.title}
                  </span>
                </div>
              </TooltipTrigger>
              
              <TooltipContent className="bg-gray-900 text-white text-xs border-none p-3 shadow-xl">
                <div className="text-center space-y-1">
                    <p className="font-bold text-sm">{lead.company || 'Unknown Company'}</p>
                    
                    {/* 2. PANGGIL FUNGSI FORMATTER DI SINI */}
                    <div className="flex items-center justify-center gap-1.5 opacity-90">
                        <span className="text-gray-300">Status:</span>
                        <span className={`font-semibold ${
                            lead.status === 'WON' ? 'text-green-400' : 
                            lead.status === 'LOST' ? 'text-red-400' : 
                            'text-blue-300'
                        }`}>
                            {formatLeadStatus(lead.status)}
                        </span>
                    </div>

                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      ) : (
        <span className="text-sm text-gray-400 italic px-1">
          - Empty -
        </span>
      )}
      
    </div>
  </div>
)}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-6 mt-8 border-t border-gray-100">
            <Button type="submit" className="bg-gray-900" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{" "}
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
