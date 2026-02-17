import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import SessionProvider from "./components/providers/SessionProvider";
import "./(dashboard)/dashboard.css";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plannfly - Gerenciamento e gestao de alunos e aulas",
  description: "A plataforma aliada dos professores. Organize sua agenda, gerencie alunos e automatize cobrancas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-[family-name:var(--font-body)] antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
