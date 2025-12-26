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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity, ActivityType } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  callId?: string | null;
  onCallAdded: () => void;
}

// Helper untuk menggabungkan tanggal dan waktu
const combineDateAndTime = (date: string, time: string): string => {
  if (!date || !time) return '';
  const [hours, minutes] = time.split(':');
  const d = new Date(date);
  d.setHours(parseInt(hours), parseInt(minutes));
  return d.toISOString();
};

// Helper untuk format ISO ke 'YYYY-MM-DD'
const formatToDate = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};

// Helper untuk format ISO ke 'HH:MM'
const formatToTime = (isoString?: string) => {
  if (!isoString) return '12:00'; // Default
  const date = new Date(isoString);
  return date.toTimeString().slice(0, 5);
};


export default function AddCallModal({ 
  open, 
  onOpenChange, 
  leadId, 
  callId, 
  onCallAdded 
}: AddCallModalProps) {
  
  const isEditMode = callId !== null && callId !== undefined;

  // --- State untuk semua field form ---
  const [callTitle, setCallTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [callDirection, setCallDirection] = useState('');
  const [callDate, setCallDate] = useState(''); // YYYY-MM-DD
  const [callTime, setCallTime] = useState('12:00'); // HH:MM
  const [duration, setDuration] = useState('15min');
  const [callStatus, setCallStatus] = useState('');
  const [callResult, setCallResult] = useState('');
  const [callNotes, setCallNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ambil data jika mode edit
  useEffect(() => {
    const fetchCallData = async () => {
      if (isEditMode && open) {
        setLoading(true);
        try {
          const data = await fetcher(
            `${API_URL}/leads/${leadId}/calls/${callId}`
          ) as LeadActivity;
          
          const meta = data.meta || {};
          setCallTitle(data.content);
          setContactName(meta.contactName || '');
          setCallDirection(meta.callDirection || '');
          setCallDate(formatToDate(meta.callTime));
          setCallTime(formatToTime(meta.callTime));
          setDuration(meta.duration || '15min');
          setCallStatus(meta.callStatus || '');
          setCallResult(meta.callResult || '');
          setCallNotes(meta.callNotes || '');

        } catch (err) {
          setError('Failed to load Call data');
          toast.error('Failed to load Call data');
        } finally {
          setLoading(false);
        }
      } else {
        // Reset form jika mode create
        setCallTitle('');
        setContactName('');
        setCallDirection('');
        setCallDate(new Date().toISOString().split('T')[0]); // Default hari ini
        setCallTime('12:00');
        setDuration('15min');
        setCallStatus('');
        setCallResult('');
        setCallNotes('');
        setError('');
      }
    };
    fetchCallData();
  }, [isEditMode, open, callId, leadId]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    // Siapkan body untuk API
    const body = {
      type: ActivityType.CALL,
      content: callTitle, // Title disimpan di 'content'
      meta: {         // Sisanya disimpan di 'meta'
        contactName,
        callDirection,
        callTime: combineDateAndTime(callDate, callTime),
        duration,
        callStatus,
        callResult,
        callNotes,
      }
    };

    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/calls/${callId}` // URL Update (PATCH)
      : `${API_URL}/leads/${leadId}/activities`;     // URL Create (POST)
    
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save Call');
      }

      toast.success(isEditMode ? 'Call successfully updated' : 'Call successfully created');
      onCallAdded(); // Panggil mutate (refresh list)
      onOpenChange(false); // Tutup modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'There is an error');
      toast.error(err instanceof Error ? err.message : 'There is an error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Call' : 'Add New Call'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Call Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="callTitle">Call Title</Label>
            <Input
              id="callTitle"
              placeholder="Enter Call Title"
              value={callTitle}
              onChange={(e) => setCallTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Contact Name & Call Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Chose Contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="callDirection">Call Direction</Label>
              <Select value={callDirection} onValueChange={setCallDirection} disabled={loading}>
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
            <div className="grid gap-1.5">
              <Label htmlFor="callDate">Call Date</Label>
              <Input 
                id="callDate" 
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="callTime">Call Time</Label>
              <Input 
                id="callTime"
                type="time"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration} disabled={loading}>
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
            <div className="grid gap-1.5">
              <Label htmlFor="callStatus">Call Status</Label>
              <Select value={callStatus} onValueChange={setCallStatus} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="callResult">Call Result</Label>
              <Select value={callResult} onValueChange={setCallResult} disabled={loading}>
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
          <div className="grid gap-1.5">
            <Label htmlFor="callNotes">Call Notes</Label>
            <Textarea
              id="callNotes"
              placeholder="Enter Call Notes"
              rows={4}
              className="resize-none"
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Update Call' : 'Add new call')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}