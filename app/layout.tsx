import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderFit — Never lose a tender because of paperwork",
  description:
    "AI-powered compliance and tender-readiness platform for South African construction SMEs. Document vault, expiry radar, safety files and tender packs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
