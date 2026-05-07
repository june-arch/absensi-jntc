import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbsensiKu - Sistem Absensi Digital",
  description: "Aplikasi absensi karyawan menggunakan selfie foto",
  icons: {
    icon: "/favicon.ico",
  },
  apple_web_app: {
    capable: true,
    title: "AbsensiKu",
    startup_image: [
      {
        url: "/apple-touch-icon.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  openGraph: {
    title: "AbsensiKu - Sistem Absensi Digital",
    description: "Aplikasi absensi karyawan menggunakan selfie foto",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AbsensiKu - Sistem Absensi Digital",
    description: "Aplikasi absensi karyawan menggunakan selfie foto",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}