"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/auth/AuthButton";
import { useSupabase } from "@/components/SupabaseProvider";
import { Dice6 } from "lucide-react";
import CharacterSwitcher from "@/components/CharacterSwitcher";
import { SHOW_SRD, SHOW_BESTIARY, RULES_SITE_URL } from "@/lib/site-config";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSupabase();

  // Dynamic navigation items based on authentication status.
  // SRD/Bestiary are flag-gated (hidden per Mike 2026-07-24 — see
  // lib/site-config.ts); while hidden, "Rules" links out to the WordPress
  // rules site instead.
  const navItems: { name: string; href: string; icon?: typeof Dice6; external?: boolean }[] = [
    { name: "Home", href: user ? "/dashboard" : "/" },
    ...(SHOW_SRD ? [{ name: "SRD", href: "/rules" }] : []),
    ...(SHOW_BESTIARY ? [{ name: "Bestiary", href: "/creatures" }] : []),
    ...(!SHOW_SRD ? [{ name: "Rules", href: RULES_SITE_URL, external: true as const }] : []),
    { name: "Character Builder", href: "/tools/character-builder" },
    { name: "Dice Roller", href: "/tools/dice-roller", icon: Dice6 },
    { name: "Tools", href: "/tools" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && !user) return pathname === "/";
    if (href === "/dashboard" && user) return pathname === "/dashboard";
    if (href === "/" || href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-white">
            SagaBorn <span className="text-blue-400">D100</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(item.href)
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.name}
                </Link>
              )
            )}
            
            {user && <CharacterSwitcher />}

            <AuthButton />
          </div>

          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            {user && (
              <div className="border-b border-slate-700 mb-2 pb-2">
                <CharacterSwitcher mobile />
              </div>
            )}
            
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium transition-colors text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-400 bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.name}
                </Link>
              )
            )}
            <div className="px-3 py-2 border-t border-slate-800 mt-4 pt-4">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}