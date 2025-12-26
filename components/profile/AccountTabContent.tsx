// components/profile/AccountTabContent.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountTabContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (!res.ok) throw new Error('Failed');
        toast.success('Password updated');
        setIsEditing(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
        toast.error('Failed to update password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500">Update your password and security preferences.</p>
            </div>
            <div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="w-3 h-3" /> Change Password
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Cancel</Button>
                )}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="grid gap-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={!isEditing} className="bg-white"/>
                </div>
                <div className="grid gap-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={!isEditing} className="bg-white"/>
                </div>
                <div className="grid gap-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={!isEditing} className="bg-white"/>
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-end pt-6">
                    <Button type="submit" className="bg-gray-900" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Update Password'}
                    </Button>
                </div>
            )}
        </form>
    </div>
  );
}