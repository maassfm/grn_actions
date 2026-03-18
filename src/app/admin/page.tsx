"use client";

import { useEffect, useState } from "react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";

interface Stats {
  totalAktionen: number;
  totalAnmeldungen: number;
  activeAktionen: number;
  teamCount: number;
  userCount: number;
  anmeldungenByWahlkreis: { wahlkreis: string; nummer: number; count: number }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lade Statistiken...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-tanne uppercase mb-6">
        Gesamtübersicht
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aktionen gesamt" value={stats.totalAktionen} icon="📋" />
        <StatCard label="Aktive Aktionen" value={stats.activeAktionen} icon="✅" />
        <StatCard label="Anmeldungen gesamt" value={stats.totalAnmeldungen} icon="👥" />
        <StatCard label="Teams" value={stats.teamCount} icon="🏠" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anmeldungen nach Wahlkreis</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {stats.anmeldungenByWahlkreis.map((item) => (
            <div key={item.nummer} className="flex items-center gap-3">
              <span className="text-sm font-bold text-tanne w-6">
                {item.nummer}
              </span>
              <span className="text-sm text-gray-600 w-40">{item.wahlkreis}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-klee h-full rounded-full flex items-center justify-end px-2"
                  style={{
                    width: `${Math.max(
                      (item.count / Math.max(stats.totalAnmeldungen, 1)) * 100,
                      item.count > 0 ? 10 : 0
                    )}%`,
                  }}
                >
                  <span className="text-xs text-white font-bold">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-tanne">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}
