// utils/exportToExcel.ts
import XLSX from "xlsx";

export function exportToExcel<T extends object>(data: T[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Convert JSON array ke worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Pastikan nama file ada extension .xlsx
  const safeFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;

  // Download file Excel
  XLSX.writeFile(workbook, safeFilename);
}
