"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  session: Session | null;
}

export default function NavAuthSection({ session }: Props) {
  if (!session) {
    return (
      <Link href="/login" className="text-white/70 hover:text-white transition-colors">
        Login
      </Link>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/70 text-xs hidden sm:inline">
        {session.user.name} &middot; {isAdmin ? "Admin" : "Expert*in"}
      </span>
      {isAdmin ? (
        <Link href="/admin" className="hover:text-sonne transition-colors font-medium">
          Admin Panel
        </Link>
      ) : (
        <Link href="/dashboard" className="hover:text-sonne transition-colors">
          Dashboard
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-white/70 hover:text-white transition-colors"
      >
        Abmelden
      </button>
    </div>
  );
}
