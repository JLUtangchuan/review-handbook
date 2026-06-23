import type { Metadata, Viewport } from "next";
import NavBar from "@/components/NavBar";
import AdminPanel from "@/components/AdminPanel";
import { WeightProvider } from "@/components/WeightContext";
import { ReviewProvider } from "@/components/ReviewContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "复习手册 — 具身智能面试准备",
  description: "100天系统化算法岗面试准备，从机器人学到VLA模型",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <ReviewProvider>
          <WeightProvider>
            <NavBar />
            <main className="flex-1 md:ml-56 pb-20 md:pb-0 safe-bottom">
              {children}
            </main>
            <AdminPanel />
          </WeightProvider>
        </ReviewProvider>
      </body>
    </html>
  );
}
