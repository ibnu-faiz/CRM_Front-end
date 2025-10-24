// components/leads/CreateLeadModal.tsx
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateLeadModal({ open, onOpenChange }: CreateLeadModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create lead');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="w-8 h-8 bg-gray-900">
              <AvatarFallback className="bg-gray-900 text-white">
                <Plus className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            Create New Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-1">
          {/* Lead Title */}
          <div>
            <Label htmlFor="leadTitle">Lead Title</Label>
            <Input
              id="leadTitle"
              placeholder="Enter Lead Title"
              required
            />
          </div>

          {/* Value & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="idr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idr">IDR</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stage & Label */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead-in">Lead In</SelectItem>
                  <SelectItem value="contact-made">Contact Made</SelectItem>
                  <SelectItem value="need-identified">Need Identified</SelectItem>
                  <SelectItem value="proposal-made">Proposal Made</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="contract-send">Contract Send</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="label">Label</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="pitching">Pitching</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <Label htmlFor="contacts">Contacts</Label>
            <Input
              id="contacts"
              placeholder="Enter Contacts Name"
            />
          </div>

          {/* Team Member */}
          <div>
            <Label htmlFor="teamMember">Team Member</Label>
            <Input
              id="teamMember"
              placeholder="Enter Team Member Name"
            />
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter Lead Description"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            Create Lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}