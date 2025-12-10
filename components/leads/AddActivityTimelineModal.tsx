// components/leads/AddActivityTimelineModal.tsx
'use client';

import { useState, FormEvent } from 'react';
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
import { ActivityType } from '@/lib/types'; // <-- Impor dari lib/types
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  onActivityAdded: () => void; // Fungsi refresh
}

export default function AddActivityTimelineModal({
  open,
  onOpenChange,
  leadId,
  onActivityAdded,
}: AddActivityModalProps) {
  // Set default ke CALL
  const [type, setType] = useState<string>(ActivityType.CALL);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType(ActivityType.CALL);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token'); // SESUAIKAN
      const res = await fetch(`${API_URL}/leads/${leadId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: type,
          content: title, // 'content' di DB adalah 'title' di form
          meta: { description: description }, // 'meta' di DB berisi 'description'
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create activity');
      }

      onActivityAdded(); // Refresh timeline
      onOpenChange(false); // Tutup modal
      resetForm(); // Reset form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Kita filter NOTE karena punya modal sendiri */}
                  <SelectItem value={ActivityType.CALL}>Call</SelectItem>
                  <SelectItem value={ActivityType.MEETING}>Meeting</SelectItem>
                  <SelectItem value={ActivityType.EMAIL}>Email</SelectItem>
                  <SelectItem value={ActivityType.TASK}>Task</SelectItem>
                  <SelectItem value={ActivityType.INVOICE}>Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Follow-up call"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter activity description..."
              rows={6}
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Activity'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}