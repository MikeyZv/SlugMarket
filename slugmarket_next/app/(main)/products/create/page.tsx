import ProductListingForm from "@/app/components/ProductListingForm"

// This page renders the form for creating a new product listing. 
// It uses the ProductListingForm component in "create" mode, which allows users to input details for a new product and submit it to the marketplace. 
// The form handles all necessary fields and validation for creating a listing.
export default function CreateListingPage() {
  return <ProductListingForm mode="create" />
}