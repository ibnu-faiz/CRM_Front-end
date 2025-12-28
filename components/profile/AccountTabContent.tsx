// components/profile/AccountTabContent.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'sonner'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountTabContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Validasi Client Side
   if (!currentPassword || !newPassword || !confirmPassword) {
        return toast.error("All fields are required");
    }
    if (newPassword !== confirmPassword) {
        return toast.error("Passwords do not match");
    }
    
    // SINKRONISASI 1: Ubah minimal karakter jadi 8 (Sesuai Backend)
    if (newPassword.length < 8) {
        return toast.error("New password must be at least 8 characters long");
    }
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await res.json(); 

        if (!res.ok) {
            // SINKRONISASI 2: Backend Anda pakai key 'error', bukan 'message'
            throw new Error(data.error || 'Gagal memperbarui password');
        }
        
        // Backend kirim sukses pakai key 'message' (Ini sudah cocok)
        toast.success(data.message || 'Password berhasil diperbarui');
        
        setIsEditing(false);
        setCurrentPassword(''); 
        setNewPassword(''); 
        setConfirmPassword('');
        
    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
  };

  // Helper render input (Sama seperti sebelumnya)
  const renderPasswordInput = (
    label: string, 
    value: string, 
    setValue: (val: string) => void, 
    show: boolean, 
    setShow: (val: boolean) => void 
  ) => (
    <div className="grid gap-2 relative">
        <Label>{label}</Label>
        <div className="relative">
            <Input 
                type={show ? "text" : "password"} 
                value={value} 
                onChange={e => setValue(e.target.value)} 
                disabled={!isEditing} 
                className="bg-white pr-10" 
            />
            {isEditing && (
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            )}
        </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
         <Toaster position="top-right" richColors />
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500">Update your password and security preferences.</p>
            </div>
            <div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="gap-2">
                        <Edit2 className="w-3 h-3" /> Change Password
                    </Button>
                ) : (
                    <Button 
                        onClick={() => {
                            setIsEditing(false);
                            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                        }} 
                        variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                {renderPasswordInput("Current Password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
                {renderPasswordInput("New Password", newPassword, setNewPassword, showNew, setShowNew)}
                {renderPasswordInput("Confirm Password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}
            </div>

            {isEditing && (
                <div className="flex justify-end pt-6">
                    <Button type="submit" className="bg-gray-900 text-white" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null}
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            )}
        </form>
    </div>
  );
}