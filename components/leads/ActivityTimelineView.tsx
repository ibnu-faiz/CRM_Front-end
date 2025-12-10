'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, Calendar, Mail, FileText, CheckSquare, Activity, Receipt
} from 'lucide-react';
// Hapus import SWR dan fetcher
import { LeadActivity, ActivityType } from '@/lib/types';

// Map untuk ikon
const activityIconMap: Record<string, any> = {
  [ActivityType.CALL]: Phone,
  [ActivityType.MEETING]: Calendar,
  [ActivityType.EMAIL]: Mail,
  [ActivityType.NOTE]: FileText,
  [ActivityType.TASK]: CheckSquare,
  [ActivityType.INVOICE]: Receipt, // TODO: Ganti ikon invoice
  [ActivityType.STATUS_CHANGE]: Activity,
};

// Terima 'activities' dan 'error' sebagai props
interface ActivityTimelineViewProps {
  activities: LeadActivity[] | undefined;
  error: any;
}

export default function ActivityTimelineView({ activities, error }: ActivityTimelineViewProps) {
  // Hapus state modal dan SWR

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  // Pindahkan 'isLoading' dan 'error' ke parent
  if (error) {
    return <div className="text-red-500 p-4">Failed to load activity {(error as any).info?.error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activityIconMap[activity.type] || Activity;
            const description = activity.meta?.description;

            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{activity.content}</h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(activity.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gray-900 text-white text-xs">
                            {getInitials(activity.createdBy.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{activity.createdBy.name}</span>
                      </div>
                      {description && activity.type !== ActivityType.NOTE && (
                        <p className="text-sm text-gray-700">{description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-gray-500 text-center p-4">There is no Activity Timeline</p>
        )}
      </div>
      {/* Hapus modal dari sini, sudah ada di parent */}
    </div>
  );
}