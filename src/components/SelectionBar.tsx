"use client";

import { useRouter } from "next/navigation";

interface SelectionBarProps {
  selectedIds: string[];
  aktionTitles: Map<string, string>;
}

export default function SelectionBar({ selectedIds, aktionTitles }: SelectionBarProps) {
  const router = useRouter();

  function handleAnmelden() {
    router.push(`/anmelden?aktionen=${selectedIds.join(",")}`);
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-klee shadow-2xl z-50 transition-transform duration-300 ${
        selectedIds.length > 0 ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={selectedIds.length === 0}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Counter + chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-klee text-white text-sm font-bold px-2.5 py-0.5 rounded-full shrink-0">
              {selectedIds.length}
            </span>
            <span className="font-headline font-bold text-tanne uppercase text-base shrink-0">
              Aktion{selectedIds.length !== 1 ? "en" : ""} ausgewählt
            </span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {selectedIds.map((id) => (
                <span
                  key={id}
                  className="text-xs bg-klee/10 text-klee px-2 py-1 rounded-full font-medium"
                >
                  {aktionTitles.get(id) || id}
                </span>
              ))}
            </div>
          </div>

          {/* CTA button */}
          <button
            onClick={handleAnmelden}
            className="w-full sm:w-auto shrink-0 bg-klee hover:bg-klee/90 text-white font-headline font-bold uppercase text-base px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-klee focus:ring-offset-2"
          >
            Jetzt anmelden →
          </button>
        </div>
      </div>
    </div>
  );
}
