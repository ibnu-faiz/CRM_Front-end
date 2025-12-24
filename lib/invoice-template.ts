import { LeadActivity } from "@/lib/types";

export const generateInvoiceHTML = (invoice: LeadActivity) => {
  const meta = invoice.meta || {};
  const items = meta.items || [];
  
  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if(!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatAddress = (text: string) => {
    if (!text) return '-';
    return text.replace(/\n/g, '<br/>');
  };

  // --- HTML TEMPLATE (Disesuaikan agar MIRIP dengan Preview React) ---
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Download ${invoice.content}</title>
      <style>
        /* RESET & BASE */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif; 
          color: #111827; 
          margin: 0; 
          padding: 0;
          -webkit-print-color-adjust: exact;
          font-size: 14px;
        }

        /* A4 PAGE CONTAINER */
        .page { 
          width: 210mm; 
          min-height: 297mm; 
          margin: 0 auto; 
          padding: 40px; 
          box-sizing: border-box;
          background: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* UTILS */
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .font-extrabold { font-weight: 800; }
        .font-semibold { font-weight: 600; }
        .w-full { width: 100%; }

        /* COLORS */
        .text-gray-900 { color: #111827; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        
        /* 1. HEADER */
        .header { 
          display: flex; 
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px; /* Jarak ke garis pemisah */
        }
        .header h1 { margin: 0 0 4px; font-size: 24px; line-height: 1; }
        .header p { margin: 0; font-size: 14px; }
        .header h2 { margin: 0; font-size: 20px; }

        /* HR Separator (UPDATED: border-gray-300 / #d1d5db) */
        .separator-hr { 
          border-top: 1px solid #d1d5db; 
          margin-bottom: 24px; 
        }

        /* 2. ADDRESSES */
        .addresses { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 24px; 
          margin-bottom: 24px; 
        }
        .address-box h4 { margin: 0 0 8px; font-size: 14px; }
        .address-box div { font-size: 14px; line-height: 1.5; }
        .address-name { font-weight: 700; color: #000000; margin-bottom: 4px; }

        /* 3. DATES */
        .dates { 
          display: flex; 
          background: #f9fafb; 
          padding: 16px; 
          border-radius: 6px; 
          border: 1px solid #d1d5db; 
          margin-bottom: 32px; 
        }
        .date-item { flex: 1; }
        .date-item h4 { margin: 0 0 4px; font-size: 14px; }
        .date-item p { margin: 0; font-size: 14px; color: #1f2937; font-weight: 500; }

        /* 4. TABLE */
        .table-container {
          border: 1px solid #d1d5db; 
          border-radius: 8px; 
          overflow: hidden; 
          margin-bottom: 16px; 
        }
        table { width: 100%; border-collapse: collapse; }
        thead { background-color: #f3f4f6; }
        th { 
          text-align: left; 
          padding: 12px 16px; 
          font-size: 14px; 
          font-weight: 600; 
          color: #374151; 
          border-bottom: 1px solid #d1d5db;
        }
        td { 
          padding: 12px 16px; 
          font-size: 14px; 
          border-top: 1px solid #d1d5db; 
        }

        /* 5. SEPARATOR LINE */
        .divider-line {
          border-top: 1px solid #d1d5db; /* border-gray-300 */
          margin: 8px 0; 
        }

        /* 6. TOTALS & NOTES */
        .summary-container { margin-top: 8px; }

        /* Totals Box */
        .totals-box {
          background-color: #f9fafb; 
          padding: 16px; 
          border-radius: 8px; 
          border: 1px solid #d1d5db;
          margin-bottom: 16px;
        }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; gap: 16px; font-size: 14px; }
        .total-line { height: 1px; background-color: #d1d5db; margin: 8px 0; }
        .total-final { display: flex; justify-content: space-between; margin-top: 8px; gap: 16px; }
        .total-final span:first-child { font-size: 16px; font-weight: 700; color: #111827; }
        .total-final span:last-child { font-size: 18px; font-weight: 700; color: #111827; }

        /* Notes Box */
        .notes-box {
          background-color: #f3f4f6; 
          padding: 16px; 
          border-radius: 8px; 
          border: 1px solid #d1d5db;
        }
        .notes-box h4 { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #000000; }
        .notes-box p { margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5; }

        /* 7. FOOTER */
        .footer {
          margin-top: auto;
          padding-top: 32px;
          border-top: 1px solid #d1d5db; /* border-gray-300 */
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }
        .footer p { margin: 0 0 8px; font-weight: 700; color: #111827; }
        .footer-links { display: flex; justify-content: center; gap: 16px; }

      </style>
    </head>
    <body>
      <div class="page">
        
        <!-- 1. HEADER -->
        <div class="header">
          <div>
            <h1 class="font-bold text-[#000000]">Invoice</h1>
            <p class="text-gray-600 font-medium">${invoice.content}</p>
          </div>
          <div class="text-right">
            <h2 class="font-extrabold text-[#1f2937]">CRM cmlabs</h2>
          </div>
        </div>

        <!-- GARIS PEMISAH HEADER (Updated) -->
        <div class="separator-hr"></div>

        <!-- 2. ADDRESSES -->
        <div class="addresses">
          <div class="address-box">
            <h4 class="font-semibold text-[#111827]">Billed By:</h4>
            <div class="text-gray-600">
              <div class="address-name">${meta.billedBy ? meta.billedBy.split('\n')[0] : 'cmlabs'}</div>
              <div>${formatAddress(meta.billedBy ? meta.billedBy.split('\n').slice(1).join('\n') : '')}</div>
            </div>
          </div>
          <div class="address-box text-right">
            <h4 class="font-semibold text-[#111827]">Billed To:</h4>
            <div class="text-gray-600">
              <div class="address-name">${meta.billedTo ? meta.billedTo.split('\n')[0] : 'Client Name'}</div>
              <div>${formatAddress(meta.billedTo ? meta.billedTo.split('\n').slice(1).join('\n') : '')}</div>
            </div>
          </div>
        </div>

        <!-- 3. DATES -->
        <div class="dates">
          <div class="date-item">
            <h4 class="font-semibold text-[#111827]">Date Invoice:</h4>
            <p>${formatDate(meta.invoiceDate)}</p>
          </div>
          <div class="date-item text-right">
            <h4 class="font-semibold text-[#111827]">Due Date:</h4>
            <p>${formatDate(meta.dueDate)}</p>
          </div>
        </div>

        <!-- 4. TABLE -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Item Name</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Unit Price</th>
                <th style="width: 25%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td class="font-medium text-[#111827]">${item.name}</td>
                  <td style="text-align: center; color: #4b5563;">${item.qty}</td>
                  <td style="text-align: right; color: #4b5563;">${formatCurrency(item.unitPrice)}</td>
                  <td style="text-align: right; font-weight: 600; color: #111827;">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- LINE SEPARATOR (Garis Tegas) -->
        <div class="divider-line"></div>

        <!-- 5. TOTALS & NOTES -->
        <div class="summary-container">
          
          <!-- Totals Box -->
          <div class="totals-box">
            <div class="total-row">
              <span class="font-semibold text-[#111827]">Subtotal</span>
              <span class="font-semibold text-[#111827]">${formatCurrency(meta.subtotal || 0)}</span>
            </div>
            <div class="total-row">
              <span class="font-semibold text-[#111827]">Tax (10%)</span>
              <span class="font-semibold text-[#111827]">${formatCurrency(meta.tax || 0)}</span>
            </div>
            
            <div class="total-line"></div>
            
            <div class="total-final">
              <span>Total Amount</span>
              <span>${formatCurrency(meta.totalAmount || 0)}</span>
            </div>
          </div>

          <!-- Notes Box -->
          ${meta.notes ? `
            <div class="notes-box">
              <h4>Notes</h4>
              <p>${meta.notes}</p>
            </div>
          ` : ''}
        </div>

        <!-- 7. FOOTER -->
        <div class="footer">
          <p>THANK YOU FOR YOUR BUSINESS!</p>
          <div class="footer-links">
             <span>088897233</span>
             <span>•</span>
             <span>cmlabs</span>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
};