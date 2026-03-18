"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Aktion {
  id: string;
  titel: string;
  datum: string;
  startzeit: string;
  endzeit: string;
  adresse: string;
  status: string;
  wahlkreis: { nummer: number; name: string };
  _count: { anmeldungen: number };
  maxTeilnehmer: number | null;
}

export default function DashboardPage() {
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/aktionen")
      .then((r) => r.json())
      .then((data) => {
        setAktionen(data);
        setLoading(false);
      });
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Aktion wirklich absagen? Alle Angemeldeten werden benachrichtigt.")) return;
    const res = await fetch(`/api/aktionen/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAktionen(
        aktionen.map((a) => (a.id === id ? { ...a, status: "ABGESAGT" } : a))
      );
    }
  }

  if (loading) {
    return <div className="text-gray-500 p-8">Lade Aktionen...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-tanne uppercase">
          Meine Aktionen
        </h1>
        <Link href="/dashboard/aktionen/neu">
          <Button>Neue Aktion</Button>
        </Link>
      </div>

      {aktionen.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <p>Noch keine Aktionen vorhanden.</p>
          <Link href="/dashboard/aktionen/neu" className="text-tanne hover:underline mt-2 inline-block">
            Erste Aktion anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {aktionen.map((aktion) => (
            <div
              key={aktion.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-tanne">{aktion.titel}</h3>
                    <StatusBadge status={aktion.status} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      📅 {format(new Date(aktion.datum), "EEEE, d. MMMM yyyy", { locale: de })} · {aktion.startzeit} – {aktion.endzeit}
                    </p>
                    <p>📍 {aktion.adresse}</p>
                    <p>
                      👥 {aktion._count.anmeldungen} Anmeldungen
                      {aktion.maxTeilnehmer ? ` / ${aktion.maxTeilnehmer} Plätze` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link href={`/dashboard/aktionen/${aktion.id}/anmeldungen`}>
                    <Button variant="outline" size="sm">
                      Anmeldungen
                    </Button>
                  </Link>
                  <Link href={`/dashboard/aktionen/${aktion.id}`}>
                    <Button variant="ghost" size="sm">
                      Bearbeiten
                    </Button>
                  </Link>
                  {aktion.status !== "ABGESAGT" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(aktion.id)}
                    >
                      Absagen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "AKTIV":
      return <Badge variant="success">Aktiv</Badge>;
    case "GEAENDERT":
      return <Badge variant="warning">Geändert</Badge>;
    case "ABGESAGT":
      return <Badge variant="danger">Abgesagt</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
