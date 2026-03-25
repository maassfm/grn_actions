"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import Badge from "@/components/ui/Badge";

interface AktionCardProps {
  aktion: {
    id: string;
    titel: string;
    datum: string;
    startzeit: string;
    endzeit: string;
    adresse: string;
    wahlkreis: { nummer: number; name: string };
    ansprechpersonName: string;
    maxTeilnehmer: number | null;
    status: string;
    _count: { anmeldungen: number };
  };
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function AktionCard({ aktion, selected, onToggle }: AktionCardProps) {
  const datum = new Date(aktion.datum);
  const isFull =
    aktion.maxTeilnehmer !== null &&
    aktion._count.anmeldungen >= aktion.maxTeilnehmer;

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
        selected
          ? "border-klee shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300"
      }`}
      onClick={() => !isFull && onToggle(aktion.id)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-tanne text-lg leading-tight">
            {aktion.titel}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {aktion.status === "GEAENDERT" && (
              <Badge variant="warning">Geändert</Badge>
            )}
            <input
              type="checkbox"
              checked={selected}
              onChange={() => !isFull && onToggle(aktion.id)}
              disabled={isFull}
              className="w-5 h-5 rounded border-gray-300 text-klee focus:ring-klee"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="space-y-1 text-base text-gray-600">
          <p>
            📅{" "}
            <span className="font-medium">
              {format(datum, "EEEE, d. MMMM", { locale: de })}
            </span>{" "}
            · {aktion.startzeit} – {aktion.endzeit} Uhr
          </p>
          <p>📍 {aktion.adresse}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs bg-sand rounded-full px-2 py-0.5 font-medium">
              WK {aktion.wahlkreis.nummer}: {aktion.wahlkreis.name}
            </span>
            <span className="text-base">
              👤 {aktion.ansprechpersonName}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base text-gray-600">
              {aktion._count.anmeldungen} Anmeldung{aktion._count.anmeldungen !== 1 ? "en" : ""}
              {aktion.maxTeilnehmer ? ` / ${aktion.maxTeilnehmer} Plätze` : ""}
            </span>
            {isFull && (
              <Badge variant="danger">Ausgebucht</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
