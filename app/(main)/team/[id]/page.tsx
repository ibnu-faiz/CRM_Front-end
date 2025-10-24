// app/(main)/team/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Mail, Calendar, Edit, Trash2, User, Briefcase, BarChart3 } from 'lucide-react';
import EditTeamModal from '@/components/team/EditTeamModal';
import DeleteConfirmDialog from '@/components/team/DeleteConfirmDialog';

// Mock data - replace with real data fetching
const memberData = {
  id: 1,
  name: 'Angelo Audia',
  role: 'UI UX Designer',
  department: 'Developer Team',
  status: 'active',
  email: 'angela@email.com',
  joinedDate: '9 June 2025',
  bio: 'UI/UX Designer yang passionate bikin desain simpel, modern, dan user-friendly.',
  skills: ['Wireframing', 'Prototyping', 'Figma', 'Design System'],
  reportsTo: 'No manager assigned',
};

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBack = () => {
    router.push('/team');
  };

  const handleDelete = () => {
    // Handle delete logic
    console.log('Delete member');
    setIsDeleteDialogOpen(false);
    router.push('/team');
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-6 -ml-2"
      >
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
                  {memberData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {memberData.name}
              </h2>
              <p className="text-sm text-gray-500 mb-3">{memberData.role}</p>

              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-gray-600">{memberData.department}</Badge>
                <Badge className="bg-gray-800">
                  {memberData.status}
                </Badge>
              </div>

              <div className="w-full space-y-3 text-left mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{memberData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined at {memberData.joinedDate}</span>
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
                    <Badge variant="secondary" className="ml-2">0</Badge>
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
                    <h3 className="font-semibold text-lg mb-2">About</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                        <p className="text-gray-700">{memberData.bio}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {memberData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Reports To</h4>
                        <p className="text-gray-700">{memberData.reportsTo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Deals Tab */}
              <TabsContent value="deals" className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-500">No deals assigned yet</p>
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
        member={memberData}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}