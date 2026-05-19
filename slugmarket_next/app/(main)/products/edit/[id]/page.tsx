import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/fetchProducts"
import ProductListingForm from "@/app/components/ProductListingForm"

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await fetchProductById(id)

    if (!product) notFound()

    return (
        <ProductListingForm
            mode="edit"
            listingId={product.id}
            initialForm={{
                title: product.title,
                price: String(product.price),
                description: product.description,
                condition: product.condition
            }}
            initialImageUrls={product.image_urls}
        />
    )
}