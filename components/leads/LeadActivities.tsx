'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';

// Import View Components
import NotesView from './NotesView';
import MeetingView from './MeetingView';
import CallView from './CallView';
import EmailView from './EmailView';
import InvoiceView from './InvoiceView';
import ActivityTimelineView from './ActivityTimelineView';

// Import Modals
import AddNotesModal from './AddNotesModal';
import AddMeetingModal from './AddMeetingModal';
import AddCallModal from './AddCallModal';
import AddEmailModal from './AddEmailModal';
import AddInvoiceModal from './AddInvoiceModal';
import AddActivityTimelineModal from './AddActivityTimelineModal';
import InvoicePreviewModal from './InvoicePreviewModal';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { LeadActivity, TeamMember } from '@/lib/types';
import { toast } from 'sonner';

interface LeadActivitiesProps {
  onAddActivity?: () => void;
  leadId: string;
}

const tabs = [
  { id: 'timeline', label: 'Activity Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'call', label: 'Call' },
  { id: 'email', label: 'E-mail' },
  { id: 'invoice', label: 'Invoice' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LeadActivities({ leadId }: LeadActivitiesProps) {
  const [activeTab, setActiveTab] = useState('timeline');

  // Modal states
  const [isAddNotesOpen, setIsAddNotesOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isAddCallOpen, setIsAddCallOpen] = useState(false);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // State ID Terpilih
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // --- SWR Hooks ---
  const { data: activities, error: activitiesError, isLoading: activitiesLoading, mutate: mutateActivities } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/activities`, fetcher);
  const { data: notes, error: notesError, isLoading: notesLoading, mutate: mutateNotes } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/notes`, fetcher);
  const { data: meetings, error: meetingsError, isLoading: meetingsLoading, mutate: mutateMeetings } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/meetings`, fetcher);
  const { data: calls, error: callsError, isLoading: callsLoading, mutate: mutateCalls } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/calls`, fetcher);
  const { data: emails, error: emailsError, isLoading: emailsLoading, mutate: mutateEmails } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/emails`, fetcher);
  const { data: invoices, error: invoicesError, isLoading: invoicesLoading, mutate: mutateInvoices } = useSWR<LeadActivity[]>(`${API_URL}/leads/${leadId}/invoices`, fetcher);
  const { data: salesTeam, error: salesTeamError, isLoading: salesTeamLoading } = useSWR<TeamMember[]>(`${API_URL}/sales`, fetcher);

  // --- Handlers Added ---
  const handleNoteAdded = () => { mutateNotes(); mutateActivities(); };
  const handleActivityAdded = () => { mutateActivities(); };
  const handleMeetingAdded = () => { mutateMeetings(); mutateActivities(); };
  const handleCallAdded = () => { mutateCalls(); mutateActivities(); };
  const handleEmailAdded = () => { mutateEmails(); mutateActivities(); };
  const handleInvoiceAdded = () => { mutateInvoices(); mutateActivities(); };
  
  // --- Handlers Edit ---
  const handleEditNote = (noteId: string) => { setSelectedNoteId(noteId); setIsAddNotesOpen(true); };
  const handleEditMeeting = (meetingId: string) => { setSelectedMeetingId(meetingId); setIsAddMeetingOpen(true); };
  const handleEditCall = (callId: string) => { setSelectedCallId(callId); setIsAddCallOpen(true); };
  const handleEditEmail = (emailId: string) => { setSelectedEmailId(emailId); setIsAddEmailOpen(true); };
  const handleEditInvoice = (invoiceId: string) => { setSelectedInvoiceId(invoiceId); setIsAddInvoiceOpen(true); };
  const handlePreviewInvoice = (invoiceId: string) => { setSelectedInvoiceId(invoiceId); setIsPreviewOpen(true); };

  // --- Handlers Delete (LOGIKA DIKEMBALIKAN) ---

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    // Optimistic update
    mutateNotes(notes?.filter((n) => n.id !== noteId), false);
    mutateActivities(activities?.filter((a) => a.id !== noteId), false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.success('Note deleted successfully');
      mutateNotes();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to delete note');
      mutateNotes();
      mutateActivities();
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    mutateMeetings(meetings?.filter((m) => m.id !== meetingId), false);
    mutateActivities(activities?.filter((a) => a.id !== meetingId), false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.success('Meeting deleted successfully');
      mutateMeetings();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to delete meeting');
      mutateMeetings();
      mutateActivities();
    }
  };

  const handleDeleteCall = async (callId: string) => {
    if (!window.confirm('Are you sure you want to delete this call?')) return;
    mutateCalls(calls?.filter((c) => c.id !== callId), false);
    mutateActivities(activities?.filter((a) => a.id !== callId), false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/calls/${callId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.success('Call deleted successfully');
      mutateCalls();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to delete call');
      mutateCalls();
      mutateActivities();
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;
    mutateEmails(emails?.filter((e) => e.id !== emailId), false);
    mutateActivities(activities?.filter((a) => a.id !== emailId), false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/emails/${emailId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.success('Email deleted successfully');
      mutateEmails();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to delete email');
      mutateEmails();
      mutateActivities();
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    mutateInvoices(invoices?.filter((i) => i.id !== invoiceId), false);
    mutateActivities(activities?.filter((a) => a.id !== invoiceId), false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      toast.success('Invoice deleted successfully');
      mutateInvoices();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to delete invoice');
      mutateInvoices();
      mutateActivities();
    }
  };

  // --- Handler Update Call (Dropdown) ---
  const handleUpdateCall = async (callId: string, updateData: any) => {
    const call = calls?.find(c => c.id === callId);
    if (!call) return;

    const newMeta = { ...call.meta, ...updateData };

    mutateCalls(calls.map(c => c.id === callId ? { ...c, meta: newMeta } : c), false);
    mutateActivities(activities?.map(a => a.id === callId ? { ...a, meta: newMeta } : a), false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/leads/${leadId}/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: call.content, meta: newMeta })
      });
      if (!res.ok) throw new Error('Failed to update server');
      toast.success('Call updated');
      mutateCalls();
      mutateActivities();
    } catch (err) {
      toast.error('Failed to update call');
      mutateCalls();
      mutateActivities();
    }
  };

  const renderTabContent = () => {
    const isLoading = activitiesLoading || notesLoading || meetingsLoading || callsLoading || emailsLoading || invoicesLoading || salesTeamLoading;
    
    if (isLoading) {
      return <div className="flex justify-center items-center h-full min-h-[200px]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    switch (activeTab) {
      case 'notes': return <NotesView notes={notes} error={notesError} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} />;
      case 'meeting': return <MeetingView meetings={meetings} error={meetingsError} onEditMeeting={handleEditMeeting} onDeleteMeeting={handleDeleteMeeting} salesTeam={salesTeam} />;
      case 'call': return <CallView calls={calls} error={callsError} onEditCall={handleEditCall} onDeleteCall={handleDeleteCall} onUpdateCall={handleUpdateCall} />;
      case 'email': return <EmailView emails={emails} error={emailsError} onEditEmail={handleEditEmail} onDeleteEmail={handleDeleteEmail} />;
      case 'invoice': return <InvoiceView invoices={invoices} error={invoicesError} onEditInvoice={handleEditInvoice} onDeleteInvoice={handleDeleteInvoice} onPreviewInvoice={handlePreviewInvoice} />;
      default: return <ActivityTimelineView activities={activities} error={activitiesError} />;
    }
  };

  const getTabCount = (tabId: string) => {
    if (tabId === 'timeline') return activities?.length || null;
    if (tabId === 'notes') return notes?.length || null;
    if (tabId === 'meeting') return meetings?.length || null;
    if (tabId === 'call') return calls?.length || null;
    if (tabId === 'email') return emails?.length || null;
    if (tabId === 'invoice') return invoices?.length || null;
    return null;
  };

  return (
    <Card className="shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full bg-white">
      {/* Header: Search */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search activity, notes, email..." 
            className="pl-10 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-full text-sm"
          />
        </div>
      </div>

      {/* Header: Tabs */}
      <div className="flex w-full border-b border-gray-200 bg-white h-11">
        {tabs.map((tab) => {
          const count = getTabCount(tab.id);
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2
                ${isActive 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:bg-gray-50'
                }
              `}
            >
              <span className="block font-bold invisible h-0 overflow-hidden">{tab.label}</span>
              <span className={`absolute inset-0 flex items-center justify-center gap-2 ${isActive ? 'font-medium' : 'font-normal'}`}>
                {tab.label}
                {count !== null && count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`h-5 px-1.5 text-[10px] rounded-full ${isActive ? 'bg-gray-100 text-gray-900' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {count}
                  </Badge>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Header: Toolbar (Rata Kiri) */}
      <div className="flex items-center justify-start gap-2 p-3 border-b border-gray-100 bg-white">
        <Button variant="outline" className="gap-2 text-gray-700 border-gray-300 hover:bg-gray-100">
          <Filter className="w-4 h-4" /> Filters
        </Button>

        {activeTab === 'timeline' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddActivityOpen(true)}><Plus className="w-3.5 h-3.5" /> Activity</Button>}
        {activeTab === 'notes' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddNotesOpen(true)}><Plus className="w-3.5 h-3.5" /> Note</Button>}
        {activeTab === 'meeting' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddMeetingOpen(true)}><Plus className="w-3.5 h-3.5" /> Meeting</Button>}
        {activeTab === 'call' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddCallOpen(true)}><Plus className="w-3.5 h-3.5" /> Call</Button>}
        {activeTab === 'email' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddEmailOpen(true)}><Plus className="w-3.5 h-3.5" /> Email</Button>}
        {activeTab === 'invoice' && <Button className="bg-gray-900 hover:bg-gray-700 gap-2 px-4 h-9" onClick={() => setIsAddInvoiceOpen(true)}><Plus className="w-3.5 h-3.5" /> Invoice</Button>}
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50/50 p-6 overflow-y-auto min-h-[500px]">
        {renderTabContent()}
      </div>

     {/* --- Modals --- */}
      
      <AddNotesModal 
        open={isAddNotesOpen} 
        onOpenChange={(open) => {
          setIsAddNotesOpen(open);
          if (!open) setSelectedNoteId(null); // Reset ID saat tutup
        }} 
        leadId={leadId} 
        noteId={selectedNoteId} 
        onNoteAdded={handleNoteAdded} 
      />

      <AddMeetingModal 
        open={isAddMeetingOpen} 
        onOpenChange={(open) => {
          setIsAddMeetingOpen(open);
          if (!open) setSelectedMeetingId(null); // Reset ID saat tutup
        }} 
        leadId={leadId} 
        meetingId={selectedMeetingId} 
        onMeetingAdded={handleMeetingAdded} 
      />

      <AddCallModal 
        open={isAddCallOpen} 
        onOpenChange={(open) => {
          setIsAddCallOpen(open);
          if (!open) setSelectedCallId(null); // Reset ID saat tutup
        }} 
        leadId={leadId} 
        callId={selectedCallId} 
        onCallAdded={handleCallAdded} 
      />

      <AddEmailModal 
        open={isAddEmailOpen} 
        onOpenChange={(open) => {
          setIsAddEmailOpen(open);
          if (!open) setSelectedEmailId(null); // Reset ID saat tutup
        }} 
        leadId={leadId} 
        emailId={selectedEmailId} 
        onEmailAdded={handleEmailAdded} 
      />

      <AddInvoiceModal 
        open={isAddInvoiceOpen} 
        onOpenChange={(open) => {
          setIsAddInvoiceOpen(open);
          if (!open) setSelectedInvoiceId(null); // Reset ID saat tutup
        }} 
        leadId={leadId} 
        invoiceId={selectedInvoiceId} 
        onInvoiceAdded={handleInvoiceAdded} 
      />

       <InvoicePreviewModal
        open={isPreviewOpen} 
        onOpenChange={(open) => { 
          setIsPreviewOpen(open); 
          if (!open) setSelectedInvoiceId(null); 
        }} 
        leadId={leadId} 
        invoiceId={selectedInvoiceId} 
        onEditInvoice={handleEditInvoice} 
      />

      <AddActivityTimelineModal 
        open={isAddActivityOpen} 
        onOpenChange={setIsAddActivityOpen} 
        leadId={leadId} 
        onActivityAdded={handleActivityAdded} 
      />
    </Card>
  );
}