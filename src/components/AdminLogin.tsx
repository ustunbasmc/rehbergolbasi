"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError("Giriş başarısız: " + signInError.message);
      return;
    }

    onSuccess();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark px-5 py-16">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-bordo/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="RehberGölbaşı" width={40} height={40} className="mb-3 h-10 w-auto" />
          <span className="mb-2 flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy/60">
            <ShieldCheck className="h-3 w-3" /> Yönetim Paneli
          </span>
          <h1 className="font-display text-xl font-bold text-navy">Admin Girişi</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">E-posta</label>
            <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 transition focus-within:border-bordo">
              <Mail className="h-4 w-4 shrink-0 text-ink/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-w-0 text-sm text-ink outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">Şifre</label>
            <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 transition focus-within:border-bordo">
              <Lock className="h-4 w-4 shrink-0 text-ink/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-w-0 text-sm text-ink outline-none"
              />
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-bordo">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-bordo to-bordo-dark px-4 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
