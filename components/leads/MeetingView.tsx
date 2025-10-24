// components/leads/MeetingView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, MoreHorizontal } from 'lucide-react';
import AddMeetingModal from './AddMeetingModal';

const mockMeetings = [
  {
    id: 1,
    title: 'Meeting by',
    organizer: 'name@gmail.com',
    attendees: 'Hay guys....',
    outcome: 'Engagement with our lead ideas for further development of department',
    date: 'Today, 12:00 PM',
    attendeesCount: 3,
    duration: '1 hours 30 min',
  },
];

interface MeetingViewProps {
  leadId: string;
}

export default function MeetingView({ leadId }: MeetingViewProps) {
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);

  const handleEditMeeting = (meetingId: number) => {
    setSelectedMeeting(meetingId);
    setIsAddMeetingOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Add Meeting Button */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsAddMeetingOpen(true)}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Meeting
        </Button>
      </div> */}

      {/* Meetings List */}
      <div className="space-y-4">
        {mockMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Meeting Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-900 text-white">
                      M
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                    <p className="text-sm text-gray-500">Organized by</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{meeting.date}</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{meeting.organizer}</span>
              </div>

              {/* Attendee Description */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Attendee description</p>
                <p className="text-sm text-gray-600">{meeting.attendees}</p>
              </div>

              {/* Outcome */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Outcome</p>
                <p className="text-sm text-gray-600">{meeting.outcome}</p>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Attendees</span>
                  </div>
                  <span className="font-medium">{meeting.attendeesCount} Attendes</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <span className="font-medium">{meeting.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Meeting Modal */}
      <AddMeetingModal
        open={isAddMeetingOpen}
        onOpenChange={(open) => {
          setIsAddMeetingOpen(open);
          if (!open) setSelectedMeeting(null);
        }}
        meetingId={selectedMeeting}
      />
    </div>
  );
}