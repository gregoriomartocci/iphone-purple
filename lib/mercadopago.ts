import "server-only";

/**
 * Pasarela de pago.
 *
 * Sigue el mismo criterio que el resto del proyecto: si hay credenciales, se
 * usa; si no, el sitio sigue andando y el pedido se cierra por WhatsApp. Lo
 * que NO hace es simular que cobra. Un botón de pago que no cobra se descubre
 * en el peor momento posible, que es con la persona decidida a comprar.
 *
 * El token vive solo en el servidor: este módulo está marcado con
 * `server-only`, así que si alguien lo importa desde un componente de cliente
 * el build falla en vez de filtrar la credencial al navegador.
 */

const API = "https://api.mercadopago.com/checkout/preferences";

/** Si el pago online está realmente disponible. */
export function pagoConfigurado(): boolean {
  const token = process.env.MP_ACCESS_TOKEN ?? "";
  // Un token real de Mercado Pago arranca con APP_USR- o TEST- y es largo.
  return /^(APP_USR|TEST)-/.test(token) && token.length > 30;
}

export type ItemPago = {
  titulo: string;
  cantidad: number;
  precioUnitario: number;
};

/**
 * Crea la preferencia y devuelve la URL a la que hay que mandar a la persona.
 *
 * Devuelve `null` en vez de tirar cuando no está configurado, para que quien
 * llame pueda ofrecer el camino alternativo sin envolver todo en un try.
 */
export async function crearPreferencia({
  items,
  email,
  referencia,
  urlBase,
}: {
  items: ItemPago[];
  email: string;
  /** Identificador del pedido, para reconciliar después. */
  referencia: string;
  urlBase: string;
}): Promise<string | null> {
  if (!pagoConfigurado()) return null;

  const respuesta = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: items.map((i) => ({
        title: i.titulo,
        quantity: i.cantidad,
        unit_price: i.precioUnitario,
        currency_id: "ARS",
      })),
      payer: { email },
      external_reference: referencia,
      back_urls: {
        success: `${urlBase}/checkout/gracias?estado=aprobado`,
        pending: `${urlBase}/checkout/gracias?estado=pendiente`,
        failure: `${urlBase}/checkout?estado=rechazado`,
      },
      auto_return: "approved",
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(
      `Mercado Pago respondió ${respuesta.status}: ${detalle.slice(0, 200)}`
    );
  }

  const datos = (await respuesta.json()) as { init_point?: string };
  return datos.init_point ?? null;
}
