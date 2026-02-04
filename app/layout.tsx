import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MDLooker | Global Medical Device Compliance Intelligence",
  description: "Aggregate FDA, NMPA, EUDAMED data for medical devices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
