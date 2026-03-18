"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

interface AnmeldeFormularProps {
  selectedIds: string[];
  aktionTitles: Map<string, string>;
  onSuccess: () => void;
  onClear: () => void;
}

export default function AnmeldeFormular({
  selectedIds,
  aktionTitles,
  onSuccess,
  onClear,
}: AnmeldeFormularProps) {
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    signalName: "",
    datenschutz: false,
    honeypot: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  function updateForm(field: string, value: string | boolean) {
    setForm({ ...form, [field]: value });
    if (field === "telefon" || field === "signalName") {
      setContactError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setContactError("");

    // Validate at least one contact method
    if (!form.telefon && !form.signalName) {
      setContactError("Bitte gib eine Telefonnummer oder einen Signal-Namen an");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/anmeldungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aktionIds: selectedIds,
          vorname: form.vorname,
          nachname: form.nachname,
          email: form.email,
          telefon: form.telefon || null,
          signalName: form.signalName || null,
          datenschutz: form.datenschutz,
          honeypot: form.honeypot,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Fehler bei der Anmeldung");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-klee shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-bold text-tanne uppercase">
            Anmeldung ({selectedIds.length} Aktion{selectedIds.length !== 1 ? "en" : ""})
          </h2>
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Auswahl aufheben ✕
          </button>
        </div>

        {/* Selected actions summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedIds.map((id) => (
            <span
              key={id}
              className="text-xs bg-klee/10 text-klee px-2 py-1 rounded-full font-medium"
            >
              {aktionTitles.get(id) || id}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot - hidden from humans */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              value={form.honeypot}
              onChange={(e) => updateForm("honeypot", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vorname"
              value={form.vorname}
              onChange={(e) => updateForm("vorname", e.target.value)}
              required
            />
            <Input
              label="Nachname"
              value={form.nachname}
              onChange={(e) => updateForm("nachname", e.target.value)}
              required
            />
          </div>

          <Input
            label="E-Mail"
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefonnummer"
              type="tel"
              value={form.telefon}
              onChange={(e) => updateForm("telefon", e.target.value)}
              error={contactError}
            />
            <Input
              label="Signal-Name"
              value={form.signalName}
              onChange={(e) => updateForm("signalName", e.target.value)}
              placeholder="z.B. @meinname"
            />
          </div>
          {!contactError && (
            <p className="text-xs text-gray-500 -mt-2">
              Bitte gib mindestens eine Telefonnummer oder einen Signal-Namen an.
            </p>
          )}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="datenschutz"
              checked={form.datenschutz}
              onChange={(e) => updateForm("datenschutz", e.target.checked)}
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-klee focus:ring-klee"
            />
            <label htmlFor="datenschutz" className="text-sm text-gray-600">
              Ich stimme der Verarbeitung meiner Daten zum Zweck der Koordination
              von Wahlkampfaktionen zu. Meine Daten werden nur für diesen Zweck
              verwendet und nach der Wahl gelöscht.{" "}
              <Link
                href="/datenschutz"
                target="_blank"
                className="text-tanne hover:underline"
              >
                Datenschutzerklärung
              </Link>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
            Jetzt anmelden
          </Button>
        </form>
      </div>
    </div>
  );
}
