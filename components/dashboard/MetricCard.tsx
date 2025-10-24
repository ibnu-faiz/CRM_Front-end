// src/components/dashboard/MetricCard.tsx
import { TrendingUp, TrendingDown } from 'lucide-react';
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
  return (
    <div className="bg-white rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-600">{icon}</div>}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div
        className={cn(
          'flex items-center gap-1 text-sm font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {change}
      </div>
    </div>
  );
}