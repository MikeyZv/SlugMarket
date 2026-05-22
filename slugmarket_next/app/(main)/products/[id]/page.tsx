import { fetchBookmarkCount, fetchProductById } from "@/lib/fetchProducts";
import { supabase } from "@/lib/supabase";
import ProductImageGallery from "../../../components/ProductImageGallery"
import DeleteButton from "../../../components/DeleteButton"
import EditButton from "../../../components/EditButton"

type ProductPageProps = {
    params: Promise<{
        id: string;
    }>;
};

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

    const bookmarkCount = await fetchBookmarkCount(id);
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

                    <p className="text-gray-500 text-lg">
                        Listed {new Date(product.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>

            <div>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    {product.condition}
                </span>
            </div>

            <div className="flex flex-col gap-4">
                <button className="w-full rounded-xl bg-[#3567F1] py-3 md:py-4 text-lg md:text-2xl font-semibold text-white shadow-sm transition hover:bg-[#2f5de0]">
                    Message
                </button>

            <div className="grid grid-cols-2 gap-4">
                <button className="rounded-xl border-2 border-black bg-white py-2 text-base md:text-xl font-semibold text-black transition hover:bg-gray-50">
                    Share
                </button>

                <button className="rounded-xl border-2 border-black bg-white py-2 text-base md:text-xl font-semibold text-black transition hover:bg-gray-50">
                    Report
                </button>
            </div>
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

    <EditButton productId={product.id} sellerId={product.seller_id} />
    <DeleteButton productId={product.id} sellerId={product.seller_id} imageUrls={product.image_urls} />
        </section>
            </div>
        </main>
    )
}