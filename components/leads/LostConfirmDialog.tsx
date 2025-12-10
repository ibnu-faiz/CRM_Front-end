// components/leads/LostConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface LostConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadTitle?: string;
  onConfirm?: () => void;
}

export default function LostConfirmDialog({ 
  open, 
  onOpenChange,
  leadTitle,
  onConfirm 
}: LostConfirmDialogProps) {
  const handleConfirm = () => {
    console.log('Lead marked as lost');
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Mark as Lost?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {leadTitle 
              ? `Are you sure you want to mark "${leadTitle}" as lost?`
              : 'Are you sure you want to mark this lead as lost?'
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
            className="flex-1 bg-orange-500 hover:bg-orange-600"
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}