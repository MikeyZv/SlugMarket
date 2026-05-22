import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// This API route handles POST requests to filter products based on category, price range, and condition. It constructs a query based on the provided filters and returns the matching products from the database.
export async function POST(req: Request) {
  const { category, minPrice, maxPrice, condition} = await req.json();

  let query = supabase.from("product_listings").select("*").eq("sold", false);

  if (category) query = query.eq("category", category);
  if (condition) query = query.eq("condition", condition)
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ products: data });
}
