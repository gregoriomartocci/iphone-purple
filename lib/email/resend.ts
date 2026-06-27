import { Resend } from "resend";
import type { Order } from "@/types";
import { formatARS } from "@/utils/format";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "placeholder");
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@iphonepurple.com.ar";
const STORE_NAME = "iPhone Purple";

export async function sendOrderConfirmation(order: Order, email: string) {
  const itemsList = order.items
    ?.map(
      (item) =>
        `<tr>
          <td style="padding:10px;border-bottom:1px solid #1A1A26;color:#fff">${item.product_name} — ${item.variant_name}</td>
          <td style="padding:10px;border-bottom:1px solid #1A1A26;color:#A0A0B8;text-align:center">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #1A1A26;color:#9B59D0;text-align:right;font-family:monospace">${formatARS(item.total)}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: `${STORE_NAME} <${FROM}>`,
    to: email,
    subject: `Tu pedido #${order.order_number} fue confirmado 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0A0A0F;font-family:Inter,sans-serif;margin:0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#12121A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
          <div style="background:linear-gradient(135deg,#7B2FBE,#C026D3);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">¡Pedido confirmado!</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Pedido #${order.order_number}</p>
          </div>
          <div style="padding:28px">
            <p style="color:#A0A0B8;font-size:14px;line-height:1.6">
              Hola! Tu compra fue procesada exitosamente. Acá te dejamos el resumen:
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <thead>
                <tr>
                  <th style="padding:10px;text-align:left;color:#6B6B80;font-size:12px;border-bottom:1px solid #1A1A26">Producto</th>
                  <th style="padding:10px;text-align:center;color:#6B6B80;font-size:12px;border-bottom:1px solid #1A1A26">Cant.</th>
                  <th style="padding:10px;text-align:right;color:#6B6B80;font-size:12px;border-bottom:1px solid #1A1A26">Total</th>
                </tr>
              </thead>
              <tbody>${itemsList}</tbody>
            </table>
            <div style="background:#1A1A26;border-radius:12px;padding:16px;margin:20px 0">
              <div style="display:flex;justify-content:space-between;color:#A0A0B8;font-size:13px;margin-bottom:8px">
                <span>Subtotal</span><span style="font-family:monospace">${formatARS(order.subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;color:#A0A0B8;font-size:13px;margin-bottom:8px">
                <span>Envío</span><span style="font-family:monospace">${order.shipping === 0 ? "Gratis" : formatARS(order.shipping)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;color:#fff;font-size:16px;font-weight:900;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;margin-top:8px">
                <span>Total</span><span style="font-family:monospace;color:#9B59D0">${formatARS(order.total)}</span>
              </div>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/cuenta/pedidos" style="display:block;background:linear-gradient(135deg,#7B2FBE,#C026D3);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:14px">
              Rastrear mi pedido →
            </a>
          </div>
          <div style="padding:20px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
            <p style="color:#6B6B80;font-size:12px;margin:0">
              iPhone Purple • Buenos Aires, Argentina<br>
              <a href="https://wa.me/5491100000000" style="color:#7B2FBE">WhatsApp</a> •
              <a href="mailto:hola@iphonepurple.com.ar" style="color:#7B2FBE">hola@iphonepurple.com.ar</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendOrderShipped(order: Order, email: string) {
  await getResend().emails.send({
    from: `${STORE_NAME} <${FROM}>`,
    to: email,
    subject: `Tu pedido #${order.order_number} está en camino 🚚`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0A0A0F;font-family:Inter,sans-serif;margin:0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#12121A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
          <div style="background:linear-gradient(135deg,#0369A1,#0EA5E9);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">¡Tu pedido fue enviado!</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Pedido #${order.order_number}</p>
          </div>
          <div style="padding:28px">
            <p style="color:#A0A0B8;font-size:14px;line-height:1.6">
              Tu pedido está en camino. Podés rastrearlo con el número de seguimiento:
            </p>
            ${order.tracking_number ? `
            <div style="background:#1A1A26;border-radius:12px;padding:16px;margin:20px 0;text-align:center">
              <p style="color:#6B6B80;font-size:12px;margin:0 0 8px">Número de seguimiento</p>
              <p style="color:#9B59D0;font-size:20px;font-weight:900;font-family:monospace;margin:0">${order.tracking_number}</p>
            </div>
            ` : ""}
            ${order.estimated_delivery ? `
            <p style="color:#A0A0B8;font-size:13px;text-align:center">
              Entrega estimada: <strong style="color:#fff">${new Date(order.estimated_delivery).toLocaleDateString("es-AR", { weekday: "long", month: "long", day: "numeric" })}</strong>
            </p>
            ` : ""}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/cuenta/pedidos" style="display:block;background:linear-gradient(135deg,#7B2FBE,#C026D3);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:14px;margin-top:20px">
              Ver seguimiento →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendOrderDelivered(order: Order, email: string) {
  await getResend().emails.send({
    from: `${STORE_NAME} <${FROM}>`,
    to: email,
    subject: `¡Tu pedido #${order.order_number} fue entregado! ⭐ ¿Cómo fue tu experiencia?`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0A0A0F;font-family:Inter,sans-serif;margin:0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#12121A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
          <div style="background:linear-gradient(135deg,#059669,#10B981);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">¡Lo recibiste!</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Pedido #${order.order_number} entregado</p>
          </div>
          <div style="padding:28px;text-align:center">
            <p style="color:#A0A0B8;font-size:14px;line-height:1.6;margin-bottom:20px">
              ¡Esperamos que estés disfrutando tu nuevo equipo! Tu opinión es muy importante para nosotros.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/catalogo" style="display:inline-block;background:linear-gradient(135deg,#7B2FBE,#C026D3);color:#fff;text-decoration:none;text-align:center;padding:14px 28px;border-radius:12px;font-weight:700;font-size:14px;margin-bottom:12px">
              Dejá tu reseña ⭐
            </a>
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/plan-canje" style="color:#7B2FBE;font-size:13px;text-decoration:none">
              ¿Querés canjear otro equipo? →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendWelcome(name: string, email: string) {
  await getResend().emails.send({
    from: `${STORE_NAME} <${FROM}>`,
    to: email,
    subject: `Bienvenido/a a iPhone Purple 💜`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background:#0A0A0F;font-family:Inter,sans-serif;margin:0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#12121A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">
          <div style="background:linear-gradient(135deg,#7B2FBE,#C026D3);padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900">Bienvenido/a, ${name}! 💜</h1>
          </div>
          <div style="padding:28px">
            <p style="color:#A0A0B8;font-size:14px;line-height:1.6">
              Estamos muy contentos de tenerte en nuestra comunidad. En iPhone Purple encontrás los mejores equipos con garantía oficial al precio más justo de Argentina.
            </p>
            <div style="background:#1A1A26;border-radius:12px;padding:20px;margin:20px 0">
              <p style="color:#fff;font-weight:700;margin:0 0 12px;font-size:15px">Lo que podés hacer:</p>
              ${["Explorar el catálogo de iPhone y Samsung", "Cotizar tu equipo con el Plan Canje", "Guardar favoritos en tu wishlist", "Hacer seguimiento en tiempo real de tus pedidos"]
                .map((item) => `<p style="color:#A0A0B8;font-size:13px;margin:6px 0;padding-left:16px">✓ ${item}</p>`)
                .join("")}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/catalogo" style="display:block;background:linear-gradient(135deg,#7B2FBE,#C026D3);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:700;font-size:14px">
              Explorar el catálogo →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
