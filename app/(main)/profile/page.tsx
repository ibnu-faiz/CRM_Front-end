// app/(main)/profile/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Lock, Bell, Phone, Mail, MapPin, Briefcase, Users, Calendar, X, Save } from 'lucide-react';

export default function ProfilePage() {
  const [skills, setSkills] = useState(['Wireframing', 'Figma', 'Design System']);

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card with Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Profile Header with Cover */}
          <div className="relative bg-gray-200 h-40">
            {/* Cover Image Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Profile Picture - Overlapping */}
            <div className="absolute left-8 -bottom-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="text-2xl font-bold bg-gray-300">M</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="pt-20 px-8 pb-6 border-b">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Mahendra</h2>
              <Badge className="bg-gray-800 hover:bg-gray-700">status</Badge>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+6287793245764</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Malang, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>mahendra123@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="profile" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-8 py-4"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-8 py-4"
              >
                <Lock className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent px-8 py-4"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab Content */}
            <TabsContent value="profile" className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullname">Fullname</Label>
                        <Input id="fullname" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="placeholder_input"
                          rows={4}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Work Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="department">Departemen</Label>
                        <Input id="department" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="mt-2">
                          <Badge className="bg-gray-800 hover:bg-gray-700">active</Badge>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="joinedDate">Joined Date</Label>
                        <Input id="joinedDate" type="date" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label htmlFor="reportsTo">Reports To</Label>
                        <Input id="reportsTo" placeholder="placeholder_input" />
                      </div>
                      <div>
                        <Label>Skills & Expertise</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="secondary"
                              className="px-3 py-1 gap-1"
                            >
                              {skill}
                              <button 
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button className="bg-gray-800 hover:bg-gray-700 gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            {/* Account Tab Content */}
            <TabsContent value="account" className="p-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Account</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Manage your account</p>

                <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <Label htmlFor="currentPassword">Password</Label>
                    <p className="text-sm text-gray-500 mb-2">Current Password *</p>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      placeholder="placeholder_input"
                    />
                    <p className="text-xs text-red-500 mt-1">The current password is incorrect</p>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password *</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      placeholder="placeholder_input"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The new password must be at least 8 characters long.<br />
                      The new password must include a combination of letters and numbers<br />
                      The new password cannot be the same as the current password
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="placeholder_input"
                      className="mt-2"
                    />
                    <p className="text-xs text-red-500 mt-1">The confirmation password does not match the new password</p>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button className="bg-gray-800 hover:bg-gray-700 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab Content */}
            <TabsContent value="notifications" className="p-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Notifications settings</h3>
                </div>
                <p className="text-sm text-gray-500 mb-8">Manage how you receive notifications</p>

                <div className="space-y-8">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="font-semibold mb-4">Deal Update</h4>
                    <p className="text-sm text-gray-500 mb-4">Receive email when deals are updated</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">Activity Reminder</p>
                          <p className="text-sm text-gray-500">Receive Reminders for upcoming activities</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">Marketing</p>
                          <p className="text-sm text-gray-500">Receive marketing emails and newsletter</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-6">Push Notifications</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">Deal Update</p>
                          <p className="text-sm text-gray-500">Receive push notifications when deals are updated</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">Receive Reminder</p>
                          <p className="text-sm text-gray-500">Receive reminders for upcoming activities</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button className="bg-gray-800 hover:bg-gray-700 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}