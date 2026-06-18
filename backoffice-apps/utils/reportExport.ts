import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { CompanyData, getCompanyImageSrc } from "@/lib/auth";
import { ReportPeriod, ReportRow } from "@/lib/report";

export interface ReportExportMeta {
  activeTab: string;
  period: ReportPeriod;
  generatedAt?: Date;
  totals?: {
    rows: number;
    amount: number;
  };
  financials?: {
    gross: number;
    capital?: number;
    expenses: number;
    net: number;
  };
  expenseBreakdown?: Array<{
    name: string;
    amount: number;
    percentage?: number;
  }>;
  expenseRows?: Array<{
    code: string;
    name: string;
    category: string;
    amount: number;
    date: string;
    description: string;
  }>;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const ensurePageSpace = (
  doc: jsPDF,
  currentY: number,
  requiredHeight: number,
  left: number,
  right: number,
  title?: string,
) => {
  const pageHeight = doc.internal.pageSize.height;
  const availableBottom = pageHeight - 18;

  if (currentY + requiredHeight <= availableBottom) {
    return currentY;
  }

  doc.addPage();

  if (title) {
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(title, doc.internal.pageSize.width / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
  }

  return 28;
};

const drawSectionHeading = (
  doc: jsPDF,
  title: string,
  y: number,
  left: number,
  right: number,
  accent: [number, number, number] = [35, 45, 70],
) => {
  doc.setFillColor(...accent);
  doc.roundedRect(left, y - 5, 3, 8, 1, 1, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  const titleX = left + 7;
  doc.text(title, titleX, y);
  const titleWidth = doc.getTextWidth(title);
  doc.setDrawColor(218, 223, 232);
  doc.setLineWidth(0.25);
  doc.line(titleX + titleWidth + 4, y - 1.3, right, y - 1.3);
};

const drawSummaryCard = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  valueColor: [number, number, number] = [20, 20, 20],
) => {
  doc.setFillColor(250, 251, 253);
  doc.roundedRect(x, y, width, 24, 2, 2, "F");
  doc.setDrawColor(217, 222, 230);
  doc.roundedRect(x, y, width, 24, 2, 2, "S");
  doc.setFont("times", "bold");
  doc.setFontSize(8);
  doc.setTextColor(97, 104, 116);
  doc.text(label.toUpperCase(), x + 4, y + 8);
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...valueColor);
  doc.text(value, x + 4, y + 18, {
    maxWidth: width - 8,
  });
};

const formatPeriodLabel = (period: ReportPeriod) => {
  if (period === "day") return "Harian";
  if (period === "week") return "Mingguan";
  if (period === "month") return "Bulanan";
  return "Tahunan";
};

const formatTabLabel = (activeTab: string) => {
  if (activeTab === "Services Orders") return "Service Orders";
  if (activeTab === "Product Sales") return "Product Sales";
  return "Overview";
};

const sanitizeFilename = (value: string) => value.replace(/[^a-zA-Z0-9_-]+/g, "_");

const buildFilename = (extension: "pdf" | "xlsx", meta: ReportExportMeta) => {
  const generatedAt = meta.generatedAt ?? new Date();
  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  const baseName = `Report_${formatTabLabel(meta.activeTab)}_${formatPeriodLabel(meta.period)}_${datePart}`;

  return `${sanitizeFilename(baseName)}.${extension}`;
};

const buildCompanyTitle = (company?: CompanyData | null) => {
  const name = company?.name?.trim();
  if (!name) return "PT Shoes Care";
  return /^pt\b/i.test(name) ? name : `PT ${name}`;
};

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const manualToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  const finalToken =
    token && token !== "undefined" && token !== "null" ? token : manualToken;

  return finalToken
    ? {
        Authorization: `Bearer ${finalToken}`,
        Accept: "application/json",
      }
    : {
        Accept: "application/json",
      };
};

const loadImageAsDataUrl = async (src?: string) => {
  try {
    const query = src ? `?src=${encodeURIComponent(src)}` : "";
    const response = await fetch(`/api/company-logo${query}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      if (response.status === 400) return null;
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Company logo could not be loaded for PDF export.", error);
    return null;
  }
};

const loadImageUrlAsDataUrl = async (src: string) => {
  try {
    const response = await fetch(src, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) return null;
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Company image URL could not be loaded for PDF export.", error);
    return null;
  }
};

const loadCompanyImageAsDataUrl = async (company: CompanyData | null) => {
  const companyImageSrc = getCompanyImageSrc(company);

  if (companyImageSrc && !companyImageSrc.startsWith("data:")) {
    const optimizedSrc = `/_next/image?url=${encodeURIComponent(companyImageSrc)}&w=256&q=75`;
    const optimizedImage = await loadImageUrlAsDataUrl(optimizedSrc);
    if (optimizedImage) return optimizedImage;
  }

  const directFromCompany = await loadImageAsDataUrl();
  if (directFromCompany) return directFromCompany;

  const candidates = [company?.logo, company?.photo].filter(
    (value, index, array): value is string =>
      Boolean(value) && array.indexOf(value) === index,
  );

  for (const candidate of candidates) {
    const image = await loadImageAsDataUrl(candidate);
    if (image) return image;
  }

  return null;
};

export async function exportReportToPdf(
  rows: ReportRow[],
  company: CompanyData | null,
  meta: ReportExportMeta,
) {
  const generatedAt = meta.generatedAt ?? new Date();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = `Laporan ${formatTabLabel(meta.activeTab)}`;
  const totalRows = meta.totals?.rows ?? rows.length;
  const totalAmount = meta.totals?.amount ?? rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const grossAmount = meta.financials?.gross ?? totalAmount;
  const capitalAmount = meta.financials?.capital ?? 0;
  const totalExpenses = meta.financials?.expenses ?? 0;
  const netAmount = meta.financials?.net ?? grossAmount - capitalAmount - totalExpenses;
  const expenseRows = meta.expenseRows || [];
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const headerBottom = 47;
  const metaTop = 56;
  const summaryTop = 98;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
  doc.setFillColor(35, 45, 70);
  doc.rect(8, 8, pageWidth - 16, 6, "F");

  if (logoDataUrl) {
    doc.setDrawColor(160, 170, 185);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
    doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
  } else {
    doc.setDrawColor(160, 170, 185);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.35);
    doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(35, 45, 70);
    doc.text(companyInitials, left + 12, 29, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text("COMPANY", left + 12, 34, { align: "center" });
  }

  doc.setTextColor(20, 20, 20);
  doc.setFont("times", "bold");
  doc.setFontSize(19);
  doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(72, 72, 72);
  doc.text(company?.address || "-", pageWidth / 2, 29, {
    align: "center",
    maxWidth: 120,
  });
  doc.setFontSize(9.5);
  doc.setTextColor(85, 85, 85);
  doc.text(
    `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
    pageWidth / 2,
    36,
    {
      align: "center",
      maxWidth: 138,
    },
  );

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(left, headerBottom, right, headerBottom);
  doc.setLineWidth(0.2);
  doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
    align: "center",
  });
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(95, 95, 95);
  doc.text(`Periode ${formatPeriodLabel(meta.period)}`, pageWidth / 2, metaTop + 5, {
    align: "center",
  });

  doc.setTextColor(20, 20, 20);
  doc.setDrawColor(214, 220, 229);
  doc.setFillColor(250, 251, 253);
  doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
  doc.line(118, metaTop + 10, 118, metaTop + 36);

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Informasi Laporan", left + 4, metaTop + 16);
  doc.text("Waktu Cetak", 122, metaTop + 16);

  drawInfoRow("Kategori", formatTabLabel(meta.activeTab), left + 4, metaTop + 24, left + 30);
  drawInfoRow("Periode", formatPeriodLabel(meta.period), left + 4, metaTop + 31, left + 30);
  drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
  drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

  drawSectionHeading(doc, "Rekapitulasi Hasil Bersih", summaryTop, left, right);

  const summaryItems = [
    { label: "Kategori", value: formatTabLabel(meta.activeTab), color: [20, 20, 20] as [number, number, number] },
    { label: "Jumlah Data", value: String(totalRows), color: [20, 20, 20] as [number, number, number] },
    { label: "Total Pemasukan", value: formatRupiah(grossAmount), color: [28, 99, 62] as [number, number, number] },
    { label: "Total Modal", value: formatRupiah(capitalAmount), color: [146, 64, 14] as [number, number, number] },
    { label: "Total Pengeluaran", value: formatRupiah(totalExpenses), color: [127, 29, 29] as [number, number, number] },
  ];
  const topRowWidth = (contentWidth - 8) / 3;
  const bottomRowWidth = (contentWidth - 4) / 2;

  drawSummaryCard(doc, left, summaryTop + 6, topRowWidth, summaryItems[0].label, summaryItems[0].value, summaryItems[0].color);
  drawSummaryCard(doc, left + topRowWidth + 4, summaryTop + 6, topRowWidth, summaryItems[1].label, summaryItems[1].value, summaryItems[1].color);
  drawSummaryCard(doc, left + (topRowWidth + 4) * 2, summaryTop + 6, topRowWidth, summaryItems[2].label, summaryItems[2].value, summaryItems[2].color);
  drawSummaryCard(doc, left, summaryTop + 34, bottomRowWidth, summaryItems[3].label, summaryItems[3].value, summaryItems[3].color);
  drawSummaryCard(doc, left + bottomRowWidth + 4, summaryTop + 34, bottomRowWidth, summaryItems[4].label, summaryItems[4].value, summaryItems[4].color);

  doc.setFillColor(240, 248, 242);
  doc.roundedRect(left, summaryTop + 63, contentWidth, 18, 2, 2, "F");
  doc.setDrawColor(187, 210, 190);
  doc.roundedRect(left, summaryTop + 63, contentWidth, 18, 2, 2, "S");
  doc.setFillColor(64, 114, 76);
  doc.roundedRect(left + 3, summaryTop + 66, 2.5, 10, 1, 1, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(65, 85, 65);
  doc.text("HASIL BERSIH", left + 9, summaryTop + 71);
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(formatRupiah(netAmount), right - 4, summaryTop + 72, {
    align: "right",
  });

  const expenseSectionTop = summaryTop + 89;
  if (meta.expenseBreakdown && meta.expenseBreakdown.length > 0) {
    const safeExpenseTop = ensurePageSpace(
      doc,
      expenseSectionTop,
      36,
      left,
      right,
      reportTitle.toUpperCase(),
    );
    drawSectionHeading(doc, "Ringkasan Pengeluaran", safeExpenseTop, left, right, [127, 29, 29]);
    autoTable(doc, {
      startY: safeExpenseTop + 6,
      head: [["Kategori Expense", "Jumlah", "Persentase"]],
      body: meta.expenseBreakdown.map((item) => [
        item.name,
        formatRupiah(item.amount),
        item.percentage !== undefined ? `${item.percentage}%` : "-",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [252, 245, 245],
        textColor: [93, 30, 30],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [55, 65, 81],
      },
      alternateRowStyles: {
        fillColor: [254, 251, 251],
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        font: "times",
      },
      columnStyles: {
        0: { cellWidth: 86 },
        1: { cellWidth: 48, halign: "right" },
        2: { cellWidth: 38, halign: "center" },
      },
      margin: { left, right },
    });
  }

  let currentSectionY = meta.expenseBreakdown && meta.expenseBreakdown.length > 0
    ? Math.max(
        (((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY) || expenseSectionTop) + 10,
        172,
      )
    : 156;

  if (expenseRows.length > 0) {
    currentSectionY = ensurePageSpace(
      doc,
      currentSectionY,
      50,
      left,
      right,
      reportTitle.toUpperCase(),
    );

    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    drawSectionHeading(doc, "Laporan Pengeluaran", currentSectionY, left, right, [127, 29, 29]);

    autoTable(doc, {
      startY: currentSectionY + 6,
      head: [["Kode", "Tanggal", "Nama Pengeluaran", "Kategori", "Keterangan", "Jumlah"]],
      body: expenseRows.map((item) => [
        item.code,
        item.date,
        item.name,
        item.category,
        item.description,
        formatRupiah(item.amount),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [107, 33, 33],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [55, 65, 81],
        valign: "middle",
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [253, 249, 249],
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.8,
        overflow: "linebreak",
        font: "times",
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 24 },
        2: { cellWidth: 34 },
        3: { cellWidth: 24 },
        4: { cellWidth: 46 },
        5: { cellWidth: 22, halign: "right" },
      },
      margin: { left, right },
    });

    currentSectionY =
      (((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY) || currentSectionY) + 10;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  currentSectionY = ensurePageSpace(
    doc,
    currentSectionY,
    50,
    left,
    right,
      reportTitle.toUpperCase(),
  );
  drawSectionHeading(doc, "Laporan Pemasukan", currentSectionY, left, right, [35, 45, 70]);

  autoTable(doc, {
    startY: currentSectionY + 6,
    head: [["No", "Order ID", "Customer", "Ringkasan", "Status", "Pemasukan"]],
    body: rows.map((item, index) => [
      index + 1,
      item.order_id || "-",
      item.customer || "-",
      item.summary || "-",
      item.status || "-",
      formatRupiah(Number(item.total || 0)),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
      styles: {
        fontSize: 8.5,
        cellPadding: 3.1,
        overflow: "linebreak",
        font: "times",
      },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 30 },
      2: { cellWidth: 38 },
      3: { cellWidth: 55 },
      4: { cellWidth: 24, halign: "center" },
      5: { cellWidth: 26, halign: "right" },
    },
    margin: { top: currentSectionY + 5, left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
        doc.setDrawColor(180, 180, 180);
        doc.line(left, 20, right, 20);
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  doc.save(buildFilename("pdf", meta));
}

export function exportReportToExcel(
  rows: ReportRow[],
  company: CompanyData | null,
  meta: ReportExportMeta,
) {
  const generatedAt = meta.generatedAt ?? new Date();
  const totalRows = meta.totals?.rows ?? rows.length;
  const totalAmount = meta.totals?.amount ?? rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = `Laporan ${formatTabLabel(meta.activeTab)}`;

  const sheetData = [
    [companyTitle],
    [company?.address || "-"],
    [`Telp: ${company?.phone || "-"} | Email: ${company?.email || "-"}`],
    [],
    [reportTitle],
    [`Periode: ${formatPeriodLabel(meta.period)}`],
    [`Tanggal Cetak: ${formatDateTime(generatedAt)}`],
    [`Jumlah Data: ${totalRows}`],
    [`Total Nilai: ${formatRupiah(totalAmount)}`],
    [],
    ["No", "Order ID", "Customer", "Ringkasan", "Status", "Tipe", "Total"],
    ...rows.map((item, index) => [
      index + 1,
      item.order_id || "-",
      item.customer || "-",
      item.summary || "-",
      item.status || "-",
      item.type || "-",
      Number(item.total || 0),
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 6 } },
  ];
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 24 },
    { wch: 42 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
  ];
  worksheet["!autofilter"] = { ref: `A11:G${rows.length + 11}` };

  rows.forEach((_, index) => {
    const totalCellRef = XLSX.utils.encode_cell({ r: index + 11, c: 6 });
    if (worksheet[totalCellRef]) {
      worksheet[totalCellRef].t = "n";
      worksheet[totalCellRef].z = '"Rp"#,##0';
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
  XLSX.writeFile(workbook, buildFilename("xlsx", meta));
}

// ===================== EXPORT SERVICES TO PDF =====================

export interface ServiceExportData {
  id: number;
  name: string;
  code: string;
  price: number;
  discount?: number;
  category?: {
    name: string;
  } | null;
}

export async function exportServicesToPDF(
  services: ServiceExportData[],
  company: CompanyData | null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = "Laporan Daftar Layanan";
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const headerBottom = 47;
  const metaTop = 56;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  const drawServicesPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
      doc.setFillColor(35, 45, 70);
      doc.rect(8, 8, pageWidth - 16, 6, "F");

      if (logoDataUrl) {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
      } else {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(35, 45, 70);
        doc.text(companyInitials, left + 12, 29, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text("COMPANY", left + 12, 34, { align: "center" });
      }

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(72, 72, 72);
      doc.text(company?.address || "-", pageWidth / 2, 29, {
        align: "center",
        maxWidth: 120,
      });
      doc.setFontSize(9.5);
      doc.setTextColor(85, 85, 85);
      doc.text(
        `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
        pageWidth / 2,
        36,
        {
          align: "center",
          maxWidth: 138,
        },
      );

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(left, headerBottom, right, headerBottom);
      doc.setLineWidth(0.2);
      doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
        align: "center",
      });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 95, 95);
      doc.text("Master data layanan aktif", pageWidth / 2, metaTop + 5, {
        align: "center",
      });

      doc.setTextColor(20, 20, 20);
      doc.setDrawColor(214, 220, 229);
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
      doc.line(118, metaTop + 10, 118, metaTop + 36);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("Informasi Laporan", left + 4, metaTop + 16);
      doc.text("Waktu Cetak", 122, metaTop + 16);

      drawInfoRow("Dokumen", "Daftar Layanan", left + 4, metaTop + 24, left + 30);
      drawInfoRow("Kategori", "Master Layanan", left + 4, metaTop + 31, left + 30);
      drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
      drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

      drawSectionHeading(doc, "Data Layanan", 98, left, right, [35, 45, 70]);
      return 104;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
    return 26;
  };

  const tableStartY = drawServicesPageHeader(true);

  doc.setFont("times", "normal");
  const tableData = services.map((service, index) => {
    return [
      index + 1,
      service.code,
      service.name,
      service.category?.name || "Uncategorized",
      service.discount && service.discount > 0 ? `${service.discount}%` : "-",
      formatRupiah(service.price),
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [["No", "Kode", "Nama Layanan", "Kategori", "Diskon", "Harga"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      font: "times",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 24, halign: "center" },
      2: { cellWidth: 55 },
      3: { cellWidth: 42, halign: "center" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 33, halign: "right" },
    },
    margin: { left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawServicesPageHeader(false);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  // Save
  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  doc.save(`Daftar_Layanan_${datePart}.pdf`);
}

export async function exportServicesToExcel(
  services: ServiceExportData[],
  company: CompanyData | null,
) {
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const totalOriginal = services.reduce((sum, s) => sum + s.price, 0);
  const totalFinal = services.reduce((sum, s) => {
    const finalPrice = s.discount && s.discount > 0
      ? s.price - (s.price * s.discount) / 100
      : s.price;
    return sum + finalPrice;
  }, 0);

  const sheetData = [
    [companyTitle],
    [company?.address || "-"],
    [`Telp: ${company?.phone || "-"} | Email: ${company?.email || "-"}`],
    [],
    ["DAFTAR LAYANAN"],
    [`Tanggal Cetak: ${formatDateTime(generatedAt)}`],
    [`Total Data: ${services.length} layanan`],
    [],
    ["No", "Kode", "Nama Layanan", "Kategori", "Diskon", "Harga Awal", "Harga Akhir"],
    ...services.map((service, index) => {
      const finalPrice = service.discount && service.discount > 0
        ? service.price - (service.price * service.discount) / 100
        : service.price;

      return [
        index + 1,
        service.code,
        service.name,
        service.category?.name || "Uncategorized",
        service.discount && service.discount > 0 ? `${service.discount}%` : "-",
        service.price,
        service.discount && service.discount > 0 ? finalPrice : "-",
      ];
    }),
    ["", "", "", "", "TOTAL", totalOriginal, totalFinal],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
  ];
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
  ];
  worksheet["!autofilter"] = { ref: `A9:G${services.length + 9}` };

  // Format currency
  services.forEach((_, index) => {
    const priceCellRef = XLSX.utils.encode_cell({ r: index + 9, c: 5 });
    if (worksheet[priceCellRef]) {
      worksheet[priceCellRef].t = "n";
      worksheet[priceCellRef].z = '"Rp"#,##0';
    }
    const finalPriceCellRef = XLSX.utils.encode_cell({ r: index + 9, c: 6 });
    if (worksheet[finalPriceCellRef] && worksheet[finalPriceCellRef].t !== "s") {
      worksheet[finalPriceCellRef].t = "n";
      worksheet[finalPriceCellRef].z = '"Rp"#,##0';
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Layanan");
  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  XLSX.writeFile(workbook, `Daftar_Layanan_${datePart}.xlsx`);
}

export interface ProductExportData {
  id: string | number;
  name: string;
  code: string;
  price?: number;
  selling_price?: number;
  discount?: number;
  stock?: number;
  category?: {
    name: string;
  } | null;
}

export async function exportProductsToPDF(
  products: ProductExportData[],
  company: CompanyData | null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = "Laporan Daftar Produk";
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const headerBottom = 47;
  const metaTop = 56;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  const drawProductsPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
      doc.setFillColor(35, 45, 70);
      doc.rect(8, 8, pageWidth - 16, 6, "F");

      if (logoDataUrl) {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
      } else {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(35, 45, 70);
        doc.text(companyInitials, left + 12, 29, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text("COMPANY", left + 12, 34, { align: "center" });
      }

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(72, 72, 72);
      doc.text(company?.address || "-", pageWidth / 2, 29, {
        align: "center",
        maxWidth: 120,
      });
      doc.setFontSize(9.5);
      doc.setTextColor(85, 85, 85);
      doc.text(
        `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
        pageWidth / 2,
        36,
        {
          align: "center",
          maxWidth: 138,
        },
      );

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(left, headerBottom, right, headerBottom);
      doc.setLineWidth(0.2);
      doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
        align: "center",
      });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 95, 95);
      doc.text("Master data produk aktif", pageWidth / 2, metaTop + 5, {
        align: "center",
      });

      doc.setTextColor(20, 20, 20);
      doc.setDrawColor(214, 220, 229);
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
      doc.line(118, metaTop + 10, 118, metaTop + 36);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("Informasi Laporan", left + 4, metaTop + 16);
      doc.text("Waktu Cetak", 122, metaTop + 16);

      drawInfoRow("Dokumen", "Daftar Produk", left + 4, metaTop + 24, left + 30);
      drawInfoRow("Kategori", "Master Produk", left + 4, metaTop + 31, left + 30);
      drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
      drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

      drawSectionHeading(doc, "Data Produk", 98, left, right, [35, 45, 70]);
      return 104;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
    return 26;
  };

  const tableStartY = drawProductsPageHeader(true);

  const tableData = products.map((product, index) => [
    index + 1,
    product.code || "-",
    product.name || "-",
    product.category?.name || "Uncategorized",
    Number(product.stock || 0),
    product.discount && product.discount > 0 ? `${product.discount}%` : "-",
    formatRupiah(Number(product.selling_price || product.price || 0)),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["No", "Kode", "Nama Produk", "Kategori", "Stok", "Diskon", "Harga"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      font: "times",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 49 },
      3: { cellWidth: 33, halign: "center" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 30, halign: "right" },
    },
    margin: { left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawProductsPageHeader(false);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  doc.save(`Daftar_Produk_${datePart}.pdf`);
}

export interface CustomerExportData {
  id: string | number;
  name?: string;
  phone?: string;
  address?: string;
}

export async function exportCustomersToPDF(
  customers: CustomerExportData[],
  company: CompanyData | null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = "Laporan Daftar Customer";
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const headerBottom = 47;
  const metaTop = 56;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  const drawCustomersPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
      doc.setFillColor(35, 45, 70);
      doc.rect(8, 8, pageWidth - 16, 6, "F");

      if (logoDataUrl) {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
      } else {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(35, 45, 70);
        doc.text(companyInitials, left + 12, 29, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text("COMPANY", left + 12, 34, { align: "center" });
      }

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(72, 72, 72);
      doc.text(company?.address || "-", pageWidth / 2, 29, {
        align: "center",
        maxWidth: 120,
      });
      doc.setFontSize(9.5);
      doc.setTextColor(85, 85, 85);
      doc.text(
        `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
        pageWidth / 2,
        36,
        {
          align: "center",
          maxWidth: 138,
        },
      );

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(left, headerBottom, right, headerBottom);
      doc.setLineWidth(0.2);
      doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
        align: "center",
      });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 95, 95);
      doc.text("Master data customer aktif", pageWidth / 2, metaTop + 5, {
        align: "center",
      });

      doc.setTextColor(20, 20, 20);
      doc.setDrawColor(214, 220, 229);
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
      doc.line(118, metaTop + 10, 118, metaTop + 36);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("Informasi Laporan", left + 4, metaTop + 16);
      doc.text("Waktu Cetak", 122, metaTop + 16);

      drawInfoRow("Dokumen", "Daftar Customer", left + 4, metaTop + 24, left + 30);
      drawInfoRow("Kategori", "Master Customer", left + 4, metaTop + 31, left + 30);
      drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
      drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

      drawSectionHeading(doc, "Data Customer", 98, left, right, [35, 45, 70]);
      return 104;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
    return 26;
  };

  const tableStartY = drawCustomersPageHeader(true);
  const tableData = customers.map((customer, index) => [
    index + 1,
    customer.name || "-",
    customer.phone || "-",
    customer.address || "-",
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["No", "Nama", "No HP", "Alamat"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      font: "times",
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 46 },
      2: { cellWidth: 42, halign: "center" },
      3: { cellWidth: 84 },
    },
    margin: { left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawCustomersPageHeader(false);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  doc.save(`Daftar_Customer_${datePart}.pdf`);
}

export interface EmployeeExportData {
  id: string | number;
  nik?: string;
  name?: string;
  email?: string;
}

export async function exportEmployeesToPDF(
  employees: EmployeeExportData[],
  company: CompanyData | null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = "Laporan Daftar Employee";
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const headerBottom = 47;
  const metaTop = 56;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  const drawEmployeesPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
      doc.setFillColor(35, 45, 70);
      doc.rect(8, 8, pageWidth - 16, 6, "F");

      if (logoDataUrl) {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
      } else {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(35, 45, 70);
        doc.text(companyInitials, left + 12, 29, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text("COMPANY", left + 12, 34, { align: "center" });
      }

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(72, 72, 72);
      doc.text(company?.address || "-", pageWidth / 2, 29, {
        align: "center",
        maxWidth: 120,
      });
      doc.setFontSize(9.5);
      doc.setTextColor(85, 85, 85);
      doc.text(
        `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
        pageWidth / 2,
        36,
        {
          align: "center",
          maxWidth: 138,
        },
      );

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(left, headerBottom, right, headerBottom);
      doc.setLineWidth(0.2);
      doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
        align: "center",
      });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 95, 95);
      doc.text("Master data employee aktif", pageWidth / 2, metaTop + 5, {
        align: "center",
      });

      doc.setTextColor(20, 20, 20);
      doc.setDrawColor(214, 220, 229);
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
      doc.line(118, metaTop + 10, 118, metaTop + 36);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("Informasi Laporan", left + 4, metaTop + 16);
      doc.text("Waktu Cetak", 122, metaTop + 16);

      drawInfoRow("Dokumen", "Daftar Employee", left + 4, metaTop + 24, left + 30);
      drawInfoRow("Kategori", "Master Employee", left + 4, metaTop + 31, left + 30);
      drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
      drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

      drawSectionHeading(doc, "Data Employee", 98, left, right, [35, 45, 70]);
      return 104;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
    return 26;
  };

  const tableStartY = drawEmployeesPageHeader(true);
  const tableData = employees.map((employee, index) => [
    index + 1,
    employee.nik || "-",
    employee.name || "-",
    employee.email || "-",
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["No", "NIK", "Nama", "Email"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      font: "times",
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 58 },
      3: { cellWidth: 74 },
    },
    margin: { left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawEmployeesPageHeader(false);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  doc.save(`Daftar_Employee_${datePart}.pdf`);
}

export interface ExpenseExportData {
  id: string | number;
  code?: string;
  name?: string;
  amount?: number | string;
  date?: string;
  description?: string;
  category?: {
    name?: string;
  } | null;
}

export async function exportExpensesToPDF(
  expenses: ExpenseExportData[],
  company: CompanyData | null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;
  const generatedAt = new Date();
  const companyTitle = buildCompanyTitle(company);
  const reportTitle = "Laporan Daftar Pengeluaran";
  const logoDataUrl = await loadCompanyImageAsDataUrl(company);
  const logoFormat = logoDataUrl?.includes("image/png") ? "PNG" : "JPEG";
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(generatedAt);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(generatedAt);
  const headerBottom = 47;
  const metaTop = 56;
  const companyInitials = companyTitle
    .replace(/^PT\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SC";

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    valueX: number,
  ) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(label, x, y);
    doc.text(":", valueX - 4, y);
    doc.text(value, valueX, y, { maxWidth: 48 });
  };

  const drawExpensesPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");
      doc.setFillColor(35, 45, 70);
      doc.rect(8, 8, pageWidth - 16, 6, "F");

      if (logoDataUrl) {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.addImage(logoDataUrl, logoFormat, left + 1.5, 17.5, 21, 21);
      } else {
        doc.setDrawColor(160, 170, 185);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.35);
        doc.roundedRect(left, 16, 24, 24, 2, 2, "FD");
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(35, 45, 70);
        doc.text(companyInitials, left + 12, 29, { align: "center" });
        doc.setFont("times", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        doc.text("COMPANY", left + 12, 34, { align: "center" });
      }

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(19);
      doc.text(companyTitle.toUpperCase(), pageWidth / 2, 22, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(72, 72, 72);
      doc.text(company?.address || "-", pageWidth / 2, 29, {
        align: "center",
        maxWidth: 120,
      });
      doc.setFontSize(9.5);
      doc.setTextColor(85, 85, 85);
      doc.text(
        `Email: ${company?.email || "-"}   |   Telp: ${company?.phone || "-"}   |   Timezone: ${company?.timezone || "Asia/Jakarta"}`,
        pageWidth / 2,
        36,
        {
          align: "center",
          maxWidth: 138,
        },
      );

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(left, headerBottom, right, headerBottom);
      doc.setLineWidth(0.2);
      doc.line(left, headerBottom + 1.2, right, headerBottom + 1.2);

      doc.setFont("times", "bold");
      doc.setFontSize(15);
      doc.setTextColor(20, 20, 20);
      doc.text(reportTitle.toUpperCase(), pageWidth / 2, metaTop, {
        align: "center",
      });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(95, 95, 95);
      doc.text("Master data pengeluaran aktif", pageWidth / 2, metaTop + 5, {
        align: "center",
      });

      doc.setTextColor(20, 20, 20);
      doc.setDrawColor(214, 220, 229);
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(left, metaTop + 10, contentWidth, 26, 2, 2, "FD");
      doc.line(118, metaTop + 10, 118, metaTop + 36);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("Informasi Laporan", left + 4, metaTop + 16);
      doc.text("Waktu Cetak", 122, metaTop + 16);

      drawInfoRow("Dokumen", "Daftar Pengeluaran", left + 4, metaTop + 24, left + 30);
      drawInfoRow("Kategori", "Master Expense", left + 4, metaTop + 31, left + 30);
      drawInfoRow("Tanggal", dateLabel, 122, metaTop + 24, 144);
      drawInfoRow("Jam", `${timeLabel} WIB`, 122, metaTop + 31, 144);

      drawSectionHeading(doc, "Data Pengeluaran", 98, left, right, [35, 45, 70]);
      return 104;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(reportTitle.toUpperCase(), pageWidth / 2, 16, { align: "center" });
    doc.setDrawColor(180, 180, 180);
    doc.line(left, 20, right, 20);
    return 26;
  };

  const tableStartY = drawExpensesPageHeader(true);
  const tableData = expenses.map((expense, index) => [
    index + 1,
    expense.code || `EXP-${expense.id}`,
    expense.name || "-",
    expense.category?.name || "General",
    expense.date || "-",
    formatRupiah(Number(expense.amount || 0)),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["No", "Kode", "Nama Pengeluaran", "Kategori", "Tanggal", "Jumlah"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [35, 45, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      font: "times",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 24, halign: "center" },
      2: { cellWidth: 48 },
      3: { cellWidth: 34, halign: "center" },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 34, halign: "right" },
    },
    margin: { left, right, bottom: 18 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawExpensesPageHeader(false);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(left, pageHeight - 10, right, pageHeight - 10);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Dicetak pada ${formatDateTime(generatedAt)}`,
        left,
        pageHeight - 5,
      );
      doc.text(`Halaman ${data.pageNumber}`, pageWidth - 28, pageHeight - 5);
    },
  });

  const datePart = `${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}${String(generatedAt.getDate()).padStart(2, "0")}`;
  doc.save(`Daftar_Pengeluaran_${datePart}.pdf`);
}
