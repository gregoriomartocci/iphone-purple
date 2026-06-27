import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const marca = searchParams.getAll("marca");
  const sort = searchParams.get("sort") ?? "relevancia";
  const featured = searchParams.get("featured");
  const limit = parseInt(searchParams.get("limit") ?? "24");
  const page = parseInt(searchParams.get("page") ?? "1");

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(
        `
        *,
        brand:brands(id, name, slug, logo_url),
        category:categories(id, name, slug),
        variants:product_variants(id, name, price_ars, price_usd, compare_price_ars, stock, attributes, is_active),
        images:product_images(id, url, alt, is_primary, sort_order)
        `
      )
      .eq("status", "active");

    if (categoria) {
      query = query.ilike("category.slug", categoria);
    }
    if (marca.length > 0) {
      query = query.in("brand.slug", marca);
    }
    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    switch (sort) {
      case "precio-asc":
        query = query.order("variants.price_ars", { ascending: true });
        break;
      case "precio-desc":
        query = query.order("variants.price_ars", { ascending: false });
        break;
      case "nuevo":
        query = query.order("created_at", { ascending: false });
        break;
      case "bestseller":
        query = query.eq("is_bestseller", true);
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data, total: count, page, limit });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
