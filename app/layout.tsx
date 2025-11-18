"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";
import NavBar from "./components/NavBar";
import { SessionProvider } from "./invisibleComponents/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: "IMColle",
  description: "Share and find images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={inter.className}>
          <NavBar />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
