"use client";

import Link from "next/link";
import * as React from "react";
import { useSession } from "next-auth/react"; // <-- 1. Ganti localStorage dengan useSession
import {
  IconCertificate2,
  IconDashboard,
  IconDatabase,
  IconNews,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { FileText, FormInput, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton untuk loading

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 2. Ambil data sesi dan statusnya
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  // 3. Definisikan semua kemungkinan menu
  const allNavMain = [
    {
      title: "Dashboard",
      url: "/overview",
      icon: IconDashboard as any,
      roles: ['admin'], // Hanya untuk admin
    },
    {
      title: "Form Pendaftaran",
      url: "/registration",
      icon: FormInput as any,
      roles: ['admin'], // Hanya untuk admin
    },
    {
      title: "Surat Tugas",
      url: "/surat",
      icon: UserPlus as any,
      roles: ['admin'], // Hanya untuk admin
    },
    {
      title: "Surat Tugas Pengujian",
      url: "/pengujian",
      icon: FileText as any,
      roles: ['admin'], // Hanya untuk admin
    },
    {
      title: "Berita Acara",
      url: "/berita",
      icon: IconNews as any,
      roles: ['admin'], // Hanya untuk admin
    },
  ];

  const allDocuments = [
    {
      name: "Data Library",
      url: "/library",
      icon: IconDatabase as any,
      roles: ['admin', 'analyst'], // Untuk admin dan analyst
    },
    {
      name: "Certificates Of Analysys",
      url: "/coa",
      icon: IconCertificate2 as any,
      roles: ['admin', 'analyst'], // Untuk admin dan analyst
    },
  ];
  
  // 4. Filter menu berdasarkan role user yang sedang login
  const navMain = allNavMain.filter(item => item.roles.includes(userRole as string));
  const documents = allDocuments.filter(item => item.roles.includes(userRole as string));

  // 5. Siapkan data user dari sesi
  const user = {
    name: session?.user?.name || "Loading...",
    email: session?.user?.email || "",
    avatar: "/images/avatars/user.png",
  };

  // 6. Tampilkan loading skeleton jika sesi masih dimuat
  if (status === "loading") {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader><Skeleton className="h-10 w-32" /></SidebarHeader>
        <SidebarContent className="flex flex-col gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </SidebarContent>
        <SidebarFooter><Skeleton className="h-12 w-full" /></SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={userRole === 'admin' ? '/overview' : '/dashboard'}>
                <Image
                  src="/images/logo-delta.png"
                  alt="Logo Delta"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-18 h-auto"
                  priority
                />
              </Link>
            </SidebarMenuButton>
            <div className="my-2 border-t border-border" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 7. Tampilkan menu yang sudah difilter */}
        {navMain.length > 0 && <NavMain items={navMain} />}
        {navMain.length > 0 && documents.length > 0 && <div className="my-2 border-t border-border" />}
        {documents.length > 0 && <NavDocuments items={documents} />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}