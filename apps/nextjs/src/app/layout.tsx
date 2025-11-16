import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "Employee Database System",
  description:
    "パート従業員向けの従業員情報、勤務条件、契約、支払データを一元管理するMVP UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSans.variable} gradient-animation`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}