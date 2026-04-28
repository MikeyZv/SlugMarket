import { fetchProductById } from "@/lib/fetchProducts";
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

    return (
        
        <main className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left image side */}
            <ProductImageGallery images={product.image_urls} title={product.title}/>
    
            {/* Right info side */}
            <section>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {product.title}
                </h1>
    
                <p className="text-2xl font-semibold text-gray-900 mb-4">
                    ${product.price}
                </p>
    
                <div className="text-gray-600 mb-6">
                    <p>Condition: {product.condition}</p>
                </div>
    
                <div className="flex flex-col gap-3 mb-8">
                    <button className="w-full border border-black py-3 rounded-md font-semibold hover:bg-gray-100">
                        Message Seller
                    </button>
        
                    <div className="grid grid-cols-3 gap-3">
                        <button className="border border-black py-3 rounded-md font-semibold hover:bg-gray-100">
                            Bookmark
                        </button>

                        <button className="border border-black py-3 rounded-md font-semibold hover:bg-gray-100">
                            Share
                        </button>

                        <button className="border border-black py-3 rounded-md font-semibold hover:bg-gray-100">
                            Report
                        </button>
                    </div>
                </div>
    
                <hr className="my-6" />
    
                <div>
                    <h2 className="text-lg font-semibold mb-2">Details</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {product.description}
                    </p>
                </div>
    
                <hr className="my-6" />
    
                <div className="text-sm text-gray-600 space-y-2">
                    <p>Listed by UCSC student</p>
                </div>
                </section>
            </div>
        </main>
    )
}