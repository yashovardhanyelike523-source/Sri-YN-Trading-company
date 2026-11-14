// ==============================================================================
// SRI YN TRADING COMPANY — NUMERICAL & DATE FORMATTERS
// Indian Rupees Currency, Kilogram to Quintal Conversion, Date Standards
// ==============================================================================

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(val, decimals = 2) {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatKgAndQtl(kg) {
  const numKg = Number(kg) || 0;
  const numQtl = numKg / 100;
  return `${formatNumber(numKg, 0)} kg (${formatNumber(numQtl, 2)} Qtl)`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

export function generateBillNumber() {
  const d = new Date();
  const yr = String(d.getFullYear()).slice(-2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const rnd = Math.floor(100 + Math.random() * 900);
  return `YN-BILL-${yr}${mo}-${rnd}`;
}

export const CHILLI_VARIETIES = [
  'Teja',
  'Byadgi',
  'Guntur Sannam',
  '273',
  'Devanur Deluxe',
  'Armoor',
  'Wonder Hot',
  '334 / S10',
  'Other Variety',
];
