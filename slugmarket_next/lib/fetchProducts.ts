// lib/fetchProducts.ts
import { supabase } from "./supabase";

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("listings")
    .select("*");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}
