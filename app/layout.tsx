import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation/Navigation";
import SupabaseProvider from "@/components/SupabaseProvider";
import { CharacterProvider } from "@/contexts/CharacterContext";
import CharacterQuickStats from "@/components/CharacterQuickStats";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SagaBorn Tavern",
  description: "SagaBorn Tavern — character creation and game tools for the SagaBorn D100 tabletop RPG. Build heroes, run encounters, and level up, D&D-Beyond style.",
  keywords: ["SagaBorn", "D100", "RPG", "tabletop", "fantasy", "roleplaying", "game"],
  authors: [{ name: "SagaBorn RPG" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
        suppressHydrationWarning={true}
      >
        <SupabaseProvider>
          <CharacterProvider>
            <Navigation />
            <main>{children}</main>
            <CharacterQuickStats />
            <footer className="border-t border-slate-800 bg-slate-950 py-8">
              <div className="container mx-auto px-4 text-center text-slate-400">
                <p>&copy; 2025 SagaBorn RPG. All rights reserved.</p>
              </div>
            </footer>
          </CharacterProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
