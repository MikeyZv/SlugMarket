import Image from "next/image";
export const mockListings = [
  {
    id: 1,
    title: "Desk Lamp",
    price: 15,
    description: "Small LED desk lamp in good condition.",
    condition: "Good",
    image_urls: [],
  },
  {
    id: 2,
    title: "Mini Fridge",
    price: 80,
    description: "Works well and is perfect for a dorm room.",
    condition: "Used",
    image_urls: [],
  },
  {
    id: 3,
    title: "Calculus Textbook",
    price: 25,
    description: "Some highlighting, but still in solid condition.",
    condition: "Fair",
    image_urls: [],
  },
];

type Listing = {
  id: number;
  title: string;
  price: number;
  description: string;
  condition: string;
  image_urls: string[];
};

export default function ListingCard({ listing, priority }: { listing: Listing; priority?: boolean }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm min-w-[250px]">
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
      <p className="text-sm text-gray-500">{listing.condition ?? "Used"}</p>
      <p className="mt-2 font-bold">${listing.price}</p>
      {listing.description && (
        <p className="mt-2 text-sm text-gray-700">{listing.description}</p>
      )}
    </div>
  );
}