"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/products/create", label: "Sell" },
  { href: "/messages", label: "Messages" },
  { href: "/a67", label: "Profile" }, // replace later with real username
  { href: "/signin", label: "Sign In" },
];

export default function Navbar() {
  const pathname = usePathname();

  function getLinkClasses(href: string) {
    const isActive =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(href + "/");

    return isActive
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";
  }

  return (
    <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-xl font-bold">
        SlugMarket
      </Link>

      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={getLinkClasses(link.href)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
