"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Übersicht", icon: "📊" },
  { href: "/admin/aktionen", label: "Alle Aktionen", icon: "📋" },
  { href: "/admin/teams", label: "Teams", icon: "👥" },
  { href: "/admin/users", label: "Benutzer*innen", icon: "👤" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-tanne text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-xl"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menü"
            >
              ☰
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/logo_white.png" alt="Sonnenblume" width={32} height={32} />
              <span className="font-headline font-bold text-lg uppercase tracking-wide">
                Administration
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-white/70 text-xs hidden sm:inline">
                {session.user.name} &middot; Admin
              </span>
            )}
            <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
              Zur Übersicht
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } md:block w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] p-4`}
        >
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-tanne/10 text-tanne"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
