"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Team {
  id: string;
  name: string;
  wahlkreis: { id: string; nummer: number; name: string } | null;
  _count: { users: number; aktionen: number };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/teams")
      .then((r) => r.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Team wirklich löschen?")) return;
    const res = await fetch(`/api/admin/teams?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTeams(teams.filter((t) => t.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Fehler beim Löschen");
    }
  }

  if (loading) {
    return <div className="text-gray-500">Lade Teams...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-tanne uppercase">Teams</h1>
        <Link href="/admin/teams/neu">
          <Button>Neues Team</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-tanne text-lg">{team.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {team.wahlkreis
                    ? `Wahlkreis ${team.wahlkreis.nummer}: ${team.wahlkreis.name}`
                    : "Bezirksweit"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(team.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Löschen
              </button>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <span>👤 {team._count.users} Mitglieder</span>
              <span>📋 {team._count.aktionen} Aktionen</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
