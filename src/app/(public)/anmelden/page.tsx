"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AnmeldeFormular from "@/components/AnmeldeFormular";

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

export default function AnmeldenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [aktionen, setAktionen] = useState<Aktion[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const initialIds = useMemo(() => {
    const param = searchParams.get("aktionen");
    return param ? param.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  useEffect(() => {
    fetch("/api/aktionen?public=true")
      .then((r) => r.json())
      .then((data: Aktion[]) => {
        setAktionen(data);
        setLoading(false);
      });
  }, []);

  const aktionTitles = useMemo(
    () => new Map(aktionen.map((a) => [a.id, a.titel])),
    [aktionen]
  );

  function removeAktion(id: string) {
    const next = selectedIds.filter((sid) => sid !== id);
    if (next.length === 0) {
      router.push("/");
    } else {
      setSelectedIds(next);
    }
  }

  function handleSuccess() {
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <p className="font-headline font-bold text-green-700 text-2xl uppercase mb-2">
            Anmeldung erfolgreich!
          </p>
          <p className="text-green-600 mt-2">
            Du erhältst in Kürze eine Bestätigungs-E-Mail.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-tanne hover:underline font-bold"
          >
            ← Zurück zur Aktionsübersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-tanne hover:underline font-medium mb-6"
      >
        ← Zurück zur Aktionsübersicht
      </Link>

      <h1 className="font-headline text-2xl md:text-3xl font-bold text-tanne uppercase mb-6">
        Anmeldung
      </h1>

      {/* Selected actions summary */}
      <div className="bg-klee/5 border border-klee/20 rounded-xl p-4 mb-6">
        <p className="text-sm font-bold text-tanne mb-3">
          {selectedIds.length === 1
            ? "Du hast 1 Aktion ausgewählt:"
            : `Du hast ${selectedIds.length} Aktionen ausgewählt:`}
        </p>
        {loading ? (
          <p className="text-sm text-gray-400">Lade Aktionen...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 text-xs bg-klee/10 text-klee px-2.5 py-1 rounded-full font-medium"
              >
                {aktionTitles.get(id) || id}
                <button
                  type="button"
                  onClick={() => removeAktion(id)}
                  className="ml-0.5 text-klee/60 hover:text-klee transition-colors focus:outline-none"
                  aria-label={`${aktionTitles.get(id) || id} entfernen`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Registration form */}
      <AnmeldeFormular
        variant="page"
        selectedIds={selectedIds}
        aktionTitles={aktionTitles}
        onSuccess={handleSuccess}
        onClear={() => router.push("/")}
      />
    </div>
  );
}
