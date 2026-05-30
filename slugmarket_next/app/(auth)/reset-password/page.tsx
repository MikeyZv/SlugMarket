"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Supabase redirects here with a session embedded in the URL hash.
  // onAuthStateChange fires with SIGNED_IN / PASSWORD_RECOVERY once the
  // client has exchanged the token, signalling the form is safe to submit.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handle form submission to update the user's password using Supabase's updateUser method, with validation and error handling
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  if (!ready) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500">Verifying reset link…</p>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose a new password
        </h1>
      </main>

      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 justify-center items-center border-2 rounded-lg shadow w-64 px-6 py-8"
        >
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded w-full pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-full disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
}
