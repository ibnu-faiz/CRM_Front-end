'use client';

// --- 1. Imports ---
// External Libraries
import useSWR from 'swr';
import { User, Lock, Bell, Loader2 } from 'lucide-react';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

// Utils & Types
import { fetcher } from '@/lib/fetcher';
import { TeamMember } from '@/lib/types';

// Custom Profile Components
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileTabContent from '@/components/profile/ProfileTabContent';
import AccountTabContent from '@/components/profile/AccountTabContent';
import NotificationTabContent from '@/components/profile/NotificationTabContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const leadTabStyle = `
  flex-1 h-full 
  flex items-center justify-center gap-2
  text-sm font-medium
  transition-all
  cursor-pointer
  
  /* 1. MATIKAN TOTAL FOCUS RING (KOTAK HITAM SAAT KLIK) */
  !ring-0 
  !ring-offset-0 
  !outline-none 
  focus:!ring-0 
  focus:!ring-offset-0 
  focus:!outline-none 
  focus-visible:!ring-0 
  focus-visible:!ring-offset-0 
  focus-visible:!outline-none

  /* 2. MATIKAN BACKGROUND PUTIH & SHADOW DEFAULT */
  rounded-none 
  !shadow-none 
  !bg-transparent 
  data-[state=active]:!shadow-none 
  data-[state=active]:!bg-transparent
  
  /* 3. LOGIKA GARIS BAWAH */
  border-b-2 
  border-transparent 
  data-[state=active]:border-gray-900 
  
  /* 4. WARNA TEKS */
  text-gray-500 
  data-[state=active]:text-gray-900 
  hover:text-gray-700 
  hover:!bg-gray-50
`;

// --- 3. Main Component ---
export default function ProfilePage() {
  const { data, error, isLoading, mutate } = useSWR<{ user: TeamMember }>(`${API_URL}/auth/profile`, fetcher);
  const user = data?.user;

  // Loading State
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
      </div>
    );
  }

  // Error State
  if (error || !user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen text-red-500">
        <p>Failed to load profile data.</p>
      </div>
    );
  }

  // Success State
  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 bg-gray-50 min-h-screen">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* --- LEFT COLUMN: SIDEBAR --- */}
        <div className="lg:col-span-4">
           <ProfileSidebar user={user} />
        </div>

        {/* --- RIGHT COLUMN: TABS CONTENT --- */}
        <div className="lg:col-span-8">
          <Card className="border-gray-200 shadow-sm bg-white min-h-[600px]">
            <Tabs defaultValue="profile" className="w-full">
              
              {/* Tabs Header Navigation */}
              <div className="w-full border-b border-gray-200 bg-white">
                <TabsList className="flex w-full h-11 p-0 bg-transparent justify-start">
                  
                  <TabsTrigger value="profile" className={leadTabStyle}>
                    <User className="w-4 h-4" /> Profile
                  </TabsTrigger>

                  <TabsTrigger value="account" className={leadTabStyle}>
                    <Lock className="w-4 h-4" /> Account
                  </TabsTrigger>

                  <TabsTrigger value="notifications" className={leadTabStyle}>
                    <Bell className="w-4 h-4" /> Notifications
                  </TabsTrigger>

                </TabsList>
              </div>

              {/* --- TAB CONTENTS --- */}
              
              {/* 1. Profile Details Form */}
              <TabsContent value="profile" className="p-8 animate-in fade-in-50">
                <ProfileTabContent user={user} mutate={mutate} />
              </TabsContent>

              {/* 2. Password & Security */}
              <TabsContent value="account" className="p-8 animate-in fade-in-50">
                 <AccountTabContent />
              </TabsContent>

              {/* 3. Notifications Settings */}
              <TabsContent value="notifications" className="p-8 animate-in fade-in-50">
                 <NotificationTabContent />
              </TabsContent>

            </Tabs>
          </Card>
        </div>

      </div>
    </div>
  );
}