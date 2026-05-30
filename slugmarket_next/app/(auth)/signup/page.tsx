"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// This component renders the sign-up form for new users to create an account.
// It includes fields for username, email, and password, with validation to ensure only @ucsc.edu email addresses are allowed.
// The form handles submission by calling supabase.auth.signUp and redirects to the homepage on success, or shows an error message on failure. 
// It also includes a toggle to show/hide the password input for better user experience.
export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle form submission for creating a new account. 
  // Validates email, calls supabase signUp, and manages loading and error states.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.endsWith("@ucsc.edu")) {
      setError("Only @ucsc.edu email addresses are allowed.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // stored in user metadata; trigger copies to profiles table
      },
    });

    console.log("signUp result:", { data, error });

    setLoading(false);

    if (error) {
      setError(error.message);
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
        <p className="text-gray-500 text-lg mb-8">Create A New Account</p>
      </main>

      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 justify-center items-center border-2 rounded-lg shadow w-64 min-h-72 p-4"
        >
          <div>
            <input
              type="text"
              name="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </div>

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
            {loading ? "Creating…" : "Create Account"}
          </button>

          <p>
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}