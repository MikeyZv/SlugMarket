import { fetchBookmarkCount, fetchProductById, fetchOfferCount } from "@/lib/fetchProducts";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react"
import ProductImageGallery from "../../../components/ProductImageGallery"
import DeleteButton from "../../../components/DeleteButton"
import EditButton from "../../../components/EditButton"
import MessageButton from "../../../components/MessageButton"
import MakeOfferButton from "../../../components/MakeOfferButton"
import ReviewsSection from "@/app/components/ReviewsSection";
import LeaveReviewButton from "@/app/components/LeaveReviewButton";
import ReportButton from "@/app/components/ReportButton";
import ShareButton from "@/app/components/ShareButton";

type ProductPageProps = {
    params: Promise<{
        id: string;
    }>;
};

// ProductPage component is responsible for displaying the details of a single product listing. 
// It fetches the product data based on the ID from the URL, retrieves the seller's profile information, and displays the product images, title, price, description, and seller information. 
// It also includes buttons for making an offer, sending a message to the seller, sharing the listing, and reporting it. 
// Additionally, if the current user is the seller, it shows edit and delete buttons for managing the listing.
export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await fetchProductById(id);

    if (!product) {
        return <p>Product not found</p>
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", product.seller_id)
        .single();

    const sellerUsername = profile?.username ?? "unknown";
    const sellerAvatarUrl = profile?.avatar_url ?? null;

    let buyerUsername: string | null = null;
    if (product.sold && product.buyer_id) {
        const { data: buyerProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", product.buyer_id)
            .single();
        buyerUsername = buyerProfile?.username ?? null;
    }

    const bookmarkCount = await fetchBookmarkCount(id);
    const offerCount = await fetchOfferCount(id);
    return (
        
        <main className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left image side */}
            <ProductImageGallery images={product.image_urls} title={product.title} product_id={product.id}/>
    
            {/* Right info side */}
            <section className="flex flex-col gap-6 min-w-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 mb-2">
                    {product.title}
                    </h1>

                    <p className="text-xl md:text-2xl font-normal text-gray-900 mb-4">
                        ${Number(product.price).toLocaleString()}
                    </p>

                    {/* Bookmarks */}
                    <p className="text-gray-600 text-lg">
                        {bookmarkCount} {bookmarkCount === 1 ? "bookmark" : "bookmarks"}
                    </p>

                    <p className="text-gray-600 text-lg">
                        {offerCount} {offerCount === 1 ? "offer" : "offers"}
                    </p>

                    <p className="text-gray-500 text-lg">
                        Listed {new Date(product.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>

            <div>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    {product.condition}
                </span>
            </div>

            {/* Review button that shows up only for confirmed buyer*/}
            <Suspense fallback={null}>
                <LeaveReviewButton
                    listingId={product.id}
                    sellerId={product.seller_id}
                    sellerUsername={sellerUsername}
                    listingTitle={product.title}
                    buyerId={product.buyer_id}
                    sold={product.sold}
                />
            </Suspense>

            <div className="flex flex-col gap-4">
                <MakeOfferButton listingPrice={product.price} listingId={product.id} listingTitle={product.title} listingImageUrl={product.image_urls[0]} sellerId={product.seller_id} sold={product.sold}/>
                <MessageButton otherUserId={product.seller_id} />
            </div>

    <hr className="border-gray-300" />

        <div>
            <h2 className="mb-3 text-xl md:text-2xl font-semibold text-gray-900">Description</h2>
                <p className="text-base md:text-[18px] md:leading-8 leading-7 text-gray-700 whitespace-pre-line break-words">
                    {product.description}
                </p>
        </div>

    <hr className="border-gray-300" />

    <div className="flex items-center gap-3">
        <a href={`/${sellerUsername}`} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-400 overflow-hidden flex items-center justify-center text-white font-bold shrink-0">
                {sellerAvatarUrl
                    ? <img src={sellerAvatarUrl} alt={sellerUsername} className="w-full h-full object-cover" />
                    : sellerUsername[0]?.toUpperCase()}
            </div>
            <span className="text-gray-900 font-medium">@{sellerUsername}</span>
        </a>
    </div>

    {/* ⭐ Seller Reviews Section ⭐ */}
    <ReviewsSection profileId={product.seller_id} />

    <div className="flex flex-col sm:flex-row gap-3">
        <EditButton productId={product.id} sellerId={product.seller_id}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#0F2044] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162d5a] transition cursor-pointer" />
        <ShareButton title={product.title}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-semibold text-[#0F2044] hover:bg-[#fde047] transition cursor-pointer" />
        <ReportButton sellerId={product.seller_id}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer" />
        <DeleteButton productId={product.id} sellerId={product.seller_id} imageUrls={product.image_urls}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500 transition cursor-pointer" />
    </div>

    {product.sold && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Sold</span>
            {buyerUsername ? (
                <span className="text-sm text-gray-700">
                    Sold to{" "}
                    <a href={`/${buyerUsername}`} className="font-semibold text-gray-900 hover:underline">
                        @{buyerUsername}
                    </a>
                </span>
            ) : (
                <span className="text-sm text-gray-500">This item has been sold.</span>
            )}
        </div>
    )}

        </section>
            </div>
        </main>
    )
}