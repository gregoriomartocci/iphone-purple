import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body;

  if (type !== "payment") {
    return NextResponse.json({ received: true });
  }

  const paymentId = data?.id;
  if (!paymentId) {
    return NextResponse.json({ error: "No payment ID" }, { status: 400 });
  }

  try {
    // Fetch payment from MP API
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });
    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      return NextResponse.json({ error: "MP API error" }, { status: 500 });
    }

    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createAdminClient();

    let orderStatus: string;
    let paymentStatus: string;

    switch (payment.status) {
      case "approved":
        orderStatus = "confirmed";
        paymentStatus = "paid";
        break;
      case "rejected":
      case "cancelled":
        orderStatus = "pending";
        paymentStatus = "failed";
        break;
      case "refunded":
        orderStatus = "refunded";
        paymentStatus = "refunded";
        break;
      default:
        return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        payment_id: paymentId.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await supabase.from("order_events").insert({
      order_id: orderId,
      status: orderStatus,
      message:
        paymentStatus === "paid"
          ? "Pago confirmado por Mercado Pago."
          : "Pago rechazado.",
      metadata: { payment_id: paymentId, mp_status: payment.status },
    });

    // Reduce stock if paid
    if (paymentStatus === "paid") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", orderId);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase.rpc("decrement_stock", {
            variant_id: item.variant_id,
            amount: item.quantity,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
