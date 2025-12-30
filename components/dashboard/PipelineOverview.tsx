'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Kanban } from 'lucide-react'; // Tambah icon Kanban untuk empty state
import Link from 'next/link';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PipelineGroup {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export default function PipelineOverview() {
  const [groups, setGroups] = useState<PipelineGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/pipeline-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed');
        
        const rawData = await res.json();
        
        const stats: Record<string, number> = {};
        let totalAll = 0;
        
        rawData.forEach((item: any) => {
          stats[item.status] = item._count.id;
          totalAll += item._count.id;
        });

        // GROUPING LOGIC
        const countQualification = (stats['LEAD_IN'] || 0) + 
                                   (stats['CONTACT_MADE'] || 0) + 
                                   (stats['NEED_IDENTIFIED'] || 0);

        const countProposal = (stats['PROPOSAL_MADE'] || 0);
        const countNegotiation = (stats['NEGOTIATION'] || 0);
        const countClosing = (stats['CONTRACT_SEND'] || 0);
        const countCompleted = (stats['WON'] || 0) + (stats['LOST'] || 0);

        const result = [
            { 
                label: 'Qualification', 
                count: countQualification, 
                color: 'bg-blue-500' 
            },
            { 
                label: 'Proposal', 
                count: countProposal, 
                color: 'bg-indigo-500' 
            },
            { 
                label: 'Negotiation', 
                count: countNegotiation, 
                color: 'bg-purple-500' 
            },
            { 
                label: 'Contract Sent', 
                count: countClosing, 
                color: 'bg-orange-500' 
            },
            { 
                label: 'Completed', 
                count: countCompleted, 
                color: 'bg-emerald-500' 
            },
        ];

        const finalData = result.map(item => ({
            ...item,
            percentage: totalAll > 0 ? (item.count / totalAll) * 100 : 0
        }));

        setGroups(finalData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, []);

  // --- LOGIKA CEK KOSONG ---
  // Cek apakah semua kategori jumlahnya 0?
  const isDataEmpty = !loading && groups.every(g => g.count === 0);

  return (
    <Card className="h-full bg-white hover:shadow-md transition-shadow flex flex-col">
      
      {/* 1. Header Center */}
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold text-gray-800">Pipeline Overview</CardTitle>
        <p className="text-sm text-gray-500">Distribution deals across stages</p>
      </CardHeader>
      
      {/* Tambahkan flex-1 agar konten mengisi penuh tinggi card */}
      <CardContent className="px-3 pb-3 pt-0 flex-1 flex flex-col space-y-4">
        {loading ? (
           <div className="flex-1 flex items-center justify-center text-gray-400">
             <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
           </div>
        ) : isDataEmpty ? (
           // --- TAMPILAN KOSONG (EMPTY STATE) ---
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 py-8">
             <Kanban className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-medium text-gray-500">Pipeline is empty</p>
             <p className="text-xs text-gray-400 mt-1 max-w-[200px] text-center">Create new deals to see your pipeline stages</p>
           </div>
        ) : (
          // --- TAMPILAN DATA (NORMAL) ---
          <div className="space-y-3 flex-1">
            {groups.map((group, index) => (
              <div 
                key={index}
                className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors"
              >
                {/* Baris Atas: Label & Angka */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{group.label}</span>
                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">
                    {group.count} deals ({Math.round(group.percentage)}%)
                  </span>
                </div>
                
                {/* Baris Bawah: Progress Bar */}
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={cn("h-full transition-all duration-500 ease-in-out", group.color)} 
                        style={{ width: `${group.percentage}%` }}
                    />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full mt-auto" asChild>
           <Link href="/leads">View Pipeline Board</Link>
        </Button>
      </CardContent>
    </Card>
  );
}