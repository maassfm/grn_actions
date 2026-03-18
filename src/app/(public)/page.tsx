"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import FilterBar, { type FilterState } from "@/components/FilterBar";
import AktionCard from "@/components/AktionCard";
import AnmeldeFormular from "@/components/AnmeldeFormular";

const AktionMap = dynamic(() => import("@/components/AktionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] md:h-[600px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
      Karte wird geladen...
    </div>
  ),
});

interface Aktion {
  id: string;
  titel: string;
  datum: string;
  startzeit: string;
  endzeit: string;
  adresse: string;
  latitude: number | null;
  longitude: number | null;
  wahlkreis: { nummer: number; name: string };
  ansprechpersonName: string;
  maxTeilnehmer: number | null;
  status: string;
  _count: { anmeldungen: number };
}

export default function AktionenPage() {
  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"liste" | "karte">("liste");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    datum: "",
    datumBis: "",
    tageszeit: "",
    wahlkreise: [],
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.datum) params.set("datum", filters.datum);
    if (filters.datumBis) params.set("datumBis", filters.datumBis);
    if (filters.tageszeit) params.set("tageszeit", filters.tageszeit);
    if (filters.wahlkreise.length > 0) {
      params.set("wahlkreis", filters.wahlkreise.join(","));
    }

    fetch(`/api/aktionen?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setAktionen(data);
        setLoading(false);
      });
  }, [filters]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const aktionTitles = useMemo(
    () => new Map(aktionen.map((a) => [a.id, a.titel])),
    [aktionen]
  );

  function handleSuccess() {
    setSelectedIds(new Set());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  }

  return (
    <div className={selectedIds.size > 0 ? "pb-80" : ""}>
      <FilterBar filters={filters} onFilterChange={setFilters} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-headline text-xl md:text-2xl font-bold text-tanne uppercase">
            Aktionen
          </h1>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setView("liste")}
              className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                view === "liste"
                  ? "bg-tanne text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setView("karte")}
              className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                view === "karte"
                  ? "bg-tanne text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Karte
            </button>
          </div>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 mb-4">
            <p className="font-bold">Anmeldung erfolgreich! 🎉</p>
            <p className="text-sm mt-1">
              Du erhältst in Kürze eine Bestätigungs-E-Mail.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Lade Aktionen...
          </div>
        ) : aktionen.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">
              Aktuell keine Aktionen geplant.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Schau später nochmal vorbei!
            </p>
          </div>
        ) : view === "liste" ? (
          <div className="space-y-3">
            {selectedIds.size === 0 && (
              <p className="text-sm text-gray-500">
                Wähle eine oder mehrere Aktionen aus, um dich anzumelden.
              </p>
            )}
            {aktionen.map((aktion) => (
              <AktionCard
                key={aktion.id}
                aktion={aktion}
                selected={selectedIds.has(aktion.id)}
                onToggle={toggleSelection}
              />
            ))}
          </div>
        ) : (
          <AktionMap aktionen={aktionen} onSelect={toggleSelection} />
        )}
      </div>

      {/* Registration form */}
      <AnmeldeFormular
        selectedIds={Array.from(selectedIds)}
        aktionTitles={aktionTitles}
        onSuccess={handleSuccess}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  );
}
