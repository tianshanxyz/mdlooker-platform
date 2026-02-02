import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MDLooker | Global Medical Device Compliance Intelligence",
  description: "Aggregate FDA, NMPA, EUDAMED data for medical device compliance navigation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children; // 仅作为容器，实际布局在[locale]/layout处理
}
