"use client";

import { useState } from "react";

interface FilterState {
  datum: string;
  datumBis: string;
  tageszeit: string;
  wahlkreise: number[];
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const WAHLKREISE = [
  { nummer: 1, name: "Mitte" },
  { nummer: 2, name: "Moabit" },
  { nummer: 3, name: "Hansaviertel/Tiergarten" },
  { nummer: 4, name: "Wedding West" },
  { nummer: 5, name: "Wedding Ost" },
  { nummer: 6, name: "Gesundbrunnen" },
  { nummer: 7, name: "Brunnenstraße" },
];

const TAGESZEITEN = [
  { value: "", label: "Alle" },
  { value: "vormittags", label: "Vormittags" },
  { value: "tagsueber", label: "Tagsüber" },
  { value: "abends", label: "Nachmittags/Abends" },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  function toggleWahlkreis(nummer: number) {
    const current = filters.wahlkreise;
    const next = current.includes(nummer)
      ? current.filter((n) => n !== nummer)
      : [...current, nummer];
    onFilterChange({ ...filters, wahlkreise: next });
  }

  const activeFilterCount =
    (filters.datum ? 1 : 0) +
    (filters.tageszeit ? 1 : 0) +
    (filters.wahlkreise.length > 0 ? 1 : 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[52px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="md:hidden w-full py-3 flex items-center justify-between text-sm font-bold text-tanne"
        >
          <span>
            Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </span>
          <span>{expanded ? "▲" : "▼"}</span>
        </button>

        {/* Filter content */}
        <div
          className={`${
            expanded ? "block" : "hidden"
          } md:flex md:items-center md:gap-6 py-3`}
        >
          {/* Datum */}
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <label className="text-sm font-bold text-gray-600 shrink-0">Datum:</label>
            <input
              type="date"
              value={filters.datum}
              onChange={(e) => onFilterChange({ ...filters, datum: e.target.value })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={filters.datumBis}
              onChange={(e) => onFilterChange({ ...filters, datumBis: e.target.value })}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>

          {/* Tageszeit */}
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <label className="text-sm font-bold text-gray-600 shrink-0">Tageszeit:</label>
            <div className="flex gap-1">
              {TAGESZEITEN.map((tz) => (
                <button
                  key={tz.value}
                  onClick={() =>
                    onFilterChange({ ...filters, tageszeit: tz.value })
                  }
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    filters.tageszeit === tz.value
                      ? "bg-tanne text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wahlkreise */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-600 shrink-0">WK:</label>
            <div className="flex gap-1 flex-wrap">
              {WAHLKREISE.map((wk) => (
                <button
                  key={wk.nummer}
                  onClick={() => toggleWahlkreis(wk.nummer)}
                  title={wk.name}
                  className={`w-7 h-7 text-xs font-bold rounded-full transition-colors ${
                    filters.wahlkreise.includes(wk.nummer)
                      ? "bg-klee text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {wk.nummer}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={() =>
                onFilterChange({
                  datum: "",
                  datumBis: "",
                  tageszeit: "",
                  wahlkreise: [],
                })
              }
              className="text-xs text-gray-500 hover:text-tanne underline ml-auto"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { FilterState };
