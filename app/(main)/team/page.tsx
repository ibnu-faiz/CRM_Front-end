'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import TeamCard from '@/components/team/TeamCard';
import AddTeamModal from '@/components/team/AddTeamModal';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { TeamMember, UserStatus } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UserStatus | 'all'>(UserStatus.ACTIVE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Data
  const { 
    data: teamMembers, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<TeamMember[]>(`${API_URL}/team`, fetcher);

  // Hitung status
  const statusFilters = [
    { label: 'Active', value: UserStatus.ACTIVE },
    { label: 'Inactive', value: UserStatus.INACTIVE },
    { label: 'Onboarding', value: UserStatus.ONBOARDING },
    { label: 'On Leave', value: UserStatus.ON_LEAVE },
  ];
  
  const getStatusCount = (status: UserStatus) => {
    return teamMembers?.filter(m => m.status === status).length || 0;
  };

  // Filter Logic
  const filteredMembers = teamMembers?.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilter === 'all' || member.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) return <div className="p-6">Failed to load team data</div>
  if (isLoading) return (
    <div className="p-6 flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <div className="flex items-center gap-4 mt-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`text-sm ${
                  activeFilter === filter.value
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                ● {filter.label} {getStatusCount(filter.value)}
              </button>
            ))}
            <button
                onClick={() => setActiveFilter('all')}
                className={`text-sm ${
                  activeFilter === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'
                }`}
            >
                ● All {teamMembers?.length || 0}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search team..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="bg-gray-800 hover:bg-gray-700 gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers?.map((member) => (
          <TeamCard 
            key={member.id} 
            member={member} 
            onTeamUpdated={mutate} 
          />
        ))}
        {filteredMembers?.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-10">No team members found.</p>
        )}
      </div>

      {/* Add Team Modal */}
      <AddTeamModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        onTeamAdded={mutate} 
      />
    </div>
  );
}