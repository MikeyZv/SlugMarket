"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// This component renders a forgot password form that allows users to request a password reset email. It handles form submission, shows loading and error states, and displays a confirmation message after a successful request.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Reset your password
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </main>

      <div className="flex items-center justify-center">
        {sent ? (
          <div className="flex flex-col items-center gap-4 border-2 rounded-lg shadow w-72 px-6 py-8 text-center">
            <p className="text-gray-800 font-medium">Check your inbox</p>
            <p className="text-gray-500 text-sm">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/signin" className="text-blue-500 hover:underline text-sm">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 justify-center items-center border-2 rounded-lg shadow w-64 px-6 py-8"
          >
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded w-full"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-full disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <Link href="/signin" className="text-gray-500 text-sm hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </>
  );
}
