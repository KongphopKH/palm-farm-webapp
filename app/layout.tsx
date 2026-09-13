import type { Metadata, Viewport } from "next";
import "@fontsource/sarabun/400.css";
import "@fontsource/sarabun/500.css";
import "@fontsource/sarabun/600.css";
import "@fontsource/sarabun/700.css";
import "@fontsource/sarabun/800.css";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { basePath } from "@/lib/site";

// Sarabun via @fontsource (not next/font/google): the font files ship inside
// the npm package and get bundled at build time, so there's no runtime
// dependency on fonts.googleapis.com — important for CI and sandboxed
// environments with restricted egress (next/font/google was ruled out
// earlier for exactly that reason). System-font fallbacks stay in
// globals.css's --font-sans in case the package is ever removed.

export const metadata: Metadata = {
  title: "PalmTrack | บริหารจัดการสวนปาล์ม",
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
    title: "PalmTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2d6a4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full">
      <body className="flex min-h-full flex-col bg-background font-sans text-stone-800 antialiased">
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
