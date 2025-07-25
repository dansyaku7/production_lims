"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import untuk konfirmasi hapus

// 1. Definisikan tipe data yang jelas
interface Report {
  _id: string;
  coverData?: {
    customer?: string;
    nomorFpps?: string;
  };
  status: "analisis" | "selesai";
}

interface ReportListClientProps {
  initialReportsResult: {
    success: boolean;
    data?: Report[];
    error?: string;
  };
}

const formatStatusText = (status: string) => {
  if (!status || status === "analisis") return "Analisis";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function ReportListClient({ initialReportsResult }: ReportListClientProps) {
  const [reports, setReports] = useState<Report[] | null>(null); // Diubah ke null
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const router = useRouter();

  // 2. Gunakan useEffect untuk mengisi data dengan aman
  useEffect(() => {
    if (initialReportsResult.success) {
      setReports(initialReportsResult.data || []);
    } else {
      setError(initialReportsResult.error || "Terjadi kesalahan tidak diketahui.");
    }
  }, [initialReportsResult]);

  const handleEdit = (reportId: string) => {
    router.push(`/coa?id=${reportId}`);
  };

  // 3. Pisahkan konfirmasi dan aksi hapus
  const confirmDelete = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    setLoadingId(reportToDelete);
    setIsDeleteDialogOpen(false); // Tutup dialog
    try {
      const response = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus laporan dari server.");
      }

      setReports((prevReports) =>
        prevReports ? prevReports.filter((report) => report._id !== reportToDelete) : []
      );
      toast.success("Laporan berhasil dihapus.");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoadingId(null);
      setReportToDelete(null);
    }
  };

  const handleStatusChange = async (
    reportId: string,
    newStatus: "analisis" | "selesai"
  ) => {
    setLoadingId(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Gagal mengubah status.");
      }

      setReports((prevReports) =>
        prevReports
          ? prevReports.map((report) =>
              report._id === reportId ? { ...report, status: newStatus } : report
            )
          : []
      );
      toast.success(
        `Status laporan berhasil diubah menjadi "${formatStatusText(newStatus)}"`
      );
    } catch (err: any) {
      toast.error(`Error: ${err.message}`); // Mengganti alert dengan toast
    } finally {
      setLoadingId(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 4. Tampilkan loading spinner jika data belum siap di client
  if (reports === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Laporan Tersimpan</CardTitle>
          <CardDescription>
            Total {reports.length} laporan ditemukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Customer</TableHead>
                  <TableHead>No. FPPS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell className="font-medium">
                        {report.coverData?.customer || "-"}
                      </TableCell>
                      <TableCell>{report.coverData?.nomorFpps || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.status === "selesai" ? "default" : "secondary"
                          }
                        >
                          {formatStatusText(report.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {loadingId === report._id ? (
                          <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                        ) : (
                          <>
                            {report.status !== "selesai" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(report._id, "selesai")
                                }
                              >
                                Selesai
                              </Button>
                            )}
                            {report.status === "selesai" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(report._id, "analisis")
                                }
                              >
                                Analisis
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(report._id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(report._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Belum ada laporan yang tersimpan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Tambahkan AlertDialog untuk konfirmasi hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Laporan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}