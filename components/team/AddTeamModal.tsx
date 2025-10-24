// components/team/AddTeamModal.tsx
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Bold, Italic, Underline, List, Link as LinkIcon, Image } from 'lucide-react';

interface AddTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTeamModal({ open, onOpenChange }: AddTeamModalProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullname">Full Name*</Label>
            <Input
              id="fullname"
              placeholder="Input Your Full Name Here"
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail*</Label>
              <Input
                id="email"
                type="email"
                placeholder="Input Your E-mail Here"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone*</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Input Your Phone Number Here"
                required
              />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role*</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department*</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status, Joined Date, Location */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status*</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="joinedDate">Joined At*</Label>
              <Input id="joinedDate" type="date" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Input Location" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <div className="space-y-2">
              <Textarea
                id="bio"
                placeholder="Input Bio"
                rows={4}
                className="resize-none"
              />
              
              {/* Rich Text Editor Toolbar */}
              <div className="flex items-center gap-1 border-t pt-2">
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
              <p className="text-xs text-gray-500 text-right">0/100</p>
            </div>
          </div>

          {/* Skills */}
          <div>
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
          <div>
            <Label htmlFor="reportsTo">Reports to</Label>
            <Input id="reportsTo" placeholder="—" />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            Create Team
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}