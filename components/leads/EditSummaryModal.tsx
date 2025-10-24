// components/leads/EditSummaryModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSummaryModal({ open, onOpenChange }: EditSummaryModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Summary updated');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Lead Summary</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Value & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealValue">Deal Value</Label>
              <Input
                id="dealValue"
                type="number"
                defaultValue="0"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="idr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idr">IDR</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Company Name & Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter Company Name"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                placeholder="Enter Contact Person Name"
              />
            </div>
          </div>

          {/* Priority & Client Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientType">Client Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Client</SelectItem>
                  <SelectItem value="existing">Existing Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
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