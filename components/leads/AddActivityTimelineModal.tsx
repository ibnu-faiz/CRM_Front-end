'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Phone, Mail, ReceiptText, StickyNote } from 'lucide-react';

interface AddActivityTimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Fungsi untuk membuka modal lain
  onOpenNote: () => void;
  onOpenMeeting: () => void;
  onOpenCall: () => void;
  onOpenEmail: () => void;
  onOpenInvoice: () => void;
}

export default function AddActivityTimelineModal({
  open,
  onOpenChange,
  onOpenNote,
  onOpenMeeting,
  onOpenCall,
  onOpenEmail,
  onOpenInvoice,
}: AddActivityTimelineModalProps) {

  // Helper untuk memilih aksi: Tutup modal ini dulu, baru buka modal target
  const handleSelect = (openTargetModal: () => void) => {
    onOpenChange(false); // Tutup menu pilihan
    // Beri sedikit jeda agar transisi modal mulus (opsional, tapi disarankan)
    setTimeout(() => {
      openTargetModal();
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Activity Type</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          
          {/* Tombol Note */}
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-200"
            onClick={() => handleSelect(onOpenNote)}
          >
            <StickyNote className="w-6 h-6 text-yellow-600" />
            <span className="font-semibold text-gray-700">Add Note</span>
          </Button>

          {/* Tombol Meeting */}
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-200"
            onClick={() => handleSelect(onOpenMeeting)}
          >
            <Video className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-700">Schedule Meeting</span>
          </Button>

          {/* Tombol Call */}
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-200"
            onClick={() => handleSelect(onOpenCall)}
          >
            <Phone className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-gray-700">Log Call</span>
          </Button>

          {/* Tombol Email */}
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-200"
            onClick={() => handleSelect(onOpenEmail)}
          >
            <Mail className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-gray-700">Log Email</span>
          </Button>

          {/* Tombol Invoice */}
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 border-gray-200 col-span-2"
            onClick={() => handleSelect(onOpenInvoice)}
          >
            <ReceiptText className="w-6 h-6 text-slate-900" />
            <span className="font-semibold text-gray-700">Create Invoice</span>
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}