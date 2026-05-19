import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";

// This component renders a card for a product listing. It displays the product image, title, and price, and links to the product detail page.
export default function ListingCard({ listing, priority }: { listing: Listing; priority?: boolean }) {
  return (
    <Link href={`/products/${listing.id}`} className="block rounded-xl border p-4 shadow-sm min-w-[250px] hover:shadow-md transition-shadow">
      <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100 overflow-hidden relative">
        <Image
          src={listing.image_urls[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover rounded-lg"
          priority={priority}
        />
      </div>

      <h2 className="text-lg font-semibold">{listing.title}</h2>
      <p className="mt-2 font-bold">${listing.price}</p>
    </Link>
  );
}