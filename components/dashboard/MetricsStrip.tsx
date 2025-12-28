import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Globe, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  value: number;
  change: number;
  isPositive: boolean;
}

interface MetricsStripProps {
  data: {
    totalWon: StatItem;
    totalLost: StatItem;
    totalLeads: StatItem;
    conversionRate: StatItem;
  } | undefined;
}

export default function MetricsStrip({ data }: MetricsStripProps) {
  const items = [
    {
      label: 'Total Won',
      icon: <CheckCircle2 className="w-4 h-4" />,
      value: data?.totalWon.value || 0,
      change: data?.totalWon.change || 0,
      isPositive: true,
    },
    {
      label: 'Total Lost',
      icon: <XCircle className="w-4 h-4" />,
      value: data?.totalLost.value || 0,
      change: data?.totalLost.change || 0,
      isPositive: false,
    },
    {
      label: 'Total Leads',
      icon: <Globe className="w-4 h-4" />,
      value: data?.totalLeads.value || 0,
      change: data?.totalLeads.change || 0,
      isPositive: true,
    },
    {
      label: 'Win Rate',
      icon: null,
      value: `${data?.conversionRate.value || 0}%`,
      change: data?.conversionRate.change || 0,
      isPositive: true,
    },
  ];

  return (
    // HAPUS 'overflow-hidden' agar shadow/border render sempurna dan tidak memotong konten
    <div className="bg-gray-100/50 border border-gray-200 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        
        {items.map((item, index) => (
          <div key={index} className="px-4 py-3 flex items-center">
            
            {/* CONTAINER UTAMA: items-baseline biar teks kecil & besar sejajar kakinya */}
            <div className="flex w-full items-center justify-center"> 
                
                {/* 1. GRUP ICON & LABEL */}
                {/* shrink-0 biar label tidak penyet kalau layar sempit */}
                <span className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
                   {item.icon}
                   {item.label}
                </span>

                {/* 2. VALUE (Angka Besar) */}
                {/* ml-3: Memberi jarak fix dari Label (tidak terlalu jauh, tidak terlalu dekat) */}
                <span className="text-3xl font-bold text-gray-900 ml-3">
                   {item.value}
                </span>

                {/* 3. PERSENTASE */}
                {/* HAPUS 'ml-auto'. Ganti dengan 'ml-2' biar nempel rapi di sebelah angka */}
                <div className={cn(
                  "flex items-center text-xs font-semibold self-center ml-2", 
                  item.change === 0 ? "text-gray-400" :
                  (item.isPositive ? "text-green-600" : "text-red-600")
                )}>
                  {item.change === 0 ? (
                    <Minus className="w-3 h-3 mr-1" />
                  ) : item.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(Number(item.change))}%
                </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}