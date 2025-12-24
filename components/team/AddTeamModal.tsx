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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Loader2 } from 'lucide-react';
import { UserRole, UserStatus } from '@/lib/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AddTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamAdded: () => void; // Fungsi Mutate
}

export default function AddTeamModal({ open, onOpenChange, onTeamAdded }: AddTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Fungsi Skills
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    
    // Validasi password
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Siapkan body untuk API
    const body = {
      name: data.fullname,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      department: data.department,
      status: data.status,
      joinedAt: data.joinedDate,
      location: data.location,
      bio: data.bio,
      skills: skills, // Kirim array skills
      reportsToId: data.reportsTo || null,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create team member');
      }

      toast.success('Team member added successfully');
      onTeamAdded(); // Refresh list
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* --- INI BAGIAN YANG DIPERBAIKI --- */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="w-8 h-8 bg-gray-900">
              <AvatarFallback className="bg-gray-900 text-white">
                <span className="text-sm">+</span>
              </AvatarFallback>
            </Avatar>
            Add Team
          </DialogTitle>
        </DialogHeader>
        {/* --- AKHIR PERBAIKAN --- */}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="fullname">Full Name*</Label>
            <Input id="fullname" name="fullname" placeholder="Input Name Here" required disabled={loading} />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail*</Label>
              <Input id="email" name="email" type="email" placeholder="Input E-mail Here" required disabled={loading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone*</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Input Phone Number Here" required disabled={loading} />
            </div>
          </div>
          
          {/* Field Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password*</Label>
              <Input id="password" name="password" type="password" placeholder="Set a password" required disabled={loading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password*</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" required disabled={loading} />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role*</Label>
              <Select name="role" required defaultValue={UserRole.VIEWER} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SALES}>Sales</SelectItem>
                  <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="e.g., Sales" disabled={loading} />
            </div>
          </div>

          {/* Status, Joined Date, Location */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status*</Label>
              <Select name="status" required defaultValue={UserStatus.ACTIVE} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={UserStatus.ONBOARDING}>Onboarding</SelectItem>
                  <SelectItem value={UserStatus.ON_LEAVE}>On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="joinedDate">Joined At*</Label>
              <Input id="joinedDate" name="joinedDate" type="date" required disabled={loading} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Input Location" disabled={loading} />
            </div>
          </div>

          {/* Bio */}
          <div className="grid gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" placeholder="Input Bio" rows={4} className="resize-none" disabled={loading} />
            {/* Toolbar bisa dihapus jika tidak fungsional */}
          </div>

          {/* Skills */}
          <div className="grid gap-1.5">
            <Label htmlFor="skills">Skills</Label>
            <div className="space-y-2">
              <Input
                id="skills"
                placeholder="Input Your Skills Here"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                disabled={loading}
              />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-600"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reports to */}
          <div className="grid gap-1.5">
            <Label htmlFor="reportsTo">Reports to (User ID)</Label>
            <Input id="reportsTo" name="reportsTo" placeholder="Input User ID of manager" disabled={loading} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Create Team'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}