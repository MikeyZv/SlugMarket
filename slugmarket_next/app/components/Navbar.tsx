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

// Navbar component that displays navigation links based on the user's authentication state. It also includes a search bar and a sign out button for authenticated users.
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, avatarUrl } = useAuth();

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
    <>
      {/* Top bar */}
      <nav className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="shrink-0">
            <img src="/logo.png" alt="SlugMarket" className="h-16 w-auto" />
          </Link>

          {/* Search bar — hidden below 945px */}
          <div className="hidden min-[945px]:block w-64">
            <NavSearchBar />
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden min-[770px]:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isProfile = link.label === "Profile";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1 text-sm ${getLinkClasses(link.href)}`}
                >
                  {isProfile && avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
                    : <Icon size={22} strokeWidth={2} />}
                  {!(isProfile && avatarUrl) && <span>{link.label}</span>}
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

      {/* Mobile bottom nav — visible only on small screens */}
      <nav className="min-[770px]:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.filter((link) => link.label !== "Saved").map((link) => {
            const Icon = link.icon;
            const isProfile = link.label === "Profile";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 text-xs px-3 py-1 ${getLinkClasses(link.href)}`}
              >
                {isProfile && avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                  : <Icon size={20} strokeWidth={2} />}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex flex-col items-center gap-0.5 text-xs px-3 py-1 text-gray-700 hover:text-blue-600"
            >
              <LogOut size={20} strokeWidth={2} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}