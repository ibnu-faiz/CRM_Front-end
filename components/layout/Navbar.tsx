'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import Link from 'next/link';
import useSWR from 'swr';
import { 
  Search, Bell, Moon, ChevronDown, Menu, Loader2, LogOut, User, Settings,
  Home, Users, Globe, HelpCircle // Icon untuk menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetcher } from '@/lib/fetcher';
import { TeamMember } from '@/lib/types';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import { cn } from '@/lib/utils'; // Helper untuk classNames

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Menu Items (Sama seperti di Sidebar.tsx)
const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Globe, label: 'Leads', href: '/leads' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const bottomItems = [
  { icon: HelpCircle, label: 'Get Help', href: '/help' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Untuk highlight menu aktif
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State untuk Sheet
  
  const { data, error, isLoading } = useSWR<{ user: TeamMember }>(`${API_URL}/auth/profile`, fetcher);
  const user = data?.user;

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    router.push('/login');
    setIsLogoutDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        
        {/* --- MOBILE MENU (SHEET) --- */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-6 border-b border-gray-200 text-left">
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm">Logo</div>
                  Company Name
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)} // Tutup menu saat diklik
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 space-y-1 border-t border-gray-200">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* --- END MOBILE MENU --- */}


        {/* Center: Search Bar (Hidden on very small screens if needed, or styled) */}
        <div className="flex-1 max-w-md mx-4 md:mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-10 bg-gray-50 border-gray-200 w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifikasi & Dark Mode disembunyikan di HP agar tidak penuh, atau biarkan jika muat */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <div className="w-6 h-6 bg-gray-900 rounded-full"></div>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Moon className="w-5 h-5" />
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (user ? getInitials(user.name) : 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {isLoading ? 'Loading...' : (error ? 'Error' : user?.name)}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={(e) => {
                    e.preventDefault();
                    setIsLogoutDialogOpen(true);
                }}
                className="text-red-600 cursor-pointer flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LogoutConfirmDialog 
        open={isLogoutDialogOpen} 
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
}