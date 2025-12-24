import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from '@/lib/invoice-template';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Ambil leadId dan token dari URL Query Params
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    const token = searchParams.get('token');

    // Validasi input
    if (!leadId || !token) {
      return NextResponse.json({ error: 'Lead ID and Token required' }, { status: 400 });
    }

    // 1. Fetch Data Invoice dari Backend (Server-to-Server)
    // Kita gunakan token yang dikirim dari frontend untuk otentikasi ke Backend
    const res = await fetch(`${API_URL}/leads/${leadId}/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!res.ok) {
      console.error("Backend Error:", await res.text());
      return NextResponse.json({ error: 'Failed to fetch invoice data from backend' }, { status: 404 });
    }

    const invoiceData = await res.json();

    // 2. Generate HTML dari Template
    const htmlContent = generateInvoiceHTML(invoiceData);

    // 3. Jalankan Puppeteer (Chrome Headless)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set konten HTML ke halaman browser virtual
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Cetak ke PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Agar background warna tercetak
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // 4. Return PDF Stream ke Browser User
    // Menggunakan 'as any' untuk menghindari error tipe BodyInit pada TypeScript
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceData.content || 'document'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Make sure puppeteer is installed and backend is reachable.' }, 
      { status: 500 }
    );
  }
}