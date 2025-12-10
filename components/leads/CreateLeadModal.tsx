// components/leads/CreateLeadModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { CreateLeadData, LeadStatus, LeadPriority } from '@/lib/types';

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeadData) => Promise<any>;
}

export default function CreateLeadModal({ open, onOpenChange, onSubmit }: CreateLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLeadData>({
    title: '',
    company: '',
    email: '',
    phone: '',
    value: 0,
    currency: 'IDR',
    status: LeadStatus.LEAD_IN,
    priority: LeadPriority.MEDIUM,
    label: '',
    contacts: '',
    dueDate: '',
    description: '',
  });

  const handleChange = (field: keyof CreateLeadData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Remove empty fields
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '' && v !== null)
      ) as CreateLeadData;

      await onSubmit(cleanData);
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        email: '',
        phone: '',
        value: 0,
        currency: 'IDR',
        status: LeadStatus.LEAD_IN,
        priority: LeadPriority.MEDIUM,
        label: '',
        contacts: '',
        dueDate: '',
        description: '',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create lead:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="grid gap-1.5">
            <Label htmlFor="title">Lead Title</Label>
            <Input
              id="title"
              placeholder="Enter Lead Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* Company & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Phone & Contacts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+62 xxx xxx xxx"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contacts">Contact Person</Label>
              <Input
                id="contacts"
                placeholder="Contact Name"
                value={formData.contacts}
                onChange={(e) => handleChange('contacts', e.target.value)}
              />
            </div>
          </div>

          {/* Value & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="0"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadStatus.LEAD_IN}>Lead In</SelectItem>
                  <SelectItem value={LeadStatus.CONTACT_MADE}>Contact Made</SelectItem>
                  <SelectItem value={LeadStatus.NEED_IDENTIFIED}>Need Identified</SelectItem>
                  <SelectItem value={LeadStatus.PROPOSAL_MADE}>Proposal Made</SelectItem>
                  <SelectItem value={LeadStatus.NEGOTIATION}>Negotiation</SelectItem>
                  <SelectItem value={LeadStatus.CONTRACT_SEND}>Contract Send</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleChange('priority', value as LeadPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LeadPriority.LOW}>Low</SelectItem>
                  <SelectItem value={LeadPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={LeadPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Label & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="label">Label</Label>
              <Select 
                value={formData.label || ''} 
                onValueChange={(value) => handleChange('label', value)}
              >
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
            <div className="grid gap-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter Lead Description"
              rows={4}
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {formData.description?.length || 0}/500
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gray-800 hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}