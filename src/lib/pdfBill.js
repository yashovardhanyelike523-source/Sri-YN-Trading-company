// ==============================================================================
// SRI YN TRADING COMPANY — PROFESSIONAL PDF BILL GENERATOR
// Crisp A4 invoice generation using jsPDF with full Indian formatting
// ==============================================================================

import { jsPDF } from 'jspdf';
import { formatNumber, formatINR, formatDate } from './formatters';

export function generatePdfBill(billData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header Banner Background (Deep Red)
  doc.setFillColor(153, 27, 27); // #991b1b
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Golden accent line
  doc.setFillColor(217, 119, 6); // #d97706
  doc.rect(0, 35, pageWidth, 2.5, 'F');

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SRI YN TRADING COMPANY', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(254, 240, 138); // light yellow
  doc.text('Wholesale Red Chilli Traders, Commission Agents & Cold Storage Hub', pageWidth / 2, 23, { align: 'center' });
  doc.text('Guntur • Khammam • Byadgi • Warangal • APMC Market Yard', pageWidth / 2, 29, { align: 'center' });

  // 2. Invoice Title Banner
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SALE INVOICE / BILL OF SALE', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Bill Date: ${formatDate(billData.transaction_date || new Date())}`, pageWidth - 14, 48, { align: 'right' });

  // 3. Bill & Party Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 53, pageWidth - 28, 30, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Bill Number:', 18, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(String(billData.bill_number || billData.transaction_id || 'YN-BILL-001'), 46, 62);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Customer / Buyer:', 18, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(String(billData.party_name || 'Cash Customer'), 54, 70);

  if (billData.party_phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 18, 77);
    doc.setFont('helvetica', 'normal');
    doc.text(String(billData.party_phone), 34, 77);
  }

  // Right side of info box
  doc.setFont('helvetica', 'bold');
  doc.text('Cold Storage:', pageWidth / 2 + 10, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(String(billData.cold_storage_name || 'Direct Delivery'), pageWidth / 2 + 40, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Lot Number:', pageWidth / 2 + 10, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(String(billData.lot_number || 'Standard Lot'), pageWidth / 2 + 40, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Mode:', pageWidth / 2 + 10, 77);
  doc.setFont('helvetica', 'normal');
  doc.text(String(billData.payment_method || 'CASH'), pageWidth / 2 + 40, 77);

  // 4. Line Items Table Header
  const tableTop = 92;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, tableTop, pageWidth - 28, 9, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('S.No', 18, tableTop + 6);
  doc.text('Item Description / Chilli Grade', 32, tableTop + 6);
  doc.text('Quantity (kg)', 110, tableTop + 6, { align: 'right' });
  doc.text('Rate (₹/kg)', 145, tableTop + 6, { align: 'right' });
  doc.text('Amount (₹)', pageWidth - 18, tableTop + 6, { align: 'right' });

  // Row 1
  const rowTop = tableTop + 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1.', 18, rowTop + 7);
  doc.text(String(billData.item_name || 'Red Chilli Quality Grade'), 32, rowTop + 7);
  doc.text(`${formatNumber(billData.quantity_kg, 0)} kg`, 110, rowTop + 7, { align: 'right' });
  doc.text(`₹ ${formatNumber(billData.rate_per_kg, 2)}`, 145, rowTop + 7, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`₹ ${formatNumber(billData.total_amount, 2)}`, pageWidth - 18, rowTop + 7, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, rowTop + 12, pageWidth - 14, rowTop + 12);

  // 5. Financial Summary Box (Right aligned)
  const summaryTop = rowTop + 20;
  const summaryLeft = pageWidth - 90;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Sale Amount:', summaryLeft, summaryTop);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(billData.total_amount), pageWidth - 18, summaryTop, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52); // green
  doc.text('Paid / Received Amount:', summaryLeft, summaryTop + 8);
  doc.text(formatINR(billData.paid_amount), pageWidth - 18, summaryTop + 8, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryLeft, summaryTop + 12, pageWidth - 14, summaryTop + 12);

  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28); // red
  doc.text('Balance Due:', summaryLeft, summaryTop + 19);
  doc.text(formatINR(billData.balance_amount), pageWidth - 18, summaryTop + 19, { align: 'right' });

  // 6. Remarks & Terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Terms & Conditions:', 14, summaryTop);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Goods once sold and weighed from cold storage will not be returned.', 14, summaryTop + 5);
  doc.text('2. Please settle remaining balance promptly as per trading agreement.', 14, summaryTop + 10);
  doc.text('3. This is a computer generated official statement of Sri YN Trading Company.', 14, summaryTop + 15);

  if (billData.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Notes: ${billData.remarks}`, 14, summaryTop + 22);
  }

  // 7. Signature Lines
  const sigTop = summaryTop + 45;
  doc.setDrawColor(148, 163, 184);
  doc.line(18, sigTop, 65, sigTop);
  doc.line(pageWidth - 70, sigTop, pageWidth - 18, sigTop);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text("Customer's Signature", 24, sigTop + 6);
  doc.text('Authorized Signatory', pageWidth - 60, sigTop + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('For SRI YN TRADING COMPANY', pageWidth - 68, sigTop + 11);

  // Download PDF
  const cleanBillNo = (billData.bill_number || billData.transaction_id || 'BILL').replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`Sri_YN_Bill_${cleanBillNo}.pdf`);
}

export const generateBillPdf = generatePdfBill;

