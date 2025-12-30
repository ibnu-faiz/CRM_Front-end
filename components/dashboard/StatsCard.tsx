// src/components/dashboard/StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'; // Tambah icon Minus
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  change,
  isPositive,
  icon,
}: StatsCardProps) {
  
  // --- LOGIKA PEMBERSIH (DEFENSIVE) ---
  // Cek apakah string change mengandung kata-kata error
  const isInvalid = !change || change.includes('undefined') || change.includes('NaN');
  
  // Jika invalid, paksa jadi "0%". Jika valid, pakai data aslinya.
  const displayChange = isInvalid ? '0%' : change;

  // Cek apakah nilainya nol (untuk warna netral)
  const isZero = displayChange === '0%' || displayChange === '0';

  return (
    <Card className="bg-white">
      <CardContent>
        {/* HEADER: Icon & Title */}
        <div className="flex items-center justify-center mb-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            {icon}
            {title}
          </span>
        </div>

        {/* VALUE: Angka Besar */}
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>

        {/* FOOTER: Percentage Change */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              // Logika Warna:
              // Kalau Zero/Invalid -> Abu-abu
              // Kalau Positif -> Hijau
              // Kalau Negatif -> Merah
              isZero 
                ? 'text-gray-500' 
                : isPositive 
                  ? 'text-green-600' 
                  : 'text-red-600'
            )}
          >
            {/* Logika Icon */}
            {isZero ? (
              <Minus className="w-4 h-4" />
            ) : isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            
            {displayChange}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}