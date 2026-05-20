// lib/fetchProducts.ts
import { supabase } from "./supabase";

// Helper function to fetch all products for home page
export async function fetchProducts() {
  const { data, error } = await supabase.from("product_listings").select("*");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}

// Helper function to fetch a single product by ID fpr product details page
export async function fetchProductById(id: string) {
  const { data, error } = await supabase.from("product_listings").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }

  return data;
}

// Helper function to fetch products by seller ID for profile page
export async function fetchProductsBySellerId(sellerId: string) {
  const { data, error } = await supabase
    .from("product_listings")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("sold", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }

  return data;
}

// Helper function to fetch sold listings by seller ID for profile page
export async function fetchSoldListingsBySellerId(sellerId: string) {
  const { data, error } = await supabase
    .from("product_listings")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("sold", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchBookmarkedProducts(userId: string) {
  const { data: bookmarks, error: bookmarkError } = await supabase
    .from("bookmarks")
    .select("product_id")
    .eq("user_id", userId);

  if (bookmarkError) {
    console.error("Supabase bookmark error:", bookmarkError);
    throw new Error(bookmarkError.message);
  }

  const productIds = bookmarks?.map((bookmark) => bookmark.product_id) ?? [];

  if (productIds.length === 0) {
    return [];
  }

  const { data: products, error: productError } = await supabase
    .from("product_listings")
    .select("*")
    .in("id", productIds);

  if (productError) {
    console.error("Supabase product error:", productError);
    throw new Error(productError.message);
  }

  return products ?? [];
}

export async function fetchProductByQuery(query: string) {
  const q = query.trim()
  if (!q) return []

  const { data, error } = await supabase
    .from("product_listings")
    .select("*")
    .eq("sold", false)
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    .order("created_at", { ascending: false})

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(error.message)
    }

    return data ?? []
}

export async function fetchBookmarkCount(listingId: string) {
  try {
    console.log(listingId)
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")

    if (error) {
      console.error("Error fetching bookmark count:", error);
      throw new Error("Failed to fetch bookmark count");
    }
    console.log(data)
    return data?.length ?? 0;
  } catch (err) {
    console.error("Unexpected error in fetchBookmarkCount:", err);
    throw err;
  }
}