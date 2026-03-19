"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-Mail oder Passwort ist falsch.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center"><Image src="/logo.png" alt="Sonnenblume" width={64} height={64} /></div>
          <h1 className="font-headline text-3xl font-bold text-tanne uppercase tracking-wide">
            GRÜNE Berlin-Mitte
          </h1>
          <p className="text-gray-600 mt-2">Wahlkampf-Aktionsportal</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-6">
            Anmelden
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Anmelden
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nur für Wahlkampfexpert*innen und Administrator*innen.
        </p>
      </div>
    </div>
  );
}
