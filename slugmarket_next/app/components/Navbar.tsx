"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import NavSearchBar from "./NavSearchBar";
import {
  House,
  Search,
  PlusSquare,
  Bookmark,
  MessageCircle,
  User,
  LogOut,
} from "lucide-react";

const baseLinks = [
  { href: "/", label: "Home", icon: House },
  { href: "/search", label: "Search", icon: Search },
];

const signedOutLinks = [
  { href: "/signin", label: "Sign In", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("sign out error:", error.message);
    }
    router.replace("/");
    router.refresh();
  }

  if (loading) return null;

  const username = user?.user_metadata?.username;

  const signedInLinks = [
    { href: "/products/create", label: "Sell", icon: PlusSquare },
    { href: "/bookmarks", label: "Saved", icon: Bookmark },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: `/${username}`, label: "Profile", icon: User },
  ];

  const navLinks = user
    ? [...baseLinks, ...signedInLinks]
    : [...baseLinks, ...signedOutLinks];

  return (
    <nav className="border-b border-gray-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          SlugMarket
        </Link>

        <div className="text-gray-700">
          {user ? "Signed in" : "Not signed in"}
        </div>

        <NavSearchBar />

        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 text-sm ${getLinkClasses(link.href)}`}
              >
                <Icon size={22} strokeWidth={2} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
            >
              <LogOut size={22} strokeWidth={2} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}