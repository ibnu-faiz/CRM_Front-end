'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Deal {
  id: number;
  title: string;
  value: number;
  status: string;
}

// 1. Update Props
interface RecentDealsProps {
  month: number;
  year: number;
  isAllTime: boolean; // <--- Tambah ini
}

export default function RecentDeals({ month, year, isAllTime }: RecentDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // 2. Logic URL Pintar
        const queryParams = isAllTime 
            ? `?range=all` 
            : `?month=${month}&year=${year}`;

        const res = await fetch(`${API_URL}/dashboard/recent-deals${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [month, year, isAllTime]); // 3. Dependency update

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'text-green-700 bg-green-50 border-green-200';
      case 'LOST': return 'text-red-700 bg-red-50 border-red-200';
      case 'NEGOTIATION': case 'PROPOSAL_MADE': case 'CONTRACT_SEND': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'NEED_IDENTIFIED': case 'CONTACT_MADE': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatEnum = (str: string) => str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const isDataEmpty = !loading && deals.length === 0;

  return (
    <Card className="h-full bg-white hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg font-bold text-gray-800">Recent Deals</CardTitle>
        <p className="text-sm text-gray-500">
             {isAllTime ? "Newest deals (All Time)" : "New deals in this period"}
        </p>
      </CardHeader>
      
      <CardContent className="px-3 pb-3 pt-0 flex-1 flex flex-col space-y-4"> 
        {loading ? (
           <div className="flex-1 flex items-center justify-center text-gray-400">
             <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading...
           </div>
        ) : isDataEmpty ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50 py-6">
             <PackageOpen className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-medium text-gray-500">No deals found</p>
           </div>
        ) : (
          <div className="space-y-3 flex-1">
            {deals.map((deal) => (
              <div key={deal.id} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between group hover:border-gray-300 transition-colors">
                <div className="space-y-1 min-w-0 pr-4 flex flex-col items-start">
                  <p className="font-semibold text-gray-900 truncate w-full" title={deal.title}>{deal.title}</p>
                  <p className="text-sm font-bold text-gray-600">{formatRupiah(deal.value)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", getStatusColor(deal.status))}>
                    {formatEnum(deal.status)}
                  </div>
                  <Link href={`/leads/${deal.id}`} className="text-xs text-gray-400 group-hover:text-blue-600 flex items-center justify-end gap-1 transition-colors font-medium">
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-auto" asChild>
            <Link href="/leads">View All Leads</Link>
        </Button>
      </CardContent>
    </Card>
  );
}