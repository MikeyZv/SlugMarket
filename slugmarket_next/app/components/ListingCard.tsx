import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";

type ListingCardProps = {
  listing: Listing;
  priority?: boolean;
  onSelectListing?: () => void;
}

const cardStyle = "block rounded-xl border p-4 shadow-sm min-w-[250px] hover:shadow-md transition-shadow"

// This component renders a card for a product listing. It displays the product image, title, and price, and links to the product detail page.
export default function ListingCard({ listing, priority, onSelectListing}: ListingCardProps) {
  const content = (
    <>
      <div className="mb-3 flex h-40 items-center justify-center rounded-lg bg-gray-100 overflow-hidden relative">
        <Image
          src={listing.image_urls[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover rounded-lg"
          priority={priority}
        />
        {listing.sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-900 shadow">
              Sold
            </span>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold">{listing.title}</h2>
      <p className="mt-2 font-bold">${listing.price}</p>
    </>
  )

  if (onSelectListing) {
    return (
      <button type="button" onClick={onSelectListing} className={cardStyle}>
        {content}
      </button>
    )
  }

  return (
    <Link href={`/products/${listing.id}`} className={cardStyle}>
      {content}
    </Link>
  )
}