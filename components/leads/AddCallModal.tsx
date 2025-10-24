// components/leads/AddCallModal.tsx
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

interface AddCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callId?: number | null;
}

export default function AddCallModal({ open, onOpenChange, callId }: AddCallModalProps) {
  const isEditMode = callId !== null && callId !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEditMode ? 'Call updated' : 'Call created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Call' : 'Add New Call'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Call Title */}
          <div>
            <Label htmlFor="callTitle">Call Title</Label>
            <Input
              id="callTitle"
              placeholder="Enter Call Title"
              required
            />
          </div>

          {/* Contact Name & Call Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="[Sample]contact.name1"
              />
            </div>
            <div>
              <Label htmlFor="callDirection">Call Direction</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Call Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Call Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="callDate">Call Date</Label>
              <Input id="callDate" type="date" />
            </div>
            <div>
              <Label htmlFor="callTime">Call Time</Label>
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
              <Label htmlFor="duration">Duration</Label>
              <Select defaultValue="15min">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 Minutes</SelectItem>
                  <SelectItem value="30min">30 Minutes</SelectItem>
                  <SelectItem value="45min">45 Minutes</SelectItem>
                  <SelectItem value="1hour">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Call Status & Result */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callStatus">Call Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="succeeded">Succeeded</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="callResult">Call Result</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                  <SelectItem value="callback">Call Back Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Call Notes */}
          <div>
            <Label htmlFor="callNotes">Call Notes</Label>
            <Textarea
              id="callNotes"
              placeholder="Enter Call Notes"
              rows={4}
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

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            {isEditMode ? 'Update Call' : 'Add new call'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}