"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/logo2.png" alt="SlugMarket" className="h-16 w-auto mx-auto mb-4" />
            </Link>
            <h1 className="text-3xl font-bold text-[#0F2044]">Reset your password</h1>
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="text-4xl">✉️</div>
              <p className="text-lg font-semibold text-gray-900">Check your inbox</p>
              <p className="text-gray-500 text-sm">
                We sent a password reset link to <span className="font-semibold text-gray-800">{email}</span>.
              </p>
              <Link
                href="/signin"
                className="mt-2 w-full rounded-xl bg-[#0F2044] py-3 text-base font-semibold text-white text-center hover:bg-[#162d5a] transition"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="you@ucsc.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-[#0F2044] focus:outline-none transition"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#F5C518] py-3 text-lg font-semibold text-[#0F2044] shadow-sm transition hover:bg-[#fde047] disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <p className="text-center text-gray-500 text-sm mt-2">
                <Link href="/signin" className="text-[#0F2044] font-semibold hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
