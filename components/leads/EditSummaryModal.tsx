'use client';

import { useState, useEffect, FormEvent } from 'react';
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
import { updateLead } from '@/lib/api/leads'; // Asumsi ini ada
import { Loader2 } from 'lucide-react'; // <-- Import Loader2

// --- PERBAIKAN 1: Impor 'toast' dari 'sonner' ---
import { toast } from 'sonner';

import { Lead, TeamMember } from '@/lib/types';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { MultiSelect } from '@/components/ui/multi-select';

// --- PERBAIKAN 2: Definisikan API_URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- KONFIGURASI SOURCE (Mapping Origin -> Channel) ---
const SOURCE_MAP: Record<string, string[]> = {
  "Social Media": ["Instagram", "TikTok", "LinkedIn", "Facebook", "Twitter/X", "Youtube"],
  "Website": ["Contact Us Form", "Landing Page", "Chatbot", "Direct Traffic"],
  "Ads / Campaign": ["Google Ads", "Meta Ads", "TikTok Ads", "Email Marketing", "Billboard"],
  "Event / Offline": ["Exhibition", "Networking", "Walk-in", "Business Card", "Cold Call"],
  "Referral": ["Client", "Partner", "Employee", "Friend"],
  "Other": ["Other"]
};

interface EditSummaryModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
}

export default function EditSummaryModal({
  lead,
  open,
  onOpenChange,
  onLeadUpdated,
}: EditSummaryModalProps) {
  // --- PERBAIKAN 3: Hapus 'useToast()' ---
  // const { toast } = useToast(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Kita bisa gunakan state ini

  const { data: salesTeam, error: teamError } = useSWR<TeamMember[]>(
    `${API_URL}/sales`, 
    fetcher
  );

  const [formData, setFormData] = useState({
    value: '0',
    currency: 'IDR',
    company: '',
    contacts: '',
    priority: 'MEDIUM',
    clientType: '',
    label: '',
    dueDate: '',
    phone: '',
    email: '',
    description: '',
    // Tambahan Field Source
    sourceOrigin: '',
    sourceChannel: '',
    sourceChannelId: '',
  });

 const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (open && lead) {
      setFormData({
        value: lead?.value ? lead.value.toString() : '0',
        currency: lead?.currency || 'IDR',
        company: lead?.company || '',
        contacts: lead?.contacts || '',
        priority: lead?.priority || 'MEDIUM',
        label: lead?.label || '',
        clientType: lead?.clientType || '',
        dueDate: lead?.dueDate
          ? new Date(lead.dueDate).toISOString().split('T')[0]
          : '',
        phone: lead?.phone || '',
        email: lead?.email || '',
        description: lead?.description || '',
        // Populate Source fields
        sourceOrigin: lead?.sourceOrigin || '',
        sourceChannel: lead?.sourceChannel || '',
        sourceChannelId: lead?.sourceChannelId || '',
      });
      // --- PERBAIKAN: Isi state array assignedUserIds ---
      setAssignedUserIds(lead?.assignedUsers.map(user => user.id) || []);
    }
  }, [open, lead]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Reset Channel jika Origin berubah
      if (field === 'sourceOrigin') {
        newData.sourceChannel = ''; 
      }
      return newData;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setLoading(true);
    setError(''); // Reset error

    try {
      const updateData: any = {
        value: parseFloat(formData.value) || 0,
        currency: formData.currency,
        company: formData.company,
        contacts: formData.contacts,
        priority: formData.priority as any,
        label: formData.label,
        clientType: formData.clientType,
        dueDate: formData.dueDate || null,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        assignedUserIds: assignedUserIds, // Ini properti yang benar untuk dikirim
        // Source fields
        sourceOrigin: formData.sourceOrigin,
        sourceChannel: formData.sourceChannel,
        sourceChannelId: formData.sourceChannelId,
      };

      await updateLead(lead.id, updateData);
      // --- PERBAIKAN 4: Ubah sintaks 'toast' ke 'sonner' ---
      toast.success('', {
        description: 'Lead Summary updated successfully',
      });

      onLeadUpdated();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update lead';
      setError(errorMessage); // Set state error
      // --- PERBAIKAN 5: Ubah sintaks 'toast' ke 'sonner' ---
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const salesOptions = salesTeam?.map(member => ({
    value: member.id,
    label: member.name,
  })) || [];

  // Jika data lead belum siap (ini dari kode Anda, sudah benar)
  if (!lead) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Lead Data...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-24">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead Summary</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Value & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="dealValue">Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
                disabled={loading}
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

          {/* Company Name & Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter Company Name"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Enter Contact Person Name"
                value={formData.contacts}
                onChange={(e) => handleChange('contacts', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Priority & Assign To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="assignedToId">Assign to</Label>
              <MultiSelect
                options={salesOptions}
                selected={assignedUserIds}
                onChange={setAssignedUserIds}
                placeholder={
                  teamError ? "Gagal memuat tim" :
                  !salesTeam ? "Loading tim..." : "Pilih sales..."
                }
                className="w-full"
                disabled={loading || !!teamError || !salesTeam}
              />
            </div>
          </div>

          {/* Client Type & Label */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="clientType">Client Type</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => handleChange('clientType', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Client</SelectItem>
                  <SelectItem value="existing">Existing Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-1.5">
              <Label htmlFor="label">Label</Label>
              <Select 
                value={formData.label} 
                onValueChange={(value) => handleChange('label', value)}
                disabled={loading}
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
          </div>

          {/* Due Date & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* === LEAD SOURCE SECTION (NEW) === */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 text-sm flex items-center gap-2">
              Lead Source / Attribution
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Origin Dropdown */}
              <div className="grid gap-1.5">
                <Label htmlFor="sourceOrigin" className="text-xs text-gray-500">Origin (Asal)</Label>
                <Select 
                  value={formData.sourceOrigin} 
                  onValueChange={(value) => handleChange('sourceOrigin', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SOURCE_MAP).map((origin) => (
                      <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Channel Dropdown (Isinya tergantung Origin) */}
              <div className="grid gap-1.5">
                <Label htmlFor="sourceChannel" className="text-xs text-gray-500">Channel (Media)</Label>
                <Select 
                  value={formData.sourceChannel} 
                  onValueChange={(value) => handleChange('sourceChannel', value)}
                  disabled={loading || !formData.sourceOrigin}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={formData.sourceOrigin ? "Select Channel" : "Select Origin first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.sourceOrigin && SOURCE_MAP[formData.sourceOrigin]?.map((channel) => (
                      <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Channel ID Input */}
            <div className="grid gap-1.5">
                <Label htmlFor="sourceChannelId" className="text-xs text-gray-500">Channel ID / Username / Link (Optional)</Label>
                <Input
                  id="sourceChannelId"
                  className="bg-white"
                  placeholder="e.g. @instagram_username, form_id_123, or campaign_link"
                  value={formData.sourceChannelId}
                  onChange={(e) => handleChange('sourceChannelId', e.target.value)}
                  disabled={loading}
                />
            </div>
          </div>
          {/* ================================= */}

          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter lead description..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Tampilkan error jika ada */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Lead'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}