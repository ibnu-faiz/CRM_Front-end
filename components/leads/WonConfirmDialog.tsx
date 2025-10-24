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
import { Check } from 'lucide-react';

interface WonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WonConfirmDialog({ open, onOpenChange }: WonConfirmDialogProps) {
  const handleConfirm = () => {
    console.log('Lead marked as won');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Are you sure you want to won this leads?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Press won if you are sure
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Won
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gray-800 hover:bg-gray-700"
          >
            Lost
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}