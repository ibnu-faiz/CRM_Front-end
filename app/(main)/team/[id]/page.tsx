'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Mail, Calendar, Edit, Trash2, User, Briefcase, Loader2, BarChart3 } from 'lucide-react';
import EditTeamModal from '@/components/team/EditTeamModal';
import DeleteConfirmDialog from '@/components/team/DeleteConfirmDialog';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { TeamMember, UserStatus, UserRole } from '@/lib/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label'; // Tambahkan Label

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const statusColors: Record<string, string> = {
  [UserStatus.ACTIVE]: 'bg-gray-800',
  [UserStatus.INACTIVE]: 'bg-gray-400',
  [UserStatus.ONBOARDING]: 'bg-blue-600',
  [UserStatus.ON_LEAVE]: 'bg-orange-600',
};

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    mutate 
  } = useSWR<TeamMember>(
    id ? `${API_URL}/team/${id}` : null, 
    fetcher
  );

  const handleBack = () => {
    router.push('/team');
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Anggota tim telah dihapus.');
      setIsDeleteDialogOpen(false);
      router.push('/team');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus');
    }
  };
  
  if (isLoading) return (
    <div className="p-6 flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
  if (error || !member) return <div className="p-6">Gagal memuat data anggota tim.</div>;

  const skillsArray = (typeof member.skills === 'string') 
    ? JSON.parse(member.skills) 
    : (Array.isArray(member.skills) ? member.skills : []);

  // Cek apakah member ini adalah SALES
  const isSales = member.role === UserRole.SALES;

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Team
      </Button>

      {/* Profile Card & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-gray-300 text-gray-700 text-2xl font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-gray-600">{member.department || 'N/A'}</Badge>
                <Badge className={statusColors[member.status] || 'bg-gray-400'}>
                  {member.status}
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
                    Joined at {new Date(member.joinedAt || member.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleteDialogOpen(true)}>
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
                    <Badge variant="secondary" className="ml-2">{member.assignedLeads?.length || 0}</Badge>
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
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                        <p className="text-gray-700">{member.bio || 'No bio provided.'}</p>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsArray.length > 0 ? skillsArray.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1">
                              {skill}
                            </Badge>
                          )) : <p className="text-sm text-gray-500">No skills added.</p>}
                        </div>
                      </div>

                      {/* Reports To */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Reports To</h4>
                        <p className="text-gray-700">{member.reportsTo?.name || 'No manager assigned'}</p>
                      </div>
                      
                      {/* --- DAFTAR LEADS YANG DIKERJAKAN (SAMA SEPERTI PROFILE) --- */}
                      {isSales && (
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Assigned Leads (Active)</h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                              {member.assignedLeads && member.assignedLeads.length > 0 ? (
                                <ul className="space-y-2">
                                  {member.assignedLeads.map((lead) => (
                                    <li key={lead.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-100 shadow-sm">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{lead.title}</p>
                                        <p className="text-xs text-gray-500">{lead.company || 'No Company'}</p>
                                      </div>
                                      <Badge variant="outline" className="text-[10px] h-5">
                                        {lead.status.replace('_', ' ')}
                                      </Badge>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No leads assigned yet.</p>
                              )}
                            </div>
                        </div>
                      )}
                      {/* --------------------------------------------------------- */}

                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Deals Tab (Bisa juga menampilkan leads di sini jika mau) */}
              <TabsContent value="deals" className="p-6">
                <div className="text-center py-12">
                    {/* Jika mau, Anda bisa memindahkan list leads di atas ke sini juga */}
                   <p className="text-gray-500">Check Overview tab for assigned leads.</p>
                </div>
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
        memberName={member?.name || 'Team Member'}
      />
    </div>
  );
}