"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLoading } from "./context/LoadingContext";
import { signIn } from "next-auth/react"; // <-- IMPORT BARU

export const AuthDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { setIsLoading } = useLoading();

  // --- FUNGSI INI DIUBAH TOTAL ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsLoading(true);

    const form = e.currentTarget;
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;

    if (!email || !password) {
      toast.error("Email and password are required!");
      setIsSubmitting(false);
      setIsLoading(false);
      return;
    }

    try {
      // Gunakan signIn dari next-auth, bukan axios
      const result = await signIn("credentials", {
        redirect: false, // Penting! Agar tidak redirect otomatis
        email: email,
        password: password,
      });

      if (result?.ok) {
        toast.success("Sign In successful!");
        setOpen(false);
        // Refresh halaman agar sesi baru terbaca oleh server & middleware
        router.refresh(); 
      } else {
        // Tampilkan pesan error dari Next-Auth jika login gagal
        toast.error(result?.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2">
              Password
            </Label>
            <Input id="password" type="password" placeholder="••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};