"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  team: { id: string; name: string } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  async function toggleActive(user: User) {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    setUsers(users.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)));
  }

  if (loading) {
    return <div className="text-gray-500">Lade Benutzer*innen...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-tanne uppercase">
          Benutzer*innen
        </h1>
        <Link href="/admin/users/neu">
          <Button>Neue*r Benutzer*in</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-sand">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">E-Mail</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Rolle</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Team</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-sm font-bold text-gray-600 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "ADMIN" ? "info" : "default"}>
                    {user.role === "ADMIN" ? "Admin" : "Expert*in"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.team?.name || "–"}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.active ? "success" : "danger"}>
                    {user.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(user)}
                    className="text-sm text-tanne hover:underline"
                  >
                    {user.active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
