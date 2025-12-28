// components/profile/NotificationTabContent.tsx
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function NotificationTabContent() {
  return (
    <div className="max-w-3xl">
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Choose how you receive updates.</p>
        </div>
        
        <div className="space-y-8">
            <div>
                <h4 className="font-semibold mb-4 text-gray-900">Email Notifications</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div><p className="font-medium text-sm">Activity Reminder</p></div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div><p className="font-medium text-sm">System Updates</p></div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </div>
        </div>

     
    </div>
  );
}