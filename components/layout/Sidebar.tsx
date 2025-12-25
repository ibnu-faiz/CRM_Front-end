"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Globe, User, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

// 1. Tambahkan Props 'isOpen'
interface SidebarProps {
  isOpen: boolean; // Menerima status true/false dari Layout
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    // 2. Modifikasi Class Utama (Aside)
    // Kita gunakan logika CSS: Jika isOpen=true lebarnya 64, jika false lebarnya 0.
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-white transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
        isOpen ? "w-64 border-r border-gray-200" : "w-0 border-none opacity-0"
      )}
    >
      {/* --- KONTEN SIDEBAR (Isinya tetap sama, hanya wrapper luarnya yang berubah) --- */}
      
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] overflow-hidden flex-shrink-0">
            <Image
              src="/crm.png"
              alt="Logo Perusahaan"
              width={50}
              height={50}
              className="object-contain p-2"
              priority
            />
          </div>
          <div className="min-w-0"> {/* min-w-0 agar text truncate rapi saat animasi */}
            <h1 className="font-bold text-gray-900 truncate">Team #21</h1>
            <p className="text-xs text-gray-500 truncate">Tag From Company</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" /> {/* flex-shrink-0 agar icon tidak gepeng */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 space-y-1 border-t border-gray-200">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}