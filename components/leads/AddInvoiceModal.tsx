"use client";

import { useState, useEffect, FormEvent } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { LeadActivity } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DEF_BY_COMPANY = "cmlabs";
const DEF_BY_ADDRESS =
  "Jl. Seruni No.9, Lowokwaru, Kec.\nLowokwaru, Kota Malang, Jawa Timur";
const DEF_BY_EMAIL = "marketing@cmlabs.co";

interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  invoiceId?: string | null;
  onInvoiceAdded: () => void;
  lead?: any;
}

const formatToDate = (value: any) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

const parseLegacyString = (fullText: string) => {
  if (!fullText) return { company: "", address: "", email: "" };
  const lines = fullText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.length === 0) return { company: "", address: "", email: "" };
  const company = lines[0];
  let email = "";
  let addressLines = [];
  const lastLine = lines[lines.length - 1];
  if (lines.length > 1 && lastLine.includes("@")) {
    email = lastLine;
    addressLines = lines.slice(1, lines.length - 1);
  } else {
    addressLines = lines.slice(1);
  }
  return { company, email, address: addressLines.join("\n") };
};

const getActualLead = (data: any) => {
  if (!data) return null;
  if (data.lead && typeof data.lead === "object") {
    return data.lead;
  }
  return data;
};

export default function AddInvoiceModal({
  open,
  onOpenChange,
  leadId,
  invoiceId,
  onInvoiceAdded,
  lead,
}: AddInvoiceModalProps) {
  const isEditMode = invoiceId !== null && invoiceId !== undefined;

  const { data: fetchedLead } = useSWR(
    open && leadId && !lead ? `${API_URL}/leads/${leadId}` : null,
    fetcher
  );

  const rawData = lead || fetchedLead;
  const activeLead = getActualLead(rawData);

  // --- STATE ---
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState("draft");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [byCompany, setByCompany] = useState(DEF_BY_COMPANY);
  const [byAddress, setByAddress] = useState(DEF_BY_ADDRESS);
  const [byEmail, setByEmail] = useState(DEF_BY_EMAIL);

  const [toCompany, setToCompany] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [toEmail, setToEmail] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", qty: 1, unitPrice: 0, total: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + tax;

  const addItem = () =>
    setItems([...items, { name: "", qty: 1, unitPrice: 0, total: 0 }]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    let newItem = { ...newItems[index], [field]: value };
    if (field === "qty" || field === "unitPrice") {
      const qty = field === "qty" ? parseFloat(value) || 0 : newItem.qty;
      const unitPrice =
        field === "unitPrice" ? parseFloat(value) || 0 : newItem.unitPrice;
      newItem.total = qty * unitPrice;
    }
    newItems[index] = newItem;
    setItems(newItems);
  };

  // --- EFFECT 1: RESET & AUTO-FILL (CREATE MODE) ---
  useEffect(() => {
    if (open && !isEditMode) {
      setInvoiceNo(""); // Reset jadi string kosong, JANGAN null/undefined
      setStatus("draft");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setDueDate("");
      setItems([{ name: "", qty: 1, unitPrice: 0, total: 0 }]);
      setNotes("");
      setError("");

      setByCompany(DEF_BY_COMPANY);
      setByAddress(DEF_BY_ADDRESS);
      setByEmail(DEF_BY_EMAIL);

      if (activeLead) {
        const name = activeLead.company || activeLead.contacts || "";
        const email = activeLead.email || "";

        setToCompany(name);
        setToEmail(email);
        setToAddress("");
      } else {
        setToCompany("");
        setToEmail("");
        setToAddress("");
      }
    }
  }, [open, isEditMode, activeLead]);

  // --- EFFECT 2: FETCH DATA (EDIT MODE) ---
  useEffect(() => {
    if (open && isEditMode && invoiceId) {
      const fetchInvoice = async () => {
        setLoading(true);
        try {
          const data = (await fetcher(
            `${API_URL}/leads/${leadId}/invoices/${invoiceId}`
          )) as LeadActivity;

          const meta = data.meta || {};

          // --- FIX UTAMA: Mencegah Undefined ---
          // Ambil dari data.title (format baru), fallback ke content, fallback ke ""
          setInvoiceNo(data.title || data.content || "");

          setStatus(meta.status || "draft");
          setInvoiceDate(formatToDate(meta.invoiceDate || data.createdAt));
          setDueDate(formatToDate(meta.dueDate));

          // Set Billed By
          if (meta.byCompany) {
            setByCompany(meta.byCompany);
            setByAddress(meta.byAddress || "");
            setByEmail(meta.byEmail || "");
          } else if (meta.billedBy) {
            const parsed = parseLegacyString(meta.billedBy);
            setByCompany(parsed.company);
            setByAddress(parsed.address);
            setByEmail(parsed.email);
          }

          // Set Billed To
          if (meta.toCompany) {
            setToCompany(meta.toCompany);
            setToAddress(meta.toAddress || "");
            setToEmail(meta.toEmail || "");
          } else if (meta.billedTo) {
            const parsed = parseLegacyString(meta.billedTo);
            setToCompany(parsed.company);
            setToAddress(parsed.address);
            setToEmail(parsed.email);
          }

          setItems(
            meta.items || [{ name: "", qty: 0, unitPrice: 0, total: 0 }]
          );
          setNotes(meta.notes || "");
        } catch (err) {
          toast.error("Gagal memuat data invoice");
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [open, isEditMode, invoiceId, leadId]);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const combinedBilledBy = `${byCompany}\n${byAddress}\n${byEmail}`;
    const combinedBilledTo = `${toCompany}\n${toAddress}\n${toEmail}`;

    // --- STRUKTUR DATA BARU (Sesuai Controller) ---
    const payload = {
      type: "INVOICE",

      // Kirim Invoice No ke 'title'.
      // Jika CREATE dan kosong, Backend akan auto-generate.
      // Jika EDIT, kita kirim invoiceNo yang ada.
      title: invoiceNo || "",
      content: invoiceNo || "", // Fallback untuk safety

      description: `Invoice for ${toCompany}`,

      // Semua detail masuk ke META
      meta: {
        status,

        invoiceDate: invoiceDate
          ? new Date(invoiceDate).toISOString()
          : new Date().toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,

        // Simpan field terpisah agar mudah diedit lagi
        byCompany,
        byAddress,
        byEmail,
        toCompany,
        toAddress,
        toEmail,

        // Simpan gabungan string (legacy support / display)
        billedBy: combinedBilledBy,
        billedTo: combinedBilledTo,

        items,
        notes,
        subtotal,
        tax,
        totalAmount,
      },
    };

    const url = isEditMode
      ? `${API_URL}/leads/${leadId}/invoices/${invoiceId}`
      : `${API_URL}/leads/${leadId}/invoices`;
    const method = isEditMode ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save Invoice");
      }

      toast.success(isEditMode ? "Invoice updated" : "Invoice created");
      onInvoiceAdded();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Invoice" : "Add New Invoice"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-1.5">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                // --- FIX Controlled/Uncontrolled ---
                // Pastikan selalu string, jangan undefined
                value={invoiceNo || ""}
                placeholder={isEditMode ? "" : "(Auto Generated by System)"}
                readOnly
                className="bg-gray-100 text-gray-500 font-medium"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-1.5">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate || ""} // Safety check
                onChange={(e) => setInvoiceDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate || ""} // Safety check
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* ... SISA FORM TAMPILAN SAMA ... */}
          {/* Bagian Billed By & To aman karena state string diinisialisasi di atas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                Billed By (From)
              </h3>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Company</Label>
                <Input
                  value={byCompany}
                  onChange={(e) => setByCompany(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea
                  value={byAddress}
                  onChange={(e) => setByAddress(e.target.value)}
                  rows={3}
                  className="bg-white resize-none"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Email</Label>
                <Input
                  value={byEmail}
                  onChange={(e) => setByEmail(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                Billed To (Client)
              </h3>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">
                  Client / Company Name
                </Label>
                <Input
                  value={toCompany}
                  onChange={(e) => setToCompany(e.target.value)}
                  className="bg-white"
                  placeholder="Client Company..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  rows={3}
                  className="bg-white resize-none"
                  placeholder="Client Address..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Email</Label>
                <Input
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="bg-white"
                  placeholder="client@email.com"
                />
              </div>
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="grid gap-1.5">
            <Label>Items</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="text-left p-3 font-medium w-1/4">
                      Item Name
                    </th>
                    <th className="text-center p-3 font-medium w-24">Qty</th>
                    <th className="text-center p-3 font-medium w-56">
                      Unit Price
                    </th>
                    <th className="text-right p-3 font-medium w-56">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-1">
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          className="border border-gray-300 focus-visible:ring-1"
                          placeholder="Item..."
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(index, "qty", e.target.value)
                          }
                          // Tambahkan class ajaib di sini
                          className="text-center border border-gray-300 focus-visible:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, "unitPrice", e.target.value)
                          }
                          // Tambahkan class ajaib di sini juga
                          className="text-center border border-gray-300 focus-visible:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="p-2 text-right font-medium">
                        IDR {item.total.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="relative hidden sm:flex group rounded-full"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500 transition-transform hover:-rotate-10" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-2 gap-2 w-fit"
              onClick={addItem}
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>

          {/* TOTAL & NOTES */}
          <div className="grid grid-cols-2 gap-8">
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between border-b py-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-medium">
                  IDR {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-sm text-gray-600">Tax (10%)</span>
                <span className="font-medium">
                  IDR {tax.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">
                  IDR {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="submit"
              className="flex-1 bg-gray-800 hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                "Update Invoice"
              ) : (
                "Create Invoice"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
