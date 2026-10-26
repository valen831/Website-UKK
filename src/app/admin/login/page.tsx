"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("Sesi login tidak ditemukan. Silakan coba lagi.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Akun ini tidak memiliki akses administrator.");
        return;
      }

      router.replace("/admin");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal masuk. Periksa email dan password Anda."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e293b] px-4 font-[Poppins]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e293b]">
            <span className="text-lg font-bold text-white">R</span>
          </div>
        </div>
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-[#1e293b]">
          Admin Panel
        </h1>
        <p className="mb-6 text-center text-sm text-[#1e293b]/50">
          Masukkan password admin untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#1e293b] focus:ring-2 focus:ring-[#1e293b]/20"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="Masukkan password admin"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#1e293b] focus:ring-2 focus:ring-[#1e293b]/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#1e293b] py-3 text-sm font-semibold text-white transition hover:bg-[#0f172a] disabled:opacity-50"
          >
            Masuk ke Admin
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-[#1e293b]/40 hover:text-[#f97316] transition-colors"
          >
            ← Kembali ke Login User
          </Link>
        </div>
      </div>
    </div>
  );
}
