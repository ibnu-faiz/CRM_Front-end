'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus } from 'lucide-react';
import NotesView from './NotesView';
import MeetingView from './MeetingView';
import CallView from './CallView';
import EmailView from './EmailView';
import InvoiceView from './InvoiceView';
import ActivityTimelineView from './ActivityTimelineView';
import AddNotesModal from './AddNotesModal';
import AddMeetingModal from './AddMeetingModal';
import AddCallModal from './AddCallModal';
import AddEmailModal from './AddEmailModal';
import AddInvoiceModal from './AddInvoiceModal';
import AddActivityTimelineModal from './AddActivityTimelineModal';

interface LeadActivitiesProps {
  onAddActivity?: () => void;
  leadId?: string;
}

const tabs = [
  { id: 'timeline', label: 'Activity Timeline', count: null },
  { id: 'notes', label: 'Notes', count: 8 },
  { id: 'meeting', label: 'Meeting', count: 11 },
  { id: 'call', label: 'Call', count: 11 },
  { id: 'email', label: 'E-mail', count: 8 },
  { id: 'invoice', label: 'Invoice', count: 8 },
];

export default function LeadActivities({ leadId = '1' }: LeadActivitiesProps) {
  const [activeTab, setActiveTab] = useState('timeline');

  // Modal states
  const [isAddNotesOpen, setIsAddNotesOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddCallOpen, setIsAddCallOpen] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesView leadId={leadId} />;
      case 'meeting':
        return <MeetingView leadId={leadId} />;
      case 'call':
        return <CallView leadId={leadId} />;
      case 'email':
        return <EmailView leadId={leadId} />;
      case 'invoice':
        return <InvoiceView leadId={leadId} />;
      default:
        return <ActivityTimelineView leadId={leadId} />;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search activity, notes, email, and more..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 border-b flex-wrap">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>

          {activeTab === 'timeline' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddActivityOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </Button>
          )}
          {activeTab === 'notes' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddNotesOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Note
            </Button>
          )}
          {activeTab === 'meeting' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddMeetingOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Meeting
            </Button>
          )}
          {activeTab === 'call' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddCallOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Call
            </Button>
          )}
          {activeTab === 'email' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddEmailOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Email
            </Button>
          )}
          {activeTab === 'invoice' && (
            <Button
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 gap-2"
              onClick={() => setIsAddInvoiceOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Invoice
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[600px] overflow-y-auto">{renderTabContent()}</div>
      </CardContent>

      {/* Modals */}
      <AddNotesModal open={isAddNotesOpen} onOpenChange={setIsAddNotesOpen} leadId={leadId} />
      <AddMeetingModal open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen} leadId={leadId} />
      <AddCallModal open={isAddCallOpen} onOpenChange={setIsAddCallOpen} leadId={leadId} />
      <AddEmailModal open={isAddEmailOpen} onOpenChange={setIsAddEmailOpen} leadId={leadId} />
      <AddInvoiceModal open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen} leadId={leadId} />
      <AddActivityTimelineModal
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        leadId={leadId}
      />
    </Card>
  );
}
