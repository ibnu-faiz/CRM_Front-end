// components/leads/DeleteLeadDialog.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadTitle?: string;
  onConfirm?: () => void;
}

export default function DeleteLeadDialog({ 
  open, 
  onOpenChange,
  leadTitle,
  onConfirm 
}: DeleteLeadDialogProps) {
  const handleConfirm = () => {
    console.log('Lead deleted');
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Delete Lead?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {leadTitle 
              ? `Are you sure you want to delete "${leadTitle}"? This action cannot be undone.`
              : 'Are you sure you want to delete this lead? This action cannot be undone.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}