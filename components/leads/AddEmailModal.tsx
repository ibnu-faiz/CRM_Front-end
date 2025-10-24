// components/leads/AddEmailModal.tsx
'use client';

import { useState } from 'react';
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
import { Send } from 'lucide-react';

interface AddEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailId?: number | null;
}

export default function AddEmailModal({
  open,
  onOpenChange,
  emailId,
}: AddEmailModalProps) {
  const isEditMode = emailId !== null && emailId !== undefined;

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEditMode ? 'Email updated' : 'Email sent');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ✅ tampil seperti AddInvoiceModal */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Email' : 'Add New Email'}</DialogTitle>
        </DialogHeader>

        {/* ✅ spasi antar elemen rapi */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Recipient */}
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="Enter recipient email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {message.length}/1000
            </p>
          </div>

          {/* Attachments (optional) */}
          <div>
            <Label htmlFor="attachment">Attachment</Label>
            <Input id="attachment" type="file" />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .pdf, .docx, .png, .jpg
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gray-800 hover:bg-gray-700 gap-2"
            >
              <Send className="w-4 h-4" />
              {isEditMode ? 'Update Email' : 'Send Email'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
