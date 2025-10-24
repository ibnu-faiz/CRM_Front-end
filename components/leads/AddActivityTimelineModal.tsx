// components/leads/AddActivityModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddActivityModal({ open, onOpenChange }: AddActivityModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Activity created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activityType">Activity Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="0"
              />
            </div>
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
            <p className="text-xs text-gray-500 text-right mt-1">0/100</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700">
            Create Activity
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}