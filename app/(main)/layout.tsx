'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Buat State untuk menyimpan status Sidebar (Default: true/terbuka)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 2. Buat fungsi untuk mengubah status (Toggle)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 3. Oper state 'isOpen' ke Sidebar */}
      {/* Pastikan komponen Sidebar Anda sudah menerima prop 'isOpen' */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        {/* 4. Oper fungsi 'onToggleSidebar' dan state 'isSidebarOpen' ke Navbar */}
        <Navbar 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}