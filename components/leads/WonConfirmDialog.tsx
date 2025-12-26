// components/leads/WonConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CircleCheck } from 'lucide-react';

interface WonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadTitle?: string;
  onConfirm?: () => void;
}

export default function WonConfirmDialog({ 
  open, 
  onOpenChange,
  leadTitle,
  onConfirm
}: WonConfirmDialogProps) {
  const handleConfirm = () => {
    console.log('Lead marked as won');
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CircleCheck className="w-8 h-8 text-green-600" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Are you sure you want to won this leads?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {leadTitle 
              ? `Are you sure you want to mark "${leadTitle}" as won?`
              : 'Are you sure you want to mark this lead as won?'
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
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}