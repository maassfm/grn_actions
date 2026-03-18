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

  if (loading) {
    return <div className="text-gray-500">Lade Aktionen...</div>;
  }

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-tanne uppercase mb-6">
        Alle Aktionen
      </h1>

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
