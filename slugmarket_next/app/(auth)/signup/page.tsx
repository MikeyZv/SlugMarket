"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
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
        data: { username },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setVerified(true);
    }
  }

  if (verified) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0F2044]/10 flex items-center justify-center">
              <Mail size={32} className="text-[#0F2044]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="text-gray-500">
              We sent a verification link to <span className="font-semibold text-gray-800">{email}</span>. Click the link in that email to activate your account.
            </p>
            <p className="text-gray-400 text-sm">Didn&apos;t get it? Check your spam folder.</p>
            <Link href="/signin" className="mt-2 w-full rounded-xl bg-[#0F2044] py-3 text-lg font-semibold text-white hover:bg-[#162d5a] transition text-center">
              Go to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0F2044]">Create an account</h1>
            <p className="text-gray-500 mt-1">Join SlugMarket with your UCSC email</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                placeholder="slugger123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-[#0F2044] focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@ucsc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-[#0F2044] focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pr-12 text-base focus:border-[#0F2044] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#F5C518] py-3 text-lg font-semibold text-[#0F2044] shadow-sm transition hover:bg-[#fde047] disabled:opacity-50 mt-1 cursor-pointer"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#0F2044] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
