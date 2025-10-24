// app/(main)/team/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreVertical } from 'lucide-react';
import TeamCard from '@/components/team/TeamCard';
import AddTeamModal from '@/components/team/AddTeamModal';

// Mock data
const teamMembers = [
  {
    id: 1,
    name: 'Angelo Audia',
    role: 'UI UX Designer',
    email: 'angela@email.com',
    department: 'Developer Team',
    status: 'active',
    joinedDate: '9 June 2025',
  },
  {
    id: 2,
    name: 'Ahmad Dilya\'i',
    role: 'UI UX Designer',
    email: 'ahmad@email.com',
    department: 'Developer Team',
    status: 'active',
    joinedDate: '9 June 2025',
  },
  {
    id: 3,
    name: 'Achmad Fatoni',
    role: 'UI UX Designer',
    email: 'achmad@email.com',
    department: 'Developer Team',
    status: 'inactive',
    joinedDate: '9 June 2025',
  },
  {
    id: 4,
    name: 'Amelia Putri',
    role: 'UI UX Designer',
    email: 'amelia@email.com',
    department: 'Developer Team',
    status: 'active',
    joinedDate: '9 June 2025',
  },
  {
    id: 5,
    name: 'Dedinda Oktavia',
    role: 'UI UX Designer',
    email: 'dedinda@email.com',
    department: 'Developer Team',
    status: 'active',
    joinedDate: '9 June 2025',
  },
  {
    id: 6,
    name: 'Ariq Mudriq',
    role: 'Front-End Dev',
    email: 'ariq@email.com',
    department: 'Developer Team',
    status: 'on-leave',
    joinedDate: '9 June 2025',
  },
  {
    id: 7,
    name: 'Abdul Gany',
    role: 'Front-End Dev',
    email: 'abdul@email.com',
    department: 'Developer Team',
    status: 'onboarding',
    joinedDate: '9 June 2025',
  },
  {
    id: 8,
    name: 'Fatoni Ahmad',
    role: 'Back-End Dev',
    email: 'fatoni@email.com',
    department: 'Developer Team',
    status: 'inactive',
    joinedDate: '9 June 2025',
  },
];

const statusFilters = [
  { label: 'Active', count: 4, value: 'active' },
  { label: 'Inactive', count: 2, value: 'inactive' },
  { label: 'Onboarding', count: 1, value: 'onboarding' },
  { label: 'On Leave', count: 1, value: 'on-leave' },
];

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilter === 'all' || member.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

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
                ● {filter.label} {filter.count}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
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
        {filteredMembers.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>

      {/* Add Team Modal */}
      <AddTeamModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}