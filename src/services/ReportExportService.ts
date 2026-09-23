import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ExportData {
  reportType: 'sales' | 'purchases' | 'expenses';
  reportTitle: string;
  dateRange: { from: string; to: string };
  status: string;
  generatedBy: string;
  data: any[];
  totals: {
    quantity?: number;
    amount: number;
  };
}

export class ReportExportService {
  private static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private static formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private static generateFilename(reportType: string, fromDate: string, toDate: string, extension: string): string {
    const from = fromDate.replace(/-/g, '');
    const to = toDate.replace(/-/g, '');
    return `Balaji_Wash_Sand_${reportType}_${from}_to_${to}.${extension}`;
  }

  static async exportToExcel(exportData: ExportData): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Balaji Wash Sand ERP';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(exportData.reportTitle);

    // Header section
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BALAJI WASH SAND';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:J2');
    const reportCell = worksheet.getCell('A2');
    reportCell.value = exportData.reportTitle;
    reportCell.font = { size: 14, bold: true };
    reportCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:J3');
    const dateRangeCell = worksheet.getCell('A3');
    dateRangeCell.value = `Date Range: ${this.formatDate(exportData.dateRange.from)} - ${this.formatDate(exportData.dateRange.to)}`;
    dateRangeCell.font = { size: 10 };
    dateRangeCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:J4');
    const statusCell = worksheet.getCell('A4');
    statusCell.value = `Status: ${exportData.status || 'All'}`;
    statusCell.font = { size: 10 };
    statusCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A5:J5');
    const generatedCell = worksheet.getCell('A5');
    generatedCell.value = `Generated: ${new Date().toLocaleString('en-IN')}`;
    generatedCell.font = { size: 10, italic: true };
    generatedCell.alignment = { horizontal: 'center' };

    // Column headers (row 7)
    const headerRow = 7;
    let headers: string[] = [];
    let columnWidths: number[] = [];

    if (exportData.reportType === 'sales') {
      headers = ['Date', 'Slip No.', 'Customer', 'Vehicle', 'Material', 'Qty (BRASS)', 'Rate', 'Amount', 'Status', 'Created By'];
      columnWidths = [12, 18, 25, 15, 15, 12, 12, 15, 12, 15];
    } else if (exportData.reportType === 'purchases') {
      headers = ['Date', 'Slip No.', 'Supplier', 'Vehicle', 'Material', 'Qty (BRASS)', 'Rate', 'Amount', 'Status', 'Created By'];
      columnWidths = [12, 18, 25, 15, 15, 12, 12, 15, 12, 15];
    } else if (exportData.reportType === 'expenses') {
      headers = ['Date', 'Expense No.', 'Category', 'Description', 'Vendor/Person', 'Paid By', 'Payment Mode', 'Amount', 'Status', 'Created By'];
      columnWidths = [12, 18, 15, 30, 20, 15, 15, 15, 12, 15];
    }

    // Set column widths
    worksheet.columns.forEach((col, idx) => {
      col.width = columnWidths[idx] || 15;
    });

    // Add headers
    const headerRowObj = worksheet.getRow(headerRow);
    headers.forEach((header, idx) => {
      const cell = headerRowObj.getCell(idx + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    let currentRow = headerRow + 1;
    exportData.data.forEach((item, idx) => {
      const row = worksheet.getRow(currentRow);
      
      if (exportData.reportType === 'sales' || exportData.reportType === 'purchases') {
        row.getCell(1).value = this.formatDate(item.date);
        row.getCell(2).value = item.slip_number;
        row.getCell(3).value = item.party_name;
        row.getCell(4).value = item.vehicle_number;
        row.getCell(5).value = item.material_name;
        row.getCell(6).value = item.quantity_brass;
        row.getCell(6).numFmt = '0.00';
        row.getCell(7).value = item.rate;
        row.getCell(7).numFmt = '₹#,##0.00';
        row.getCell(8).value = item.total_amount;
        row.getCell(8).numFmt = '₹#,##0.00';
        row.getCell(9).value = item.transaction_state;
        row.getCell(10).value = item.created_by;
      } else if (exportData.reportType === 'expenses') {
        row.getCell(1).value = this.formatDate(item.date);
        row.getCell(2).value = item.expense_number;
        row.getCell(3).value = item.category;
        row.getCell(4).value = item.description_of_work;
        row.getCell(5).value = item.vendor_or_person;
        row.getCell(6).value = item.paid_by;
        row.getCell(7).value = item.payment_mode;
        row.getCell(8).value = item.amount;
        row.getCell(8).numFmt = '₹#,##0.00';
        row.getCell(9).value = item.transaction_state;
        row.getCell(10).value = item.created_by;
      }

      // Alternate row colors
      if (idx % 2 === 0) {
        for (let i = 1; i <= headers.length; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
      }

      // Add borders
      for (let i = 1; i <= headers.length; i++) {
        row.getCell(i).border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      }

      currentRow++;
    });

    // Add totals row
    const totalRow = worksheet.getRow(currentRow + 1);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font = { bold: true };
    
    if (exportData.reportType === 'sales' || exportData.reportType === 'purchases') {
      totalRow.getCell(6).value = exportData.totals.quantity || 0;
      totalRow.getCell(6).numFmt = '0.00';
      totalRow.getCell(6).font = { bold: true };
      totalRow.getCell(8).value = exportData.totals.amount;
      totalRow.getCell(8).numFmt = '₹#,##0.00';
      totalRow.getCell(8).font = { bold: true };
    } else if (exportData.reportType === 'expenses') {
      totalRow.getCell(8).value = exportData.totals.amount;
      totalRow.getCell(8).numFmt = '₹#,##0.00';
      totalRow.getCell(8).font = { bold: true };
    }

    // Style total row
    for (let i = 1; i <= headers.length; i++) {
      totalRow.getCell(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0F2FE' }
      };
      totalRow.getCell(i).border = {
        top: { style: 'medium' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    }

    // Add AutoFilter
    worksheet.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: currentRow - 1, column: headers.length }
    };

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', ySplit: headerRow }
    ];

    // Set print area
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.generateFilename(exportData.reportType, exportData.dateRange.from, exportData.dateRange.to, 'xlsx');
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static exportToPDF(exportData: ExportData): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('BALAJI WASH SAND', pageWidth / 2, margin, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(exportData.reportTitle, pageWidth / 2, margin + 8, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Date Range: ${this.formatDate(exportData.dateRange.from)} - ${this.formatDate(exportData.dateRange.to)}`,
      pageWidth / 2,
      margin + 14,
      { align: 'center' }
    );

    doc.text(
      `Status: ${exportData.status || 'All'}`,
      pageWidth / 2,
      margin + 19,
      { align: 'center' }
    );

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated: ${new Date().toLocaleString('en-IN')} by ${exportData.generatedBy}`,
      pageWidth / 2,
      margin + 24,
      { align: 'center' }
    );

    // Prepare table data
    let headers: string[] = [];
    let rows: any[][] = [];

    if (exportData.reportType === 'sales' || exportData.reportType === 'purchases') {
      headers = ['Date', 'Slip No.', 'Party', 'Vehicle', 'Material', 'Qty (BRASS)', 'Rate', 'Amount', 'Status'];
      rows = exportData.data.map(item => [
        this.formatDate(item.date),
        item.slip_number,
        item.party_name,
        item.vehicle_number,
        item.material_name,
        item.quantity_brass.toFixed(2),
        this.formatCurrency(item.rate),
        this.formatCurrency(item.total_amount),
        item.transaction_state
      ]);
    } else if (exportData.reportType === 'expenses') {
      headers = ['Date', 'Expense No.', 'Category', 'Description', 'Vendor', 'Paid By', 'Mode', 'Amount', 'Status'];
      rows = exportData.data.map(item => [
        this.formatDate(item.date),
        item.expense_number,
        item.category,
        item.description_of_work,
        item.vendor_or_person,
        item.paid_by,
        item.payment_mode,
        this.formatCurrency(item.amount),
        item.transaction_state
      ]);
    }

    // Add totals row
    if (exportData.reportType === 'sales' || exportData.reportType === 'purchases') {
      rows.push([
        '',
        '',
        '',
        '',
        'TOTAL',
        (exportData.totals.quantity || 0).toFixed(2),
        '',
        this.formatCurrency(exportData.totals.amount),
        ''
      ]);
    } else if (exportData.reportType === 'expenses') {
      rows.push([
        '',
        '',
        '',
        '',
        '',
        '',
        'TOTAL',
        this.formatCurrency(exportData.totals.amount),
        ''
      ]);
    }

    // Generate table
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: margin + 30,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      footStyles: {
        fillColor: [224, 242, 254],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data: any) => {
        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        const pageNumber = data.pageNumber;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    });

    // Save PDF
    doc.save(this.generateFilename(exportData.reportType, exportData.dateRange.from, exportData.dateRange.to, 'pdf'));
  }
}
