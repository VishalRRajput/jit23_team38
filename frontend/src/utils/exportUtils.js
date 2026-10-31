/**
 * Enterprise Report & Log Export Utility
 * Supports CSV, Excel (.xls), and PDF format downloads client-side
 */

// Helper to trigger browser file download
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// 1. Export as CSV
export function exportToCsv(filename, headers, rows) {
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCsv).join(',');
  const rowLines = rows.map(row => row.map(escapeCsv).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n'); // UTF-8 BOM for Excel compatibility

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

// 2. Export as Excel (.xls HTML table workbook format)
export function exportToExcel(filename, title, headers, rows) {
  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>
        body { font-family: Arial, sans-serif; }
        .title-cell { font-size: 16px; font-weight: bold; color: #1e293b; padding: 10px 0; }
        .meta-cell { font-size: 11px; color: #64748b; padding-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #1e293b; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #475569; text-align: left; }
        td { padding: 6px 12px; border: 1px solid #cbd5e1; font-size: 11px; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .status-present { background-color: #d1fae5; color: #065f46; font-weight: bold; }
        .status-late { background-color: #fef3c7; color: #92400e; font-weight: bold; }
        .status-absent { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${headers.length}" class="title-cell">${title || 'Export Report'}</td></tr>
        <tr><td colspan="${headers.length}" class="meta-cell">Generated on: ${new Date().toLocaleString()} | Total Records: ${rows.length}</td></tr>
        <tr></tr>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => {
                const text = cell !== null && cell !== undefined ? String(cell) : '';
                let extraClass = '';
                if (text === 'Present') extraClass = 'class="status-present"';
                else if (text === 'Late') extraClass = 'class="status-late"';
                else if (text === 'Absent') extraClass = 'class="status-absent"';
                return `<td ${extraClass}>${text}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

// 3. Export as PDF (Standard valid PDF 1.4 document)
export function exportToPdf(filename, title, subtitle, headers, rows) {
  function escapePdf(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  const pageWidth = 612; // Letter
  const pageHeight = 792;
  const margin = 36;
  const usableWidth = pageWidth - margin * 2;
  const rowHeight = 20;
  const rowsPerPage = 26;

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const colWidth = usableWidth / headers.length;

  let pageObjNums = [];
  let contentObjNums = [];

  let currentObj = 5;
  for (let p = 0; p < totalPages; p++) {
    pageObjNums.push(currentObj++);
    contentObjNums.push(currentObj++);
  }

  let pdf = '%PDF-1.4\n';
  let offsets = [];

  function recordOffset() {
    offsets.push(pdf.length);
  }

  // Obj 1: Catalog
  recordOffset();
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';

  // Obj 2: Pages
  recordOffset();
  pdf += '2 0 obj\n<< /Type /Pages /Kids [' + pageObjNums.map(n => n + ' 0 R').join(' ') + '] /Count ' + totalPages + ' >>\nendobj\n';

  // Obj 3: Font Regular
  recordOffset();
  pdf += '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';

  // Obj 4: Font Bold
  recordOffset();
  pdf += '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';

  for (let p = 0; p < totalPages; p++) {
    const pageNum = p + 1;
    const pageRows = rows.slice(p * rowsPerPage, (p + 1) * rowsPerPage);

    let stream = '';
    stream += 'q\n';

    // Header banner dark navy
    stream += '0.12 0.16 0.22 rg\n';
    stream += margin + ' ' + (pageHeight - margin - 46) + ' ' + usableWidth + ' 46 re f\n';

    // Title
    stream += 'BT /F2 15 Tf 1 1 1 rg ' + (margin + 12) + ' ' + (pageHeight - margin - 24) + ' Td (' + escapePdf(title) + ') Tj ET\n';
    // Subtitle
    stream += 'BT /F1 8.5 Tf 0.8 0.85 0.9 rg ' + (margin + 12) + ' ' + (pageHeight - margin - 38) + ' Td (' + escapePdf(subtitle + ' | Page ' + pageNum + ' of ' + totalPages) + ') Tj ET\n';

    // Table Header
    const tableTop = pageHeight - margin - 66;
    stream += '0.24 0.28 0.36 rg\n';
    stream += margin + ' ' + (tableTop - 18) + ' ' + usableWidth + ' 18 re f\n';

    for (let c = 0; c < headers.length; c++) {
      const x = margin + c * colWidth + 5;
      const y = tableTop - 13;
      stream += 'BT /F2 8.5 Tf 1 1 1 rg ' + x + ' ' + y + ' Td (' + escapePdf(headers[c]) + ') Tj ET\n';
    }

    // Table Rows
    let currentY = tableTop - 18;
    for (let r = 0; r < pageRows.length; r++) {
      const row = pageRows[r];
      if (r % 2 === 0) {
        stream += '0.96 0.97 0.98 rg\n';
        stream += margin + ' ' + (currentY - rowHeight) + ' ' + usableWidth + ' ' + rowHeight + ' re f\n';
      }
      // Row bottom border
      stream += '0.88 0.90 0.92 RG 0.5 w\n';
      stream += margin + ' ' + (currentY - rowHeight) + ' m ' + (margin + usableWidth) + ' ' + (currentY - rowHeight) + ' l S\n';

      for (let c = 0; c < headers.length; c++) {
        const val = String(row[c] !== undefined && row[c] !== null ? row[c] : '');
        const x = margin + c * colWidth + 5;
        const y = currentY - 14;

        const maxChars = Math.floor(colWidth / 5.5);
        const displayVal = val.length > maxChars ? val.substring(0, maxChars - 2) + '..' : val;

        stream += 'BT /F1 8 Tf 0.15 0.18 0.22 rg ' + x + ' ' + y + ' Td (' + escapePdf(displayVal) + ') Tj ET\n';
      }
      currentY -= rowHeight;
    }

    // Footer
    stream += 'BT /F1 7.5 Tf 0.5 0.5 0.5 rg ' + margin + ' ' + (margin - 16) + ' Td (Generated by Employee Tracking System | Confidential) Tj ET\n';
    stream += 'Q\n';

    const streamLength = stream.length;

    // Obj Page
    recordOffset();
    pdf += pageObjNums[p] + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageWidth + ' ' + pageHeight + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + contentObjNums[p] + ' 0 R >>\nendobj\n';

    // Obj Content
    recordOffset();
    pdf += contentObjNums[p] + ' 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + stream + '\nendstream\nendobj\n';
  }

  // xref
  const startXref = pdf.length;
  const totalObjects = offsets.length + 1;
  pdf += 'xref\n0 ' + totalObjects + '\n0000000000 65535 f \n';
  for (let o = 0; o < offsets.length; o++) {
    pdf += String(offsets[o]).padStart(10, '0') + ' 00000 n \n';
  }

  pdf += 'trailer\n<< /Size ' + totalObjects + ' /Root 1 0 R >>\nstartxref\n' + startXref + '\n%%EOF';

  // Convert binary ASCII string to Uint8Array
  const buffer = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    buffer[i] = pdf.charCodeAt(i) & 0xff;
  }

  const blob = new Blob([buffer], { type: 'application/pdf' });
  downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// 4. Export as JSON
export function exportToJson(filename, data) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}
