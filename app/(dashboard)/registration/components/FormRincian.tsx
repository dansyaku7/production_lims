"use client";

import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner"; // Ditambahkan untuk notifikasi error

type FormRincianProps = {
  formData: {
    nomorFpps: string;
    namaPelanggan: string;
    nomorQuotation: string;
    kegiatan: string;
    petugas: string[];
  };
  rincian: {
    id: string;
    area: string;
    matriks: string;
    parameter: string;
    regulasi: string;
    metode: string;
  }[];
  setRincian: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        area: string;
        matriks: string;
        parameter: string;
        regulasi: string;
        metode: string;
      }[]
    >
  >;
  goBack: () => void;
  onSubmit: () => void;
  onPrint: () => void;
};

export default function FormRincian({
  formData,
  rincian,
  setRincian,
  goBack,
  onSubmit,
  onPrint,
}: FormRincianProps) {

  // --- FUNGSI generateId DIHAPUS, LOGIKA PINDAH KE handleAdd ---

  // --- FUNGSI INI DIUBAH TOTAL ---
  const handleAdd = () => {
    // 1. Validasi dulu apakah nomor FPPS sudah diisi
    const baseFpps = formData.nomorFpps;
    if (!baseFpps || baseFpps.length < 9) {
      toast.error("Nomor FPPS tidak valid.", {
        description: "Harap isi Nomor FPPS dengan benar di langkah pertama.",
      });
      return;
    }

    // 2. Pecah nomor FPPS sesuai format yang kamu mau
    const datePart = baseFpps.substring(0, 6); // Ambil 6 digit pertama (e.g., 250820)
    const sequencePart = baseFpps.substring(6); // Ambil sisanya (e.g., 058)

    // 3. Tentukan indeks berikutnya agar menjadi .01, .02, dst.
    const nextIndex = (rincian.length + 1).toString().padStart(2, "0");

    // 4. Gabungkan menjadi format ID yang baru
    const newId = `${datePart}-${sequencePart}.${nextIndex}`;

    // 5. Tambahkan baris baru ke dalam state
    setRincian([
      ...rincian,
      { id: newId, area: "", matriks: "", parameter: "", regulasi: "", metode: "" },
    ]);
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = [...rincian];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setRincian(updated);
  };

  const handleDelete = (index: number) => {
    const updated = rincian.filter((_, i) => i !== index);
    // Saat menghapus, kita tidak perlu generate ulang ID yang sudah ada
    setRincian(updated);
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm px-4 py-3 rounded-md border border-muted">
          <p className="text-muted-foreground">
            No. FPPS:{" "}
            <span className="font-medium text-foreground">{`DIL-${formData.nomorFpps}`}</span>
          </p>
          <p className="text-muted-foreground">
            Pelanggan:{" "}
            <span className="font-medium text-foreground">
              {formData.namaPelanggan}
            </span>
          </p>
          <p className="text-muted-foreground">
            No. Quotation:{" "}
            <span className="font-medium text-foreground">
              {formData.nomorQuotation}
            </span>
          </p>
          <p className="text-muted-foreground">
            Kegiatan:{" "}
            <span className="font-medium text-foreground">
              {formData.kegiatan}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {rincian.map((item, index) => (
            <div
              key={index} // Menggunakan index sebagai key lebih aman di sini
              className="p-4 rounded-md border border-border space-y-4 relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-foreground">ID / Area</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={item.id}
                      readOnly
                      className="w-1/2 text-muted-foreground border border-input bg-background"
                    />
                    <Input
                      name="area"
                      value={item.area}
                      placeholder="e.g., Upwind"
                      onChange={(e) => handleChange(index, e)}
                      className="w-1/2 text-foreground border border-input bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Matriks</Label>
                  <Input
                    name="matriks"
                    value={item.matriks}
                    placeholder="e.g., UA"
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 text-foreground border border-input bg-transparent"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Metode</Label>
                  <Input
                    name="metode"
                    value={item.metode}
                    placeholder="e.g., SNI, IK"
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 text-foreground border border-input bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Parameter</Label>
                  <Textarea
                    name="parameter"
                    value={item.parameter}
                    placeholder="e.g., Debu (TSP), PM2.5..."
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 text-foreground border border-input bg-transparent"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Regulasi</Label>
                  <Textarea
                    name="regulasi"
                    value={item.regulasi}
                    placeholder="e.g., PPRI No. 22 Tahun 2021"
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 text-foreground border border-input bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleAdd}
          variant="outline"
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Tambah Area Pengujian
        </Button>
      </CardContent>

      <CardFooter className="flex justify-end px-4 py-2 gap-2">
        <Button variant="outline" onClick={goBack}>
          Kembali
        </Button>
        <Button variant="secondary" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> 
          Print
        </Button>
        <Button onClick={onSubmit}>Simpan & Buat FPPS</Button>
      </CardFooter>
    </>
  );
}