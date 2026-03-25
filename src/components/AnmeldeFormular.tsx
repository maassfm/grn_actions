"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

interface AnmeldeFormularProps {
  selectedIds: string[];
  aktionTitles: Map<string, string>;
  onSuccess: () => void;
  onClear: () => void;
  variant?: "bottomsheet" | "page";
}

export default function AnmeldeFormular({
  selectedIds,
  aktionTitles,
  onSuccess,
  onClear,
  variant = "bottomsheet",
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
  const [signalError, setSignalError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  function updateForm(field: string, value: string | boolean) {
    setForm({ ...form, [field]: value });
    if (field === "telefon" || field === "signalName") {
      setContactError("");
    }
    if (field === "signalName") {
      setSignalError("");
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaTime = Date.now() - touchStartTime.current;
    if (deltaY > 30 || (deltaY > 10 && deltaTime < 300)) setIsExpanded(true);
    if (deltaY < -30 || (deltaY < -10 && deltaTime < 300)) setIsExpanded(false);
    touchStartY.current = null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setContactError("");

    if (!form.telefon && !form.signalName) {
      setContactError("Bitte gib eine Telefonnummer oder einen Signal-Nutzernamen an");
      return;
    }

    if (form.signalName && !/^[a-zA-Z0-9_]{2,32}\.\d+$/.test(form.signalName)) {
      setSignalError("Bitte gib deinen Signal-Nutzernamen ein (Format: name.123)");
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

  if (variant === "page") {
    return (
      <div className="max-w-2xl">
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
            <div>
              <Input
                label="Signal-Nutzername"
                value={form.signalName}
                onChange={(e) => updateForm("signalName", e.target.value)}
                placeholder="z.B. name.123"
                error={signalError}
              />
            </div>
          </div>
          {!contactError && (
            <p className="text-xs text-gray-500 -mt-2">
              Bitte gib mindestens eine Telefonnummer oder einen Signal-Nutzernamen an.
            </p>
          )}

          <div className="flex items-start gap-3">
            {/* Square brutalist checkbox */}
            <div className="relative mt-1 shrink-0">
              <input
                type="checkbox"
                id="datenschutz-page"
                checked={form.datenschutz}
                onChange={(e) => updateForm("datenschutz", e.target.checked)}
                required
                className="sr-only"
              />
              <label
                htmlFor="datenschutz-page"
                className={`w-5 h-5 border-2 border-black flex items-center justify-center cursor-pointer transition-colors ${
                  form.datenschutz ? "bg-tanne" : "bg-white"
                }`}
              >
                {form.datenschutz && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            </div>
            <label htmlFor="datenschutz-page" className="text-sm text-gray-700 cursor-pointer">
              Ich stimme der Verarbeitung meiner Daten zum Zweck der Koordination
              von Wahlkampfaktionen zu.{" "}
              <Link
                href="/datenschutz"
                target="_blank"
                className="text-tanne font-bold hover:underline"
              >
                Datenschutzerklärung
              </Link>
            </label>
          </div>

          {error && (
            <div className="bg-white border-2 border-signal text-black p-3 text-sm font-bold">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
            Jetzt anmelden
          </Button>
        </form>
      </div>
    );
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-black shadow-[0_-4px_0_#000] z-50">
      {/* Collapsed header bar – always visible, tap or swipe to expand */}
      <div
        className="flex items-center justify-between cursor-pointer select-none py-3 px-4"
        onClick={() => setIsExpanded((v) => !v)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        aria-expanded={isExpanded}
        aria-label="Anmeldeformular öffnen"
      >
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-black uppercase text-base">
            {selectedIds.length} Aktion{selectedIds.length !== 1 ? "en" : ""} ausgewählt
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={`w-5 h-5 text-black transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          <path d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </div>

      {/* Hint line – only visible when collapsed */}
      {!isExpanded && (
        <p
          className="font-headline font-bold uppercase text-black text-center pb-2 px-4 cursor-pointer text-sm tracking-wide"
          onClick={() => setIsExpanded(true)}
        >
          Melde Dich hier für die Aktion{selectedIds.length !== 1 ? "en" : ""} an →
        </p>
      )}

      {/* Animated form body */}
      <div
        className={`overflow-y-auto transition-all duration-300 ease-in-out md:max-h-[75vh] md:opacity-100 ${
          isExpanded ? "max-h-[75vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 pb-6">
          {/* Selected actions summary */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="text-xs bg-tanne text-white px-2 py-1 font-bold uppercase tracking-wide border border-black"
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
              <div>
                <Input
                  label="Signal-Nutzername"
                  value={form.signalName}
                  onChange={(e) => updateForm("signalName", e.target.value)}
                  placeholder="z.B. name.123"
                  error={signalError}
                />
              </div>
            </div>
            {!contactError && (
              <p className="text-xs text-gray-500 -mt-2">
                Bitte gib mindestens eine Telefonnummer oder einen Signal-Nutzernamen an.
              </p>
            )}

            <div className="flex items-start gap-3">
              {/* Square brutalist checkbox */}
              <div className="relative mt-1 shrink-0">
                <input
                  type="checkbox"
                  id="datenschutz"
                  checked={form.datenschutz}
                  onChange={(e) => updateForm("datenschutz", e.target.checked)}
                  required
                  className="sr-only"
                />
                <label
                  htmlFor="datenschutz"
                  className={`w-5 h-5 border-2 border-black flex items-center justify-center cursor-pointer transition-colors ${
                    form.datenschutz ? "bg-tanne" : "bg-white"
                  }`}
                >
                  {form.datenschutz && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              </div>
              <label htmlFor="datenschutz" className="text-sm text-gray-700 cursor-pointer">
                Ich stimme der Verarbeitung meiner Daten zum Zweck der Koordination
                von Wahlkampfaktionen zu.{" "}
                <Link
                  href="/datenschutz"
                  target="_blank"
                  className="text-tanne font-bold hover:underline"
                >
                  Datenschutzerklärung
                </Link>
              </label>
            </div>

            {error && (
              <div className="bg-white border-2 border-signal text-black p-3 text-sm font-bold">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
              Jetzt anmelden
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
