import { ReportListClient } from "./components/ReportListClient";
import connectDB from "@/lib/db"; // Import koneksi DB
import Report from "@/models/Report"; // Ganti dengan nama model Report-mu

// Tandai halaman ini sebagai dinamis untuk memastikan data selalu baru
export const dynamic = 'force-dynamic';

export default async function DataLibraryPage() {
  let reports = [];
  let error = null;

  try {
    await connectDB();
    // Langsung query ke database
    const reportData = await Report.find({}).sort({ createdAt: -1 }).lean();
    reports = JSON.parse(JSON.stringify(reportData)); // Pastikan data serializable
  } catch (e) {
    console.error("Gagal memuat reports:", e);
    error = "Terjadi kesalahan saat mengambil data dari database.";
  }

  const result = error ? { success: false, error } : { success: true, data: reports };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Library Certificate of Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Lihat dan kelola semua laporan yang telah disimpan.
        </p>
      </div>
      <ReportListClient initialReportsResult={result} />
    </div>
  );
}