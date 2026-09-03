"use server";

import { z } from "zod";
import { crearPreferencia, pagoConfigurado } from "@/lib/mercadopago";
import { turnoValido } from "@/lib/turnos";

/**
 * Confirmación del pedido.
 *
 * Todo lo que llega del formulario se vuelve a validar acá. El navegador ya
 * valida para dar buen feedback, pero esa validación es una cortesía: el
 * servidor no puede confiar en ella, porque cualquiera puede mandar el pedido
 * sin pasar por el formulario.
 */

const ItemSchema = z.object({
  nombre: z.string().min(1).max(200),
  variante: z.string().max(200),
  cantidad: z.number().int().min(1).max(20),
  precioArs: z.number().positive().max(100_000_000),
});

const PedidoSchema = z
  .object({
    items: z.array(ItemSchema).min(1, "El carrito está vacío."),
    nombre: z.string().trim().min(2, "Necesitamos tu nombre."),
    // Sin `.trim()` antes de `.email()` un espacio pegado invalida un mail bueno.
    email: z.string().trim().toLowerCase().email("Revisá el correo, no parece válido."),
    telefono: z.string().trim().min(6, "Necesitamos un teléfono para coordinar."),
    entrega: z.enum(["retiro", "envio"]),
    direccion: z.string().trim().max(300).optional(),
    fecha: z.string().optional(),
    hora: z.string().optional(),
    notas: z.string().trim().max(600).optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.entrega === "envio" && (datos.direccion ?? "").length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["direccion"],
        message: "Poné la dirección completa con calle, número y localidad.",
      });
    }
    if (datos.entrega === "retiro") {
      if (!datos.fecha || !datos.hora) {
        ctx.addIssue({
          code: "custom",
          path: ["fecha"],
          message: "Elegí día y horario.",
        });
      } else if (!turnoValido(datos.fecha, datos.hora)) {
        // Cubre el caso de un turno que quedó viejo en una pestaña abierta.
        ctx.addIssue({
          code: "custom",
          path: ["fecha"],
          message: "Ese turno ya no está disponible. Elegí otro.",
        });
      }
    }
  });

export type Pedido = z.infer<typeof PedidoSchema>;

/**
 * Resultado del pedido, con un discriminante explícito.
 *
 * Sin `modo`, TypeScript no puede separar las dos ramas de éxito mirando solo
 * la URL: una cadena vacía también es falsa, así que el estrechamiento por
 * verdad no alcanza y el campo de la otra rama queda inaccesible.
 */
export type ResultadoPedido =
  | { ok: true; modo: "pagar"; url: string }
  | { ok: true; modo: "reservado"; referencia: string }
  | { ok: false; error: string };

export async function confirmarPedido(datos: unknown): Promise<ResultadoPedido> {
  const parseo = PedidoSchema.safeParse(datos);
  if (!parseo.success) {
    return { ok: false, error: parseo.error.issues[0]?.message ?? "Revisá los datos." };
  }
  const pedido = parseo.data;

  // Referencia corta y legible, para nombrar el pedido al hablarlo por teléfono.
  const referencia = `IP-${Date.now().toString(36).toUpperCase()}`;

  // El retiro no pasa por la pasarela: se paga en el local al retirarlo.
  if (pedido.entrega === "retiro" || !pagoConfigurado()) {
    return { ok: true, modo: "reservado", referencia };
  }

  try {
    const urlBase = process.env.NEXT_PUBLIC_APP_URL ?? "https://iphonepurple.com.ar";
    const destino = await crearPreferencia({
      items: pedido.items.map((i) => ({
        titulo: `${i.nombre} — ${i.variante}`.slice(0, 250),
        cantidad: i.cantidad,
        precioUnitario: i.precioArs,
      })),
      email: pedido.email,
      referencia,
      urlBase,
    });

    if (!destino) return { ok: true, modo: "reservado", referencia };
    return { ok: true, modo: "pagar", url: destino };
  } catch (err) {
    // Si la pasarela falla, el pedido no se pierde: se sigue por WhatsApp.
    console.error("[checkout] Mercado Pago falló:", err);
    return { ok: true, modo: "reservado", referencia };
  }
}
