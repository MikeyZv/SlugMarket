import { fetchProductById } from "@/lib/fetchProducts";
import { supabase } from "@/lib/supabase";
import ProductImageGallery from "../../../components/ProductImageGallery"

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
        .select("username")
        .eq("id", product.seller_id)
        .single();

    const sellerUsername = profile?.username ?? "unknown";

    if (!product) {
        return <p>Product not found</p>
    }

    return (
        
        <main className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left image side */}
            <ProductImageGallery images={product.image_urls} title={product.title}/>
            {/* Right info side */}
            <section className="flex flex-col gap-6">
                <div>
                    <h1 className="text-5xl font-bold leading-tight text-gray-900 mb-2">
                    {product.title}
                    </h1>

                    <p className="text-2xl font-normal text-gray-900 mb-4">
                        ${Number(product.price).toLocaleString()}
                    </p>

                    <p className="text-gray-500 text-lg">
                        Listed Apr 26 in Santa Cruz, CA
                    </p>
                </div>

            <div>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                    {product.condition}
                </span>
            </div>

            <div className="flex flex-col gap-4">
                <button className="w-full rounded-xl bg-[#3567F1] py-4 text-2xl font-semibold text-white shadow-sm transition hover:bg-[#2f5de0]">
                    Message
                </button>

            <div className="grid grid-cols-2 gap-4">
                <button className="rounded-xl border-2 border-black bg-white py-2 text-xl font-semibold text-black transition hover:bg-gray-50">
                    Share
                </button>

                <button className="rounded-xl border-2 border-black bg-white py-2 text-xl font-semibold text-black transition hover:bg-gray-50">
                    Report
                </button>
            </div>
    </div>

    <hr className="border-gray-300" />

        <div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Description</h2>
                <p className="text-[18px] leading-8 text-gray-700 whitespace-pre-line">
                    {product.description}
                </p>
        </div>

    <hr className="border-gray-300" />

    <div className="flex items-center gap-3">
        <a href={`/${sellerUsername}`} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <span className="text-gray-900 font-medium">@{sellerUsername}</span>
        </a>
    </div>

    <p className="text-base text-gray-600">Local pickup available in Santa Cruz, CA</p>
        </section>
            </div>
        </main>
    )
}