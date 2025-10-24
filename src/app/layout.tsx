import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aplikasi Riwayat Peralatan Genset",
  description: "Aplikasi manajemen riwayat peralatan genset dengan fitur import/export Excel",
  keywords: ["genset", "riwayat", "maintenance", "Excel", "import", "export"],
  authors: [{ name: "Genset Management Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Aplikasi Riwayat Peralatan Genset",
    description: "Manajemen riwayat peralatan genset yang lengkap dan mudah digunakan",
    url: "https://chat.z.ai",
    siteName: "Genset Management",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aplikasi Riwayat Peralatan Genset",
    description: "Manajemen riwayat peralatan genset yang lengkap dan mudah digunakan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
