'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Mail, Edit2, Camera } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface ProfileSidebarProps {
  user: TeamMember;
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <Card className="border-gray-200 shadow-sm bg-white h-full">
      <CardContent className="p-8 flex flex-col items-center text-center h-full">
        
        {/* Avatar Section */}
        <div className="relative mb-6 mt-2 group">
          <Avatar className="w-28 h-28 border-4 border-white shadow-md bg-gray-100">
            <AvatarImage src={user.avatar || undefined} className="object-cover" />
            <AvatarFallback className="text-4xl font-bold bg-gray-900 text-white">
              {user.name?.split(" ")
                    .map((n) => n[0])
                    .join("")}
            </AvatarFallback>
          </Avatar>

          {/* Tombol Edit Foto (Muncul saat Hover Foto) */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
             <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Name & Status */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {user.name}
        </h2>
        
        <Badge
          variant="outline"
          className="mb-8 px-4 py-1 text-sm font-normal bg-gray-900 text-white hover:bg-gray-600 capitalize"
        >
          {user.status ? user.status.toLowerCase().replace('_', ' ') : "active"}
        </Badge>

        {/* Contact Info List */}
        <div className="w-full space-y-5 border-t border-gray-300 pt-8 text-left">
            
            {/* Phone */}
            <div className="flex items-center gap-4 text-gray-600 group hover:text-gray-900 transition-colors">
                <div className="p-2 rounded-md group-hover:bg-gray-50 transition-colors">
                    <Phone className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </div>
                <span className="text-sm font-medium">
                    {user.phone || "-"}
                </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-4 text-gray-600 group hover:text-gray-900 transition-colors">
                <div className="p-2 rounded-md group-hover:bg-gray-50 transition-colors">
                    <MapPin className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </div>
                <span className="text-sm font-medium">
                    {user.location || "-"}
                </span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-4 text-gray-600 group hover:text-gray-900 transition-colors">
                <div className="p-2 rounded-md group-hover:bg-gray-50 transition-colors">
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </div>
                <span className="text-sm font-medium truncate" title={user.email}>
                    {user.email}
                </span>
            </div>

        </div>

        
      </CardContent>
    </Card>
  );
}