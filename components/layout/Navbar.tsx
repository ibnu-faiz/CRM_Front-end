"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  Loader2,
  LogOut,
  User,
  Settings,
  Home,
  Users,
  Globe,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/fetcher";
import { TeamMember } from "@/lib/types";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { cn } from "@/lib/utils";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Globe, label: "Leads", href: "/leads" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: User, label: "Profile", href: "/profile" },
];

const bottomItems = [
  { icon: HelpCircle, label: "Get Help", href: "/help" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean; // <-- Prop baru untuk tahu status sidebar
}

export default function Navbar({
  onToggleSidebar,
  isSidebarOpen = true,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data, error, isLoading } = useSWR<{ user: TeamMember }>(
    `${API_URL}/auth/profile`,
    fetcher
  );
  const user = data?.user;

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    router.push("/login");
    setIsLogoutDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 transition-all duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* === AREA KIRI === */}
        <div className="flex items-center gap-4">
          {/* A. TOMBOL TOGGLE SIDEBAR (DESKTOP) */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex text-gray-500 hover:bg-gray-100"
          >
            {/* Menggunakan Icon Menu Saja */}
            <Menu className="w-5 h-5" />
          </Button>

          {/* B. TOMBOL MOBILE MENU */}
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
                    <div className="relative w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] overflow-hidden">
                      <Image
                        src="/crm.png"
                        alt="Logo"
                        width={50}
                        height={50}
                        className="object-contain p-1.5"
                        priority
                      />
                    </div>
                    Team #21
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 p-4 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-gray-200 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
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

          {/* C. SEARCH BAR */}
          <div className="relative w-40 md:w-64 transition-all">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm rounded-full focus-visible:ring-1"
            />
          </div>
        </div>

        {/* === AREA TENGAH: LOGO === */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-[145px] h-[38px]">
            <Image
              src="/crmcmlabs.png"
              alt="CRM cmlabs"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* === AREA KANAN === */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="relative hidden sm:flex group rounded-full"
          >
            <Bell className="w-5 h-5 text-gray-700 transition-transform hover:-rotate-12" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex transition-all duration-300"
            onClick={() => setIsDarkMode(!isDarkMode)} // Logika Toggle Dummy
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              // Jika sedang Dark Mode, tampilkan Matahari (biar user klik untuk jadi terang)
              <Sun className="w-5 h-5 text-gray-700 transition-transform hover:rotate-90" />
            ) : (
              // Jika sedang Light Mode, tampilkan Bulan (biar user klik untuk jadi gelap)
              <Moon className="w-5 h-5 text-gray-700 transition-transform hover:-rotate-12" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 pl-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback>
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : user ? (
                      getInitials(user.name)
                    ) : (
                      "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {isLoading
                    ? "Loading..."
                    : error
                    ? "Error"
                    : user?.name?.split(" ")[0]}
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
