// components/leads/AddMeetingModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bold, Italic, Underline, List, Link as LinkIcon, Image } from 'lucide-react';

interface AddMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId?: number | null;
}

export default function AddMeetingModal({ open, onOpenChange, meetingId }: AddMeetingModalProps) {
  const isEditMode = meetingId !== null && meetingId !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEditMode ? 'Meeting updated' : 'Meeting created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Meeting' : 'Add New Meeting'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div>
            <Label htmlFor="meetingTitle">Meeting Title</Label>
            <Input
              id="meetingTitle"
              placeholder="Enter Meeting..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              rows={3}
              className="resize-none"
            />
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 border-t pt-2 mt-2">
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Image className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
          </div>

          {/* Time and Date Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Time and date</h3>
            
            {/* Date & Attendees */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="attendees">Attendees</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Attendees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="bob">Bob Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startTime">Start time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>
                        {i < 12 ? `${i === 0 ? 12 : i}:00 AM` : `${i === 12 ? 12 : i - 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime">End time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>
                        {i < 12 ? `${i === 0 ? 12 : i}:00 AM` : `${i === 12 ? 12 : i - 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Time zone</Label>
                <Select defaultValue="asia">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia">Asia/Jakarta</SelectItem>
                    <SelectItem value="america">America/New_York</SelectItem>
                    <SelectItem value="europe">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location & Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="client">Client Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="linkMeeting">Link Meeting</Label>
              <Input
                id="linkMeeting"
                placeholder="Input Link Meeting..."
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <Label htmlFor="reminder">Reminder</Label>
            <Select defaultValue="5min">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">5 minutes before</SelectItem>
                <SelectItem value="10min">10 minutes before</SelectItem>
                <SelectItem value="15min">15 minutes before</SelectItem>
                <SelectItem value="30min">30 minutes before</SelectItem>
                <SelectItem value="1hour">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Outcome */}
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              placeholder="Describe the meeting outcome..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            {isEditMode ? 'Update Meeting' : 'Create Meeting'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}