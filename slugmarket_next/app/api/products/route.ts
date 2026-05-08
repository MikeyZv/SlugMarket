import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { category, minPrice, maxPrice } = await req.json();

  let query = supabase.from("product_listings").select("*");

  if (category) query = query.eq("category", category);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  const { data, error } = await query;

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ products: data });
}
