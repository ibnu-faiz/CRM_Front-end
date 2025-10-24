// components/team/TeamCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, Briefcase, Calendar, MoreVertical } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  department: string;
  status: string;
  joinedDate: string;
}

interface TeamCardProps {
  member: TeamMember;
}

const statusColors: Record<string, string> = {
  active: 'bg-gray-800 hover:bg-gray-700 text-white',
  inactive: 'bg-gray-400 hover:bg-gray-500 text-white',
  onboarding: 'bg-blue-600 hover:bg-blue-700 text-white',
  'on-leave': 'bg-orange-600 hover:bg-orange-700 text-white',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  onboarding: 'Onboarding',
  'on-leave': 'On Leave',
};

export default function TeamCard({ member }: TeamCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/team/${member.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
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
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarFallback className="bg-gray-300 text-gray-700 text-lg font-semibold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-gray-900 text-center">{member.name}</h3>
          <p className="text-sm text-gray-500">{member.role}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{member.department}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Joined at {member.joinedDate}</span>
          <button 
            onClick={handleViewDetails}
            className="text-gray-600 hover:text-gray-900"
          >
            View Details →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}