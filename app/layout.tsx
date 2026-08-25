import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { basePath } from "@/lib/site";

// Deliberately using a system font stack (see globals.css) instead of
// next/font/google: it renders Thai text well on every platform out of the
// box (Leelawadee UI / Noto Sans Thai / PingFang / etc.) without depending
// on network access to fonts.googleapis.com at build time — important for
// CI and sandboxed environments with restricted egress. Swap in next/font
// if you want a specific custom typeface.

export const metadata: Metadata = {
  title: "Smart Palm Farm | บริหารจัดการสวนปาล์ม",
  description: "แอปบันทึกและบริหารจัดการสวนปาล์มน้ำมันสำหรับเกษตรกร",
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: [
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Palm Farm",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full">
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-800 antialiased">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="flex-1 pb-4">{children}</div>
          <div className="sticky bottom-0">
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
