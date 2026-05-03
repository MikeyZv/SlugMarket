// lib/fetchProducts.ts
import { supabase } from "./supabase";

// Helper function to fetch all products for home page
export async function fetchProducts(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}

// Helper function to fetch a single product by ID fpr product details page
export async function fetchProductById(id: string) {
  const { data, error } = await supabase.from("product_listings").select("*").eq("id", id).single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
    return null;
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
