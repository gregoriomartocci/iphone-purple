import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  shippingAddress: z.object({
    full_name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    street: z.string(),
    number: z.string(),
    floor: z.string().optional(),
    city: z.string(),
    province: z.string(),
    zip: z.string(),
    country: z.string().default("Argentina"),
  }),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["mercadopago", "stripe", "cash"]),
  currency: z.enum(["ARS", "USD"]).default("ARS"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = createOrderSchema.parse(body);
    const supabase = await createAdminClient();

    // Validate stock and get product info
    const variantIds = data.items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, sku, name, price_ars, stock, product:products(name, images:product_images(url, is_primary))")
      .in("id", variantIds);

    if (variantsError || !variants) {
      return NextResponse.json({ error: "Error al validar productos" }, { status: 400 });
    }

    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variante ${item.variantId} no encontrada` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${variant.name}` }, { status: 400 });
      }
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 200000 ? 0 : 8500;
    let discount = 0;

    if (data.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        if (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) {
          if (!coupon.max_uses || coupon.used_count < coupon.max_uses) {
            if (subtotal >= coupon.min_purchase) {
              discount = coupon.type === "percentage"
                ? Math.round((coupon.value / 100) * subtotal)
                : coupon.type === "fixed_amount"
                ? coupon.value
                : shipping;
            }
          }
        }
      }
    }

    const total = subtotal + shipping - discount;

    // Generate order number
    const { data: orderNumberResult } = await supabase.rpc("generate_order_number");
    const orderNumber = orderNumberResult ?? `IPP-${new Date().getFullYear()}-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: session?.user?.id ?? null,
        guest_email: session?.user?.id ? null : data.shippingAddress.email,
        status: "pending",
        payment_status: "pending",
        payment_method: data.paymentMethod,
        currency: data.currency,
        subtotal,
        discount,
        shipping,
        total,
        shipping_address: data.shippingAddress,
        metadata: {},
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
    }

    // Create order items
    const orderItems = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      // Supabase returns nested relations as arrays in the join result
      const productRaw = Array.isArray(variant.product) ? variant.product[0] : variant.product;
      const product = productRaw as { name: string; images: { url: string; is_primary: boolean }[] };
      const primaryImage = product?.images?.find((i) => i.is_primary)?.url ?? product?.images?.[0]?.url;
      return {
        order_id: order.id,
        variant_id: item.variantId,
        product_name: product.name,
        variant_name: variant.name,
        product_image: primaryImage ?? null,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      };
    });

    await supabase.from("order_items").insert(orderItems);

    // Create first order event
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "pending",
      message: "Pedido creado. Esperando confirmación de pago.",
    });

    return NextResponse.json({ orderId: order.id, orderNumber, total });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
