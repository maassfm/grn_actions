"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  team: { name: string };
  _count: { anmeldungen: number };
  maxTeilnehmer: number | null;
}

export default function AdminAktionenPage() {
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

  async function handleDelete(aktion: Aktion) {
    const anmeldungenText =
      aktion._count.anmeldungen > 0
        ? ` Alle ${aktion._count.anmeldungen} Anmeldung(en) werden gelöscht.`
        : "";
    const confirmed = window.confirm(
      `Aktion "${aktion.titel}" endgültig löschen?${anmeldungenText} Es werden KEINE E-Mails verschickt. Diese Aktion kann nicht rückgängig gemacht werden.`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/aktionen/${aktion.id}`, { method: "DELETE" });
    if (res.ok) {
      setAktionen((prev) => prev.filter((a) => a.id !== aktion.id));
    } else {
      alert("Fehler beim Löschen der Aktion.");
    }
  }

  if (loading) {
    return <div className="text-gray-500">Lade Aktionen...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-headline text-2xl font-bold text-tanne uppercase">
          Alle Aktionen
        </h1>
        <div className="flex gap-2">
          <a
            href="/api/export-aktionen?format=xlsx"
            className="px-4 py-2 bg-tanne text-white text-sm font-medium rounded-lg hover:bg-tanne/90 transition-colors"
          >
            Alle exportieren (Excel)
          </a>
          <a
            href="/api/export-aktionen?format=txt"
            className="px-4 py-2 border border-tanne text-tanne text-sm font-medium rounded-lg hover:bg-tanne/10 transition-colors"
          >
            Alle exportieren (TXT)
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-sand">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Titel</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Datum</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Wahlkreis</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Team</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 uppercase">Anmeldungen</th>
              <th className="text-right px-4 py-3 text-sm font-bold text-gray-600 uppercase">Details</th>
              <th className="text-right px-4 py-3 text-sm font-bold text-gray-600 uppercase">Export</th>
              <th className="text-right px-4 py-3 text-sm font-bold text-gray-600 uppercase">Löschen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {aktionen.map((aktion) => (
              <tr key={aktion.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{aktion.titel}</td>
                <td className="px-4 py-3 text-gray-600">
                  {format(new Date(aktion.datum), "dd.MM.yyyy", { locale: de })}
                  <br />
                  <span className="text-xs">{aktion.startzeit} – {aktion.endzeit}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  WK {aktion.wahlkreis.nummer}
                </td>
                <td className="px-4 py-3 text-gray-600">{aktion.team.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={aktion.status} />
                </td>
                <td className="px-4 py-3">
                  {aktion._count.anmeldungen}
                  {aktion.maxTeilnehmer ? ` / ${aktion.maxTeilnehmer}` : ""}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/aktionen/${aktion.id}`}
                    className="text-sm text-tanne hover:underline"
                  >
                    Bearbeiten
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/api/export?format=xlsx&aktionId=${aktion.id}`}
                    className="text-sm text-tanne hover:underline"
                  >
                    xlsx
                  </a>
                  {" · "}
                  <a
                    href={`/api/export?format=txt&aktionId=${aktion.id}`}
                    className="text-sm text-tanne hover:underline"
                  >
                    txt
                  </a>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(aktion)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Löschen
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
