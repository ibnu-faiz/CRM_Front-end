'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, FileText, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadActivity } from '@/lib/types';

interface InvoiceViewProps {
  invoices: LeadActivity[] | undefined;
  error: any;
  onEditInvoice: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPreviewInvoice: (invoiceId: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (isoString?: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function InvoiceView({ 
  invoices, error, onEditInvoice, onDeleteInvoice, onPreviewInvoice 
}: InvoiceViewProps) {
  
  if (error) return <div className="text-red-500 p-4">Failed to load Invoices</div>;

  // Fungsi Badge Status (Diperbaiki agar tidak Case Sensitive)
  const renderStatusBadge = (statusRaw: string) => {
    const status = (statusRaw || 'draft').toLowerCase(); // Paksa huruf kecil
    
    let colorClass = "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"; // Default (Draft/Unpaid)

    if (status === 'paid') {
      colorClass = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
    } else if (status === 'sent') {
      colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
    } else if (status === 'overdue') {
      colorClass = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
    }

    return (
      <Badge variant="outline" className={`${colorClass} capitalize`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => {
                const invoiceNo = invoice.content;
                const meta = invoice.meta || {};
                const status = meta.status || 'draft';
                const total = meta.totalAmount || 0;

                return (
                  <TableRow key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded w-fit">
                        <FileText className="w-4 h-4" />
                      </div>
                    </TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer text-blue-600 hover:underline"
                      onClick={() => onPreviewInvoice(invoice.id)}
                    >
                      {invoiceNo}
                    </TableCell>
                    <TableCell>{formatDate(meta.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(meta.dueDate)}</TableCell>
                    <TableCell>
                      {renderStatusBadge(status)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onPreviewInvoice(invoice.id)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditInvoice(invoice.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteInvoice(invoice.id)} 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}