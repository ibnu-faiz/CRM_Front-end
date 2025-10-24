// components/dashboard/RecentDeals.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const deals = [
  { id: 1, name: 'Transaction 1', amount: 'Rp 10.000.000' },
  { id: 2, name: 'Transaction 2', amount: 'Rp 30.000.000' },
  { id: 3, name: 'Transaction 3', amount: 'Rp 10.000.000' },
  { id: 4, name: 'Transaction 4', amount: 'Rp 9.000.000' },
  { id: 5, name: 'Transaction 5', amount: 'Rp 15.000.000' },
];

export default function RecentDeals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Deals</CardTitle>
        <p className="text-sm text-gray-500">Your most recently updated deals</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {deals.map((deal) => (
          <div key={deal.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{deal.name}</p>
              <p className="text-sm text-gray-500">{deal.amount}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              View →
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4">
          View All
        </Button>
      </CardContent>
    </Card>
  );
}