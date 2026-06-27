import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { orderId } = schema.parse(body);

    const supabase = await createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Build MP preference
    const preference = {
      external_reference: orderId,
      items: order.items.map((item: { product_name: string; variant_name: string; quantity: number; price: number; product_image: string }) => ({
        id: item.product_name,
        title: `${item.product_name} — ${item.variant_name}`,
        quantity: item.quantity,
        unit_price: item.price,
        picture_url: item.product_image,
      })),
      payer: {
        email: order.shipping_address?.email ?? session?.user?.email,
        name: order.shipping_address?.full_name,
        phone: { number: order.shipping_address?.phone },
        address: {
          street_name: order.shipping_address?.street,
          street_number: order.shipping_address?.number,
          zip_code: order.shipping_address?.zip,
        },
      },
      shipments: {
        cost: order.shipping,
        mode: "not_specified",
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmacion?order=${order.order_number}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/cuenta/pedidos`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      statement_descriptor: "IPHONEPURPLE",
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      return NextResponse.json({ error: "Error al crear preferencia de pago" }, { status: 500 });
    }

    return NextResponse.json({
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
