import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import NavAuthSection from "./NavAuthSection";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-tanne text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Sonnenblume" width={36} height={36} className="shrink-0" />
            <div>
              <span className="font-headline font-bold text-lg uppercase tracking-wide">
                B90/GRÜNE Berlin-Mitte
              </span>
              <span className="hidden sm:inline text-sm text-white/70 ml-2">
                Wahlkampfaktionen
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-sonne transition-colors">
              Aktionen
            </Link>
            <NavAuthSection session={session} />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-tanne text-white/70 text-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte</p>
          <div className="flex gap-4">
            <Link href="/datenschutz" className="hover:text-white transition-colors">
              Datenschutz
            </Link>
            <Link href="https://gruene-mitte.de/impressum" className="hover:text-white transition-colors">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
