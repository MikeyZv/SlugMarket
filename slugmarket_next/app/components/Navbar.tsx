"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase"

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
];

const signedOutLinks = [
  { href: "/signin", label: "Sign In" },
]

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter()
  const { user, loading } = useAuth()

  function getLinkClasses(href: string) {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");

    return isActive
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error("sign out error:", error.message)
    }
    router.replace("/")
    router.refresh()
  }


  if (loading) return null

  const username = user?.user_metadata?.username

  const signedInLinks = [
    { href: "/products/create", label: "Sell" },
    { href: "/messages", label: "Messages" },
    { href: `/${username}`, label: "Profile" },
  ];

  const navLinks = user
    ? [...baseLinks, ...signedInLinks] 
    : [...baseLinks, ...signedOutLinks]

  return (
    <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-xl font-bold">
        SlugMarket
      </Link>

      <div>
        {user ? "Signed in" : "Not signed in"}
      </div>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={getLinkClasses(link.href)}
          >
            {link.label}
          </Link>
        ))}

        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="text-gray-700 hover:text-blue-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
