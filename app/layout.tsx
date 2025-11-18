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
      <html lang="en" data-theme="dark">
        <body className={`${inter.className} bg-base-100 min-h-screen`}>
          <NavBar />
          <main className="px-6 md:px-12 lg:px-24 py-6">
            <div className="w-full">{children}</div>
          </main>
        </body>
      </html>
    </SessionProvider>
  );
}
