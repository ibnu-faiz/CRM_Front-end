'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video, Clock, MapPin, MoreHorizontal, Users } from 'lucide-react';
import { LeadActivity, TeamMember } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Helper Functions di luar komponen ---

// 1. Format untuk tanggal di header (Created At)
const formatCreationDate = (isoString?: string) => {
  if (!isoString) return '-';
  // Contoh: 17 Nov 2025
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

// 2. Format untuk tanggal meeting (Start Time)
const formatMeetingDate = (isoStart?: string) => {
  if (!isoStart) return 'Date not set';
  // Contoh: 18 November 2025
  return new Date(isoStart).toLocaleDateString('en-UK', {
    dateStyle: 'full',
  });
}

// 3. Format untuk rentang waktu meeting
const formatMeetingTimeRange = (isoStart?: string, isoEnd?: string) => {
  if (!isoStart) return 'Time not set';
  // Opsi untuk format waktu (Contoh: 10.00)
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: 'numeric',
    minute: '2-digit', 
    hour12: true // Gunakan format 24 jam
  };

  const start = new Date(isoStart);
  const startTimeStr = start.toLocaleTimeString('en-US', timeOptions).replace(/\./g, ':'); // Ganti 10.00 -> 10:00
  
  if (!isoEnd) return startTimeStr; // Hanya waktu mulai
  
  const end = new Date(isoEnd);
  const endTimeStr = end.toLocaleTimeString('en-US', timeOptions).replace(/\./g, ':');
  
  // Contoh: 10:00 - 11:00
  return `${startTimeStr} - ${endTimeStr}`;
};
// ---

// --- 5. Terima props baru ---
interface MeetingViewProps {
  meetings: LeadActivity[] | undefined;
  error: any;
  onEditMeeting: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
  salesTeam: TeamMember[] | undefined; // Prop baru
}

export default function MeetingView({ 
  meetings, 
  error, 
  onEditMeeting, 
  onDeleteMeeting, 
  salesTeam 
}: MeetingViewProps) {
  
  if (error) {
    return <div className="text-red-500 p-4">Failed to load Meetings {(error as any).info?.error}</div>;
  }

  if (!meetings || meetings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">No meetings scheduled yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">Scheduled meetings will appear here.</p>
        </div>
      );
    }
  

  // Helper untuk mendapatkan nama dari ID
  const getAttendeeNames = (ids: string[]) => {
    if (!salesTeam || ids.length === 0) return '-';
    
    return ids
      .map(id => salesTeam.find(user => user.id === id)?.name) // Cari nama
      .filter(Boolean) // Hapus jika ada user yang tidak ditemukan
      .join(', '); // Gabung dengan koma
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {meetings && meetings.length > 0 ? (
          meetings.map((meeting) => {
            // Ambil data dari 'content' dan 'meta'
            const title = meeting.content;
            const meta = meeting.meta || {};
            const startTime = meta.startTime;
            const endTime = meta.endTime;
            const location = meta.location;
            const link = meta.linkMeeting;
            const description = meta.description;
            const outcome = meta.outcome;
            const attendees = meta.attendees || [];
            const attendeeNames = getAttendeeNames(attendees);

            return (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Meeting Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-300 text-black">
                          <Video className="w-5 h-5 fill-current" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{title}</h4>
                        <p className="text-sm text-gray-500">
                          Organized by {meeting.createdBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* TANGGAL DIBUAT (Created At) */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatCreationDate(meeting.createdAt)}</span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditMeeting(meeting.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteMeeting(meeting.id)} className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                  </div>

                  {/* TAMPILAN DETAIL BARU */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                    {/* Kapan (Tanggal & Waktu) */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-gray-600">{formatMeetingDate(startTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-gray-600">{formatMeetingTimeRange(startTime, endTime)}</p>
                      </div>
                    </div>
                    {/* Dimana (Lokasi & Link) */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-gray-600">
                          {location || (link ? 'Online' : 'Not set yet')}
                          {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-1">(Link Meeting)</a>}
                        </p>
                      </div>
                    </div>
                    {/* Siapa (Attendees) */}
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Attendees</p>
                        <p className="text-sm text-gray-600">{attendeeNames}</p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  {description && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{description}</p>
                    </div>
                  )}

                  {/* Outcome */}
                  {outcome && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Outcome</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{outcome}</p>
                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })
        ) : (
          <p className="text-gray-500 text-center p-4">There is no Meeting</p>
        )}
      </div>
    </div>
  );
}