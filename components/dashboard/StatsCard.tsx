// src/components/dashboard/StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
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
  return (
    <Card className="bg-white">
      <CardContent>
        <div className="flex items-center justify-center mb-2">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            {icon}
            {title}
          </span>
        </div>
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="flex items-center justify-center">
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
      </CardContent>
    </Card>
  );
}