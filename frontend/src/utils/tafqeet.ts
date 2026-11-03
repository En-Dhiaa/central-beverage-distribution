/**
 * Helper to convert numbers to Arabic words (Tafqeet / تفقيط المبالغ المالية)
 */
export function tafqeetRial(amount: number): string {
  if (amount <= 0) return 'صفر ريال';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
                 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(n: number): string {
    let res = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      res += hundreds[h];
    }

    if (remainder > 0) {
      if (res.length > 0) res += ' و';
      if (remainder < 20) {
        res += units[remainder];
      } else {
        const u = remainder % 10;
        const t = Math.floor(remainder / 10);
        if (u > 0) {
          res += units[u] + ' و' + tens[t];
        } else {
          res += tens[t];
        }
      }
    }
    return res;
  }

  const millions = Math.floor(amount / 1000000);
  const thousands = Math.floor((amount % 1000000) / 1000);
  const remainder = Math.floor(amount % 1000);

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(`${convertGroup(thousands)} آلاف`);
    else parts.push(`${convertGroup(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  return `فقط ${parts.join(' و')} ريال يمني لا غير`;
}

