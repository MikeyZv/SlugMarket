import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";

type ListingCardProps = {
  listing: Listing;
  priority?: boolean;
  onSelectListing?: () => void;
}

const cardStyle = "block rounded-xl overflow-hidden min-w-[250px] relative aspect-[4/3] hover:shadow-lg transition-shadow text-left cursor-pointer"

export default function ListingCard({ listing, priority, onSelectListing}: ListingCardProps) {
  const content = (
    <>
      <Image
        src={listing.image_urls[0]}
        alt={listing.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        priority={priority}
      />

      {listing.sold && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-900 shadow">
            Sold
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h2 className="text-lg font-semibold text-white">{listing.title}</h2>
        <p className="mt-1 font-bold text-white">${listing.price}</p>
      </div>
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
