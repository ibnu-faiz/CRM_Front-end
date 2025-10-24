// components/leads/AddNoteModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, Underline, List, Link as LinkIcon, Image } from 'lucide-react';

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: number | null;
}

export default function AddNoteModal({ open, onOpenChange, noteId }: AddNoteModalProps) {
  const isEditMode = noteId !== null && noteId !== undefined;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isEditMode ? 'Note updated' : 'Note created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Created */}
          <div>
            <Label htmlFor="dateCreated">Date Created</Label>
            <Input
              id="dateCreated"
              type="date"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter Lead Description"
              rows={6}
              className="resize-none"
            />
            
            {/* Rich Text Editor Toolbar */}
            <div className="flex items-center gap-1 border-t pt-2 mt-2">
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded">
                <Image className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            {isEditMode ? 'Update Note' : 'Create Note'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}