"use client";

import { useState } from "react";
import LeadsChart from '@/components/dashboard/LeadsChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ActivityList from '@/components/dashboard/ActivityList';
import RecentDeals from '@/components/dashboard/RecentDeals';
import PipelineOverview from '@/components/dashboard/PipelineOverview';
import LeadSourceChart from '@/components/dashboard/LeadSourceChart';
import QuarterSummary from '@/components/dashboard/QuarterSummary';
import DashboardStats from '@/components/dashboard/DashboardStats';

import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const currentMonthIndex = new Date().getMonth();
  const currentYearVal = new Date().getFullYear();

  // 1. STATE MANAGEMENT
  const [isGlobalAllTime, setIsGlobalAllTime] = useState(false);
  
  // State baru: Menandai apakah user sedang melakukan filter manual
  const [isCustomFilter, setIsCustomFilter] = useState(false); 

  const [filterDate, setFilterDate] = useState({
    month: currentMonthIndex,
    year: currentYearVal
  });

  // 2. DEFINISI MODE VIEW
  
  // Default View = Tidak All Time DAN Tidak Custom Filter
  const isDefaultView = !isGlobalAllTime && !isCustomFilter;

  // --- LOGIKA HYBRID VS STRICT ---
  
  // A. Stats Card & Revenue (Financial)
  // - Default: Bulan Ini
  // - Custom: Ikuti Filter
  // - All Time: All Time
  const statsIsAllTime = isGlobalAllTime; 

  // B. Pipeline & Source (Operational)
  // - Default: ALL TIME (Supaya leads lama terbaca)
  // - Custom: STRICT FILTER (Hanya bulan yg dipilih user, misal: Jan 2026)
  // - All Time: ALL TIME
  // Jadi: Operational All Time aktif jika Global All Time Aktif ATAU Default View Aktif
  const operationalIsAllTime = isGlobalAllTime || isDefaultView;


  // 3. HANDLERS

  const resetFilter = () => {
    setIsGlobalAllTime(false);
    setIsCustomFilter(false); // Reset ke mode default (kosongkan select)
    setFilterDate({
      month: currentMonthIndex,
      year: currentYearVal
    });
  };

  const handleDateChange = (key: 'month' | 'year', value: string) => {
    setIsGlobalAllTime(false);
    setIsCustomFilter(true); // Tandai bahwa user melakukan filter manual
    setFilterDate(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleSetAllTime = () => {
    setIsGlobalAllTime(true);
    setIsCustomFilter(false); // Select jadi kosong saat mode All Time
  };

  // Helper Data
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => currentYearVal - i);

  // Teks Header
  const getHeaderText = () => {
    if (isGlobalAllTime) return "Overview for All Time";
    if (isDefaultView) return "Showing data from current month";
    // Jika Custom Filter (Meskipun bulan ini, tapi user yg pilih):
    return `Overview for ${monthNames[filterDate.month]} ${filterDate.year}`;
  };

  return (
    <div className="p-6 space-y-3 transition-all duration-300 ease-in-out">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{getHeaderText()}</p>
        </div>

        {/* POPOVER FILTER */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`gap-2 ${isCustomFilter ? '"bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800' : ''}`}>
              <Filter className="w-4 h-4" />
              <span>
                {isGlobalAllTime ? 'All Time' : isDefaultView ? 'Filters' : 'Custom Filters'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                   <h4 className="font-medium leading-none">Time Period</h4>
                   <p className="text-xs text-muted-foreground mt-1">Select stats timeframe.</p>
                </div>
                {/* Tombol Reset muncul jika BUKAN default */}
                {!isDefaultView && (
                    <Button variant="outline" size="sm" onClick={resetFilter} className="h-7 px-2 text-xs rounded-full border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 hover:text-red-800 transition-all">
                     Reset to Default
                    </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {/* SELECT MONTH */}
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-gray-500">Month</label>
                   <Select 
                     disabled={isGlobalAllTime}
                     // LOGIKA BARU: Jika tidak custom filter (artinya default), value kosong string ""
                     value={isCustomFilter ? filterDate.month.toString() : ""} 
                     onValueChange={(val) => handleDateChange('month', val)}
                   >
                    <SelectTrigger>
                        {/* Placeholder akan muncul jika value "" */}
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((m, index) => (
                        <SelectItem key={index} value={index.toString()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SELECT YEAR */}
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-gray-500">Year</label>
                   <Select 
                     disabled={isGlobalAllTime}
                     // LOGIKA BARU: Value kosong jika default
                     value={isCustomFilter ? filterDate.year.toString() : ""} 
                     onValueChange={(val) => handleDateChange('year', val)}
                   >
                    <SelectTrigger>
                         <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t">
                  <Button 
                    variant={isGlobalAllTime ? "outline" : "ghost"} 
                    className="w-full justify-center text-xs h-8"
                    onClick={() => isGlobalAllTime ? resetFilter() : handleSetAllTime()}
                  >
                    {isGlobalAllTime ? "Switch to Monthly View" : "View All Time Data"}
                  </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* DASHBOARD CONTENT */}
      
      {/* isAllTime (Stats): False saat Default (Bulan Ini)
        stripIsAllTime (Strip/Ops): True saat Default (Biar leads lama kelihatan)
        
        TAPI: Jika user pilih Custom Filter (isCustomFilter=true), maka operationalIsAllTime jadi FALSE.
        Sehingga Strip/Ops akan memfilter STRICT sesuai bulan yang dipilih.
      */}
      <DashboardStats 
        isAllTime={statsIsAllTime} 
        stripIsAllTime={operationalIsAllTime} 
        month={filterDate.month} 
        year={filterDate.year} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 space-y-3">
          <LeadsChart year={filterDate.year} /> 
          <RevenueChart year={filterDate.year} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
             <RecentDeals isAllTime={operationalIsAllTime} month={filterDate.month} year={filterDate.year} />
             <PipelineOverview isAllTime={operationalIsAllTime} month={filterDate.month} year={filterDate.year} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <ActivityList /> 
          <LeadSourceChart isAllTime={operationalIsAllTime} month={filterDate.month} year={filterDate.year} />
          <QuarterSummary month={filterDate.month} year={filterDate.year} />
        </div>
      </div>
    </div>
  );
}