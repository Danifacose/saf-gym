import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saf Gym — Gestionale Palestra",
  description: "Gestionale per la palestra Saf Gym. Gestisci atleti, schede di allenamento, abbonamenti e pagamenti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-[var(--bg-primary)]">
        {children}
      </body>
    </html>
  );
}
