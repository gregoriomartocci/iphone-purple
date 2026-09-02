import type { Product } from "@/types";

/**
 * Preguntas frecuentes de la ficha de producto.
 *
 * Son distintas de las de la portada: acá la persona ya eligió un equipo y las
 * dudas que le quedan son las de cerrar la compra —si viene con caja, si se
 * puede probar antes, si le sirve su chip—, no las de conocer el negocio.
 *
 * Algunas se arman con el equipo concreto para que la respuesta sea la que
 * corresponde: a un sellado no tiene sentido explicarle la salud de batería.
 */
function preguntas(product: Product, esSellado: boolean): { q: string; a: string }[] {
  const nombre = product.name;

  const comunes = [
    {
      q: `¿Puedo ver y probar el ${nombre} antes de pagar?`,
      a: "Sí. Coordinás por WhatsApp y lo revisás en el local: encendido, cámara, altavoces, batería y que no tenga bloqueo. Recién ahí cerrás la operación.",
    },
    {
      q: "¿Cómo se paga?",
      a: "Efectivo, transferencia o tarjeta, y lo coordinamos al confirmar el pedido. El precio publicado es el final: no hay cargos que aparezcan después.",
    },
    {
      q: "¿Hace falta crear una cuenta para comprar?",
      a: "No. Agregás el equipo al carrito y confirmás con tu nombre y un contacto. La cuenta es opcional.",
    },
    {
      q: "¿Hacen envíos?",
      a: "Sí, a todo el país. También podés retirarlo en el local de La Plata sin costo.",
    },
    {
      q: "¿Puedo entregar mi equipo actual como parte de pago?",
      a: "Sí. Cotizalo en el Plan Canje del sitio, te decimos cuánto te tomamos y pagás solo la diferencia.",
    },
    {
      q: "¿Qué garantía tiene?",
      a: "Seis meses por escrito, con factura, y servicio técnico propio. Si falla dentro del plazo lo resolvemos nosotros.",
    },
  ];

  const segunCondicion = esSellado
    ? [
        {
          q: `¿El ${nombre} sellado viene en caja cerrada?`,
          a: "Sí, sin abrir y con todos sus accesorios de fábrica. Se abre delante tuyo al momento de la entrega si querés.",
        },
        {
          q: "¿Está libre para cualquier compañía?",
          a: "Sí, viene liberado de fábrica y funciona con cualquier operador del país.",
        },
      ]
    : [
        {
          q: "¿Qué significa la salud de batería que figura?",
          a: "Es la capacidad que conserva la batería respecto de una nueva, tal como la informa el propio equipo en Ajustes. La publicamos siempre y es la real de esta unidad.",
        },
        {
          q: "¿El equipo tiene piezas originales?",
          a: "Sí. Verificamos pantalla, batería y cámara antes de publicarlo, y si alguna pieza fue reemplazada lo aclaramos en la descripción.",
        },
        {
          q: "¿Está libre y sin bloqueo de iCloud?",
          a: "Sí. Chequeamos que esté liberado, sin bloqueo de iCloud y sin denuncia de IMEI antes de ponerlo a la venta.",
        },
      ];

  return [...segunCondicion, ...comunes];
}

export function FaqProducto({
  product,
  esSellado,
}: {
  product: Product;
  esSellado: boolean;
}) {
  const lista = preguntas(product, esSellado);

  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Preguntas frecuentes</h2>

      {/* `<details>` nativo: abre y cierra sin JavaScript, anda con teclado y
          lector de pantalla, y el buscador lee el texto aunque esté plegado. */}
      <div className="border-line mt-8 border-t">
        {lista.map(({ q, a }) => (
          <details key={q} className="border-line group border-b">
            <summary className="hover:text-purple flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium transition-colors">
              {q}
              <span
                aria-hidden
                className="text-muted-foreground shrink-0 text-xl leading-none transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-muted-foreground prosa pb-4 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: lista.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        }}
      />
    </section>
  );
}
