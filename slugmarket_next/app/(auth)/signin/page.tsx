"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// This component renders the sign-in form for existing users to log into their accounts.
// It includes fields for email and password, with a toggle to show/hide the password input.
// The form handles submission by calling supabase.auth.signInWithPassword and redirects to the homepage on success, or shows an error message on failure. 
// It also provides links for users to reset their password or create a new account if they don't have one.
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle form submission for logging in an existing user.
  // Calls supabase.auth.signInWithPassword and manages loading and error states.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message); // e.g. "Invalid login credentials"
    } else {
      router.push("/");
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev);
  }

  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to SlugMarket
        </h1>
        <p className="text-gray-500 text-lg mb-8">Login</p>
      </main>

      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 justify-center items-center border-2 rounded-lg shadow w-64 h-64"
        >
          <div>
            <input
              type="email"
              name="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 w-40 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Log In"}
          </button>

          <Link href="/forgot-password" className="text-gray-500 text-sm hover:underline">
            Forgot password?
          </Link>

          <p>
            New user?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}