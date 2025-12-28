// src/components/dashboard/MetricCard.tsx
import { Card, CardContent } from '@/components/ui/card'; // <-- Pakai Card biar sama kayak StatsCard
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

export default function MetricCard({
  icon,
  label,
  value,
  change,
  isPositive,
}: MetricCardProps) {
  // Cek apakah change itu "0%" atau "0" untuk menampilkan tanda strip (-) bukan panah
  const isNeutral = change === '0%' || change === '0';

  return (
    // Gunakan Card supaya desain border & shadownya seragam dengan StatsCard
    <Card className="bg-white hover:border-gray-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             {/* Icon Wrapper dengan background tipis biar cantik */}
             {icon && (
               <div className="p-2 bg-gray-100/80 rounded-lg text-gray-600">
                 {icon}
               </div>
             )}
             
             {/* Label dipindah ke sini jika mode compact, atau biarkan di bawah */}
          </div>

          {/* Badge Persentase di Pojok Kanan Atas */}
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              isNeutral ? 'text-gray-600 bg-gray-100' :
              isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
            )}
          >
            {isNeutral ? (
               <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        </div>

        {/* Angka & Label di Bawah (Layout Vertikal agar angka menonjol) */}
        <div className="mt-3">
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}