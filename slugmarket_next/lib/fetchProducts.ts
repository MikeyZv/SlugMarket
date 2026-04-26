// lib/fetchProducts.ts
import { supabase } from "./supabase";

export async function fetchProducts(tableName: string) {
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data;
}
