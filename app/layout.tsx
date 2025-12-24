import type { Metadata } from "next";
import "./global.css";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: "Admin HRM - Sistem Manajemen Cuti",
  description: "Dashboard manajemen sumber daya manusia sederhana untuk mengelola data admin, pegawai, dan pengajuan cuti dengan fitur CRUD lengkap.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-gray-900">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}