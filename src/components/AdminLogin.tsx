"use client";

import { useState } from "react";
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
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="mb-6 font-display text-2xl font-bold text-navy">Admin Girişi</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-bordo"
          />
        </div>
        {error && <p className="text-sm text-bordo">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-bordo px-4 py-3 text-sm font-bold text-white hover:bg-bordo-dark disabled:opacity-60"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}