import { notFound } from "next/navigation"
import { fetchProductById } from "@/lib/fetchProducts"
import ProductListingForm from "@/app/components/ProductListingForm"

// EditListingPage component is responsible for rendering the form to edit an existing product listing.
// It fetches the product data based on the ID from the URL and passes it to the ProductListingForm component for editing.
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
                condition: product.condition,
                category: product.category ?? ''
            }}
            initialImageUrls={product.image_urls}
        />
    )
}