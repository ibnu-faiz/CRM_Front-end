'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, UsersRound, User, HelpCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/leads' },
  { icon: UsersRound, label: 'Team', href: '/team' },
  { icon: User, label: 'Profile', href: '/profile' },
];

const bottomItems = [
  { icon: HelpCircle, label: 'Get Help', href: '/help' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">Logo</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Company Name</h1>
            <p className="text-xs text-gray-500">Tag From Company</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 space-y-1 border-t border-gray-200">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}