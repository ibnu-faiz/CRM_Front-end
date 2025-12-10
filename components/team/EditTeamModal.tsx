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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { TeamMember, UserRole, UserStatus } from '@/lib/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EditTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
  onTeamUpdated: () => void;
}

export default function EditTeamModal({ open, onOpenChange, member, onTeamUpdated }: EditTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SAFETY CHECK: Jika member null (walaupun jarang terjadi di arsitektur ini), jangan render apa-apa
  if (!member) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    // Hanya field Admin yang dikirim
    const body = {
      role: data.role,
      department: data.department,
      status: data.status,
      joinedAt: data.joinedAt, 
      reportsToId: data.reportsTo || null,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/team/${member.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update team member');
      }

      toast.success('Team member updated successfully');
      onTeamUpdated();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal aman
  const formattedJoinedAt = member.joinedAt 
    ? new Date(member.joinedAt).toISOString().split('T')[0] 
    : member.createdAt 
      ? new Date(member.createdAt).toISOString().split('T')[0] 
      : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
                <p>Edit Team Member</p>
                <p className="text-sm font-normal text-gray-500">{member.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Info Read-Only */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
             <div>
                <span className="block text-xs text-gray-500">Email</span>
                <span className="font-medium text-gray-700">{member.email}</span>
             </div>
             <div>
                <span className="block text-xs text-gray-500">Phone</span>
                <span className="font-medium text-gray-700">{member.phone || '-'}</span>
             </div>
          </div>

          {/* Field Edit Admin */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required defaultValue={member.role} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SALES}>Sales</SelectItem>
                  <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select name="status" required defaultValue={member.status} disabled={loading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={UserStatus.ONBOARDING}>Onboarding</SelectItem>
                  <SelectItem value={UserStatus.ON_LEAVE}>On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue={member.department || ''} disabled={loading} placeholder="e.g., Sales" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="joinedAt">Joined Date</Label>
              <Input id="joinedAt" name="joinedAt" type="date" defaultValue={formattedJoinedAt} disabled={loading} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reportsTo">Reports To (Manager ID)</Label>
            <Input id="reportsTo" name="reportsTo" defaultValue={member.reportsToId || ''} disabled={loading} placeholder="User ID" />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
             <Button type="submit" className="bg-gray-800 hover:bg-gray-700" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
             </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}