import connectDB from "@/lib/db";
import Fpps from "@/models/Fpps";
import { DataTable } from "./components/DataTable";
import { SectionCards } from "./components/SectionCards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// --- DITAMBAHKAN ---
// Ini adalah placeholder. Ganti dengan fungsi autentikasi-mu.
// Contoh menggunakan next-auth: import { getServerSession } from "next-auth";
async function getCurrentUserRole(): Promise<'admin' | 'guest'> {
  // const session = await getServerSession(authOptions);
  // if (session?.user?.role === 'admin') {
  //   return 'admin';
  // }
  // Untuk sekarang, kita anggap defaultnya admin. Ganti ini sesuai logikamu.
  return 'admin'; 
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectDB();
  
  // 1. Dapatkan role user
  const userRole = await getCurrentUserRole();

  type FppsDoc = {
    _id: any;
    nomorFpps: string;
    namaPelanggan: string;
    namaPpic: string;
    emailPpic: string;
    noTelp: string; // Pastikan ini ada di modelmu
    status?: string;
  };

  const allData = (await Fpps.find().sort({ createdAt: -1 }).lean()) as unknown as FppsDoc[];

  const totalClients = new Set(allData.map((item) => item.namaPelanggan)).size;

  const onProgressCount = allData.filter(
    (item) => item.status?.toLowerCase() !== "selesai"
  ).length;

  const finalCoaCount = allData.filter(
    (item) => item.status?.toLowerCase() === "selesai"
  ).length;

  const dataForTable = allData.map((item) => ({
    id: item._id.toString(),
    nomorFpps: item.nomorFpps,
    header: item.namaPelanggan,
    ppic: item.namaPpic,
    email: item.emailPpic,
    limit: item.noTelp, // 'limit' digunakan untuk Nomor HP di DataTable-mu
    status: item.status || "Pendaftaran",
  }));

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Tabel Pelanggan</h1>
      </div>

      <SectionCards
        totalClients={totalClients}
        onProgress={onProgressCount}
        finalCoa={finalCoaCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
          <CardDescription>
            Lihat semua pelanggan yang sedang berjalan dan yang telah selesai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 2. Kirim 'role' sebagai prop ke DataTable */}
          <DataTable data={dataForTable} role={userRole} />
        </CardContent>
      </Card>
    </main>
  );
}