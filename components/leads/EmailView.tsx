// components/leads/EmailView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import AddEmailModal from './AddEmailModal';

const mockEmails = [
  {
    id: 1,
    subject: 'Thankyou for contacting',
    to: 'name@gmail.com',
    content: 'your email....',
    date: 'July 25, 2025',
    hasAttachment: true,
  },
];

interface EmailViewProps {
  leadId: string;
}

export default function EmailView({ leadId }: EmailViewProps) {
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const handleEditEmail = (emailId: number) => {
    setSelectedEmail(emailId);
    setIsAddEmailOpen(true);
  };

  const handleDeleteEmail = (emailId: number) => {
    console.log('Delete email:', emailId);
    // Implement delete logic
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button (reusing from wireframe - shows "+ Add Note") */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsAddEmailOpen(true)}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Note
        </Button>
      </div> */}

      {/* Email List */}
      <div className="space-y-4">
        {mockEmails.map((email) => (
          <Card key={email.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Email Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{email.subject}</h4>
                    <p className="text-sm text-gray-600">{email.to}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{email.date}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditEmail(email.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEmail(email.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Email Content */}
              <p className="text-sm text-gray-700 mb-4">{email.content}</p>

              {/* Email Attachment Preview */}
              {email.hasAttachment && (
                <div className="w-full bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Email Modal */}
      <AddEmailModal
        open={isAddEmailOpen}
        onOpenChange={(open) => {
          setIsAddEmailOpen(open);
          if (!open) setSelectedEmail(null);
        }}
        emailId={selectedEmail}
      />
    </div>
  );
}