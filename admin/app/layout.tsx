import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SN HandCrafts Admin",
  description: "Admin panel for product and order management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
