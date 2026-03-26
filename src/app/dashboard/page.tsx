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
  team: { name: string } | null;
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
        <div className="flex items-center gap-2">
          {aktionen.length > 0 && (
            <>
              <a href="/api/export-aktionen?format=xlsx">
                <Button variant="outline" size="sm">Excel exportieren</Button>
              </a>
              <a href="/api/export-aktionen?format=txt">
                <Button variant="outline" size="sm">Signal-Text</Button>
              </a>
            </>
          )}
          <Link href="/dashboard/aktionen/neu">
            <Button>Neue Aktion</Button>
          </Link>
        </div>
      </div>

      {aktionen.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-8 text-center text-gray-500">
          <p>Noch keine Aktionen vorhanden.</p>
          <Link href="/dashboard/aktionen/neu" className="text-tanne font-bold hover:underline mt-2 inline-block">
            Erste Aktion anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {aktionen.map((aktion) => (
            <div
              key={aktion.id}
              className="bg-white border-2 border-black shadow-[4px_4px_0_#000] p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline font-bold text-tanne uppercase tracking-wide">{aktion.titel}</h3>
                    <StatusBadge status={aktion.status} />
                  </div>
                  <div className="text-sm text-black space-y-0.5">
                    <p>
                      📅 {format(new Date(aktion.datum), "EEEE, d. MMMM yyyy", { locale: de })} · {aktion.startzeit} – {aktion.endzeit}
                    </p>
                    <p>📍 {aktion.adresse}</p>
                    {aktion.team && (
                      <p>
                        <span className="text-xs font-bold uppercase tracking-wide bg-black text-white px-2 py-0.5 inline-block mt-1">
                          {aktion.team.name}
                        </span>
                      </p>
                    )}
                    <p className="pt-1">
                      👥 {aktion._count.anmeldungen} Anmeldungen
                      {aktion.maxTeilnehmer ? ` / ${aktion.maxTeilnehmer} Plätze` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link href={`/dashboard/aktionen/${aktion.id}/anmeldungen`}>
                    <Button variant="outline" size="sm">
                      Anmeldungen
                    </Button>
                  </Link>
                  <Link href={`/dashboard/aktionen/${aktion.id}`}>
                    <Button variant="secondary" size="sm">
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
