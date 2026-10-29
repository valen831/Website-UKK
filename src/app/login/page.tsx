"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUp, user, loading } = useAuth();

  // Default ke mode daftar, kecuali URL hash #login
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister) {
      if (password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
      if (password !== confirmPassword) {
        setError("Password dan konfirmasi password tidak cocok");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await signUp(email, password, name);
        setSuccess("Akun berhasil dibuat! Silakan cek email untuk verifikasi, atau langsung masuk.");
        // Switch ke mode login setelah daftar berhasil
        setIsRegister(false);
        setPassword("");
        setConfirmPassword("");
        setName("");
      } else {
        await signInWithEmail(email, password);
        router.replace("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi";
      // Translate common Supabase errors
      if (msg.includes("Invalid login credentials")) {
        setError("Email atau password salah");
      } else if (msg.includes("already registered")) {
        setError("Email sudah terdaftar. Silakan masuk.");
      } else if (msg.includes("Password should be at least")) {
        setError("Password minimal 6 karakter");
      } else if (msg.includes("Database error") || msg.includes("schema database")) {
        setError("Database belum siap. Jalankan isi file supabase-schema.sql di Supabase SQL Editor.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
      // signInWithGoogle redirects to Google — no router.replace needed
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk dengan Google";
      if (msg.includes("unexpected_failure") || msg.includes("provider is not enabled")) {
        setError("Login Google belum diaktifkan. Aktifkan Google provider di Supabase Dashboard → Authentication → Providers.");
      } else {
        setError(msg);
      }
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#f97316]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff7ed] px-4 font-[Poppins]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">
          <span className="text-[#1e293b]">Renta</span>
          <span className="text-[#f97316]">Go</span>
        </h1>

        <p className="mb-6 text-center text-sm text-[#1e293b]/60">
          {isRegister ? "Buat akun baru untuk mulai menyewa" : "Masuk ke akun RentaGo kamu"}
        </p>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-medium text-[#1e293b] transition hover:bg-[#f8fafc] disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {isRegister ? "Daftar dengan Google" : "Masuk dengan Google"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e2e8f0]" />
          <span className="text-xs font-medium text-[#1e293b]/40">atau</span>
          <div className="h-px flex-1 bg-[#e2e8f0]" />
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
          />
          <input
            type="password"
            placeholder="Password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
          />
          {isRegister && (
            <input
              type="password"
              placeholder="Konfirmasi Password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#1e293b] outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            />
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#f97316] py-3 text-sm font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Memproses...
              </span>
            ) : isRegister ? "Daftar Akun" : "Masuk"}
          </button>
        </form>

        {/* Toggle + Mode Admin */}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#1e293b]/60">
          <span>
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
              className="font-semibold text-[#f97316] hover:underline"
            >
              {isRegister ? "Masuk" : "Daftar"}
            </button>
          </span>
          <span className="text-[#e2e8f0]">|</span>
          <Link
            href="/admin/login"
            className="font-medium text-[#1e293b]/50 transition hover:text-[#1e293b]"
          >
            Mode Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
