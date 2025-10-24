// app/(main)/leads/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronDown, Edit, Check, Trash2, Users, FileText, Calendar, Phone, Mail, FileCheck } from 'lucide-react';
import LeadSummary from '@/components/leads/LeadSummary';
import LeadActivities from '@/components/leads/LeadActivities';
import WonConfirmDialog from '@/components/leads/WonConfirmDialog';
import DeleteLeadDialog from '@/components/leads/DeleteLeadDialog';
import EditSummaryModal from '@/components/leads/EditSummaryModal';
import AddActivityModal from '@/components/leads/AddActivityTimelineModal';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isWonDialogOpen, setIsWonDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSummaryOpen, setIsEditSummaryOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const handleBack = () => {
    router.push('/leads');
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 -ml-2"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to leads
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" />
          <div>
            <h1 className="text-2xl font-bold">DETAIL LEADS</h1>
            <p className="text-sm text-gray-500">Owner Name</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            Following
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            Qualified
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stage Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        <Badge className="bg-gray-900 hover:bg-gray-800 gap-2">
          <Check className="w-3 h-3" />
          Qualified
        </Badge>
        <Badge variant="outline">Status</Badge>
        <Badge variant="outline">Status</Badge>
        <Badge variant="outline">Status</Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Summary */}
        <div className="lg:col-span-1">
          <LeadSummary onEdit={() => setIsEditSummaryOpen(true)} />
        </div>

        {/* Right Content - Activities */}
        <div className="lg:col-span-2">
          <LeadActivities onAddActivity={() => setIsAddActivityOpen(true)} />
        </div>
      </div>

      {/* Modals & Dialogs */}
      <WonConfirmDialog
        open={isWonDialogOpen}
        onOpenChange={setIsWonDialogOpen}
      />
      <DeleteLeadDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
      <EditSummaryModal
        open={isEditSummaryOpen}
        onOpenChange={setIsEditSummaryOpen}
      />
      <AddActivityModal
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
      />
    </div>
  );
}