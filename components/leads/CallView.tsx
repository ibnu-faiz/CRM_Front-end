// components/leads/CallView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Phone, ChevronDown } from 'lucide-react';
import AddCallModal from './AddCallModal';

const mockCalls = [
  {
    id: 1,
    title: 'Call Schedule created',
    callTitle: "She's interested in your",
    date: 'Today, 12:00 PM',
    reminder: '15 minutes before',
    purpose: '15 minutes before',
    duration: '15 minute before',
    status: 'Completed',
  },
];

interface CallViewProps {
  leadId: string;
}

export default function CallView({ leadId }: CallViewProps) {
  const [isAddCallOpen, setIsAddCallOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<number | null>(null);
  const [expandedCall, setExpandedCall] = useState<number | null>(null);

  const handleEditCall = (callId: number) => {
    setSelectedCall(callId);
    setIsAddCallOpen(true);
  };

  const toggleExpand = (callId: number) => {
    setExpandedCall(expandedCall === callId ? null : callId);
  };

  return (
    <div className="space-y-4">
      {/* Add Call Button */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsAddCallOpen(true)}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Call
        </Button>
      </div> */}

      {/* Calls List */}
      <div className="space-y-4">
        {mockCalls.map((call) => (
          <Card key={call.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Call Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-900 text-white">
                      <Phone className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{call.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{call.date}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(call.id)}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedCall === call.id ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Call Title */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Call title</p>
                <p className="text-sm text-gray-600">{call.callTitle}</p>
              </div>

              {/* Collapsed View */}
              {!expandedCall || expandedCall !== call.id ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reminder</p>
                    <Select defaultValue={call.reminder.replace(' ', '-').toLowerCase()}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-minutes-before">15 minutes before</SelectItem>
                        <SelectItem value="30-minutes-before">30 minutes before</SelectItem>
                        <SelectItem value="1-hour-before">1 hour before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Call Purpose</p>
                    <Select defaultValue={call.purpose.replace(' ', '-').toLowerCase()}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-minutes-before">15 minutes before</SelectItem>
                        <SelectItem value="30-minutes-before">30 minutes before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                /* Expanded View */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Duration</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="duration" defaultChecked />
                          <Clock className="w-4 h-4" />
                          <span>15 minute before</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="duration" />
                          <Clock className="w-4 h-4" />
                          <span>15 minute before</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="duration" />
                          <Clock className="w-4 h-4" />
                          <span>30 minute before</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="duration" />
                          <Clock className="w-4 h-4" />
                          <span>45 minute before</span>
                        </label>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="status" defaultChecked />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Completed</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="status" />
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span>Succeeded</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="status" />
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span>Completed</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="status" />
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>Missed</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Call Modal */}
      <AddCallModal
        open={isAddCallOpen}
        onOpenChange={(open) => {
          setIsAddCallOpen(open);
          if (!open) setSelectedCall(null);
        }}
        callId={selectedCall}
      />
    </div>
  );
}