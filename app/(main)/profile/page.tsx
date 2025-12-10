'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Lock, Bell, Phone, Mail, MapPin, Briefcase, 
  Calendar, X, Save, Loader2, Edit2, Plus 
} from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { TeamMember, UserRole } from '@/lib/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper format tanggal
const formatToDate = (isoString?: string | null) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};

export default function ProfilePage() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // Mode Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // --- SWR ---
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR<{ user: TeamMember }>(`${API_URL}/auth/profile`, fetcher);
  
  const user = data?.user;

  // --- State Profile ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [reportsTo, setReportsTo] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // --- State Password ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Effect: Isi Form ---
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setDepartment(user.department || '');
      setRole(user.role || '');
      setJoinedAt(user.joinedAt || user.createdAt);
      
      // Handle Reports To (Manager Name)
      setReportsTo(user.reportsTo ? user.reportsTo.name : 'No manager assigned');

      let skillsArray: string[] = [];
      if (typeof user.skills === 'string') {
        try { skillsArray = JSON.parse(user.skills); } catch (e) { skillsArray = []; }
      } else if (Array.isArray(user.skills)) {
        skillsArray = user.skills;
      }
      setSkills(skillsArray);
    }
  }, [user]);

  // --- Handlers ---
  
  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);

    const body = {
      name,
      phone,
      location,
      bio,
      skills, // Array skills dikirim di sini
      department,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui profil');
      }
      
      toast.success('Profile updated successfully');
      mutate(); // Refresh data SWR
      setIsEditingProfile(false); // Keluar mode edit
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoadingPassword(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false); // Keluar mode edit
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (isLoading) return (
    <div className="p-6 flex justify-center items-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  );
  
  if (error || !user) return (
    <div className="p-6 flex flex-col items-center justify-center h-screen text-red-500">
        <p>Gagal memuat profil.</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">Coba Lagi</Button>
    </div>
  );

  // Logic Role Check
  const isAdmin = user.role === UserRole.ADMIN;
  const isSales = user.role === UserRole.SALES;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardContent className="p-0">
          
          {/* Profile Header / Cover */}
          <div className="relative bg-gray-100 h-48 w-full">
            <div className="absolute left-8 -bottom-12">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-sm bg-white">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-4xl font-bold bg-gray-900 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Info Singkat */}
          <div className="pt-16 px-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <Badge variant="secondary" className="capitalize">
                  {user.status ? user.status.toLowerCase().replace('_', ' ') : 'active'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
               <div className="flex items-center gap-1.5">
                 <Phone className="w-4 h-4" />
                 <span>{user.phone || '-'}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <MapPin className="w-4 h-4" />
                 <span>{user.location || '-'}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <Mail className="w-4 h-4" />
                 <span>{user.email}</span>
               </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b border-gray-200 px-8 bg-white sticky top-0 z-10">
                <TabsList className="h-auto p-0 bg-transparent">
                    <TabsTrigger 
                        value="profile" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-4 px-2 mr-6 font-medium text-gray-500 data-[state=active]:text-gray-900"
                    >
                        <User className="w-4 h-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger 
                        value="account" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-4 px-2 mr-6 font-medium text-gray-500 data-[state=active]:text-gray-900"
                    >
                        <Lock className="w-4 h-4 mr-2" /> Account
                    </TabsTrigger>
                    <TabsTrigger 
                        value="notifications" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:shadow-none py-4 px-2 font-medium text-gray-500 data-[state=active]:text-gray-900"
                    >
                        <Bell className="w-4 h-4 mr-2" /> Notifications
                    </TabsTrigger>
                </TabsList>
            </div>

            {/* --- TAB: PROFILE --- */}
            <TabsContent value="profile" className="p-8 animate-in fade-in-50 duration-300">
              {/* Tombol Edit di Kanan Atas Tab */}
              <div className="flex justify-end mb-6">
                 {!isEditingProfile ? (
                   <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="gap-2">
                     <Edit2 className="w-4 h-4" /> Edit Profile
                   </Button>
                 ) : (
                   <Button onClick={() => setIsEditingProfile(false)} variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                     Cancel
                   </Button>
                 )}
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Kolom Kiri: Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <User className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="fullname">Fullname</Label>
                            <Input id="fullname" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditingProfile || loadingProfile} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={true} className="bg-gray-50" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditingProfile || loadingProfile} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={!isEditingProfile || loadingProfile} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea 
                                id="bio" 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="resize-none"
                                disabled={!isEditingProfile || loadingProfile}
                            />
                            <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                        </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Work Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={!isEditingProfile || loadingProfile} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" value={role} disabled className="bg-gray-50" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="joinedDate">Joined Date</Label>
                            <Input id="joinedDate" type="date" value={formatToDate(joinedAt)} disabled className="bg-gray-50" />
                        </div>
                        
                        {/* PERBAIKAN: HANYA TAMPIL JIKA BUKAN ADMIN */}
                        {!isAdmin && (
                           <div className="grid gap-1.5">
                              <Label htmlFor="reportsTo">Reports To (Manager)</Label>
                              <Input id="reportsTo" value={reportsTo} disabled className="bg-gray-50" />
                           </div>
                        )}

                        {/* Daftar Lead untuk Sales */}
                        {isSales && (
                           <div className="grid gap-1.5 mt-2">
                              <Label>Assigned Leads (Active Projects)</Label>
                              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto">
                                {user.assignedLeads && user.assignedLeads.length > 0 ? (
                                  <ul className="space-y-2">
                                    {user.assignedLeads.map((lead) => (
                                      <li key={lead.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{lead.title}</p>
                                          <p className="text-[10px] text-gray-500">{lead.company || 'No Company'}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                          {lead.status.replace('_', ' ')}
                                        </Badge>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-400 italic text-center py-2">No leads assigned yet.</p>
                                )}
                              </div>
                           </div>
                        )}
                        
                        <div className="grid gap-1.5">
                            <Label>Skills & Expertise</Label>
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] items-center">
                                {skills.length > 0 ? skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                        {skill}
                                        {isEditingProfile && (
                                            <button 
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-gray-500" />
                                            </button>
                                        )}
                                    </Badge>
                                )) : <span className="text-sm text-gray-400 italic">No skills added</span>}
                            </div>
                            
                            {/* Input Skill hanya muncul saat Edit */}
                            {isEditingProfile && (
                              <div className="flex gap-2">
                                <Input 
                                    placeholder="Type a skill..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); 
                                            addSkill();
                                        }
                                    }}
                                />
                                <Button type="button" variant="secondary" onClick={addSkill}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                        </div>
                    </div>
                  </div>

                </div>

                {/* Tombol Save hanya muncul saat Edit Mode */}
                {isEditingProfile && (
                  <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-800 min-w-[120px]" disabled={loadingProfile}>
                      {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            {/* --- TAB: ACCOUNT --- */}
            <TabsContent value="account" className="p-8 max-w-3xl animate-in fade-in-50 duration-300">
              {/* Tombol Edit Password */}
              <div className="flex justify-end mb-6">
                 {!isEditingPassword ? (
                   <Button onClick={() => setIsEditingPassword(true)} variant="outline" className="gap-2">
                     <Edit2 className="w-4 h-4" /> Change Password
                   </Button>
                 ) : (
                   <Button onClick={() => setIsEditingPassword(false)} variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                     Cancel
                   </Button>
                 )}
              </div>

              <form onSubmit={handlePasswordChange}>
                  <div className="flex items-center gap-2 pb-2 mb-6 border-b border-gray-100">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Password Settings</h3>
                  </div>

                  <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                    <div className="grid gap-1.5">
                      <Label htmlFor="currentPassword">Current Password *</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-2"
                        disabled={!isEditingPassword || loadingPassword}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="newPassword">New Password *</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-2"
                        disabled={!isEditingPassword || loadingPassword}
                      />
                      <p className="text-xs text-gray-500">Minimum 8 characters.</p>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-2"
                        disabled={!isEditingPassword || loadingPassword}
                      />
                    </div>
                  </div>

                  {isEditingPassword && (
                    <div className="flex justify-end pt-6 mt-6">
                      <Button type="submit" className="bg-gray-900 hover:bg-gray-800 min-w-[140px]" disabled={loadingPassword}>
                        {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                      </Button>
                    </div>
                  )}
              </form>
            </TabsContent>

            {/* --- TAB: NOTIFICATIONS (Sesuai Wireframe) --- */}
            <TabsContent value="notifications" className="p-8 max-w-3xl animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-2 pb-2 mb-6 border-b border-gray-100">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Notifications settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-8">Manage how you receive notifications</p>
                
                <div className="space-y-8">
                   {/* Group 1 */}
                   <div>
                      <h4 className="font-semibold mb-4">Deal Update</h4>
                      <p className="text-sm text-gray-500 mb-4">Receive email when deals are updated</p>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-50">
                              <div>
                                  <p className="font-medium text-sm">Activity Reminder</p>
                                  <p className="text-xs text-gray-500">Receive Reminders for upcoming activities</p>
                              </div>
                              <Switch />
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-50">
                              <div>
                                  <p className="font-medium text-sm">Marketing</p>
                                  <p className="text-xs text-gray-500">Receive marketing emails and newsletter</p>
                              </div>
                              <Switch />
                          </div>
                      </div>
                   </div>

                   {/* Group 2: Push Notifications */}
                   <div className="pt-6 border-t border-gray-100">
                      <h4 className="font-semibold mb-6">Push Notifications</h4>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-50">
                              <div>
                                  <p className="font-medium text-sm">Deal Update</p>
                                  <p className="text-xs text-gray-500">Receive push notifications when deals are updated</p>
                              </div>
                              <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-3 border-b border-gray-50">
                              <div>
                                  <p className="font-medium text-sm">Receive Reminder</p>
                                  <p className="text-xs text-gray-500">Receive reminders for upcoming activities</p>
                              </div>
                              <Switch defaultChecked />
                          </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-end mt-8">
                    <Button className="bg-gray-900 hover:bg-gray-800 gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                    </Button>
                </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}