import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  title: "KnowledgeVerse",
  description: "Your personal knowledge management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
