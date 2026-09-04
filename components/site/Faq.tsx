/**
 * Preguntas frecuentes.
 *
 * Cumple dos funciones a la vez y por eso está en la portada y no escondida:
 * responde lo que la gente pregunta por WhatsApp antes de comprar —lo que
 * ahorra mensajes— y le da a Google contenido con las palabras con las que
 * realmente se busca ("cuánto sale", "tienen garantía", "hacen envíos").
 *
 * Va con `<details>` nativo: se abre y cierra sin JavaScript, funciona con
 * teclado y lector de pantalla, y el buscador lee el contenido aunque esté
 * plegado.
 */
export const PREGUNTAS = [
  {
    q: "¿Dónde están? ¿Se puede retirar en persona?",
    a: "Estamos en La Plata y podés retirar tu equipo en el local coordinando por WhatsApp. También hacemos envíos a todo el país.",
  },
  {
    q: "¿Los iPhone son nuevos o usados?",
    a: "Tenemos las dos cosas. Los sellados vienen en caja cerrada, sin uso. Los seminuevos están clasificados en A+, A y A−: cada grado dice exactamente qué marcas de uso tiene y con cuánta batería viene, y eso figura en la ficha de cada equipo antes de comprar.",
  },
  {
    q: "¿Qué garantía tienen?",
    a: "Todos los equipos llevan garantía escrita de seis meses con factura. Si algo falla dentro de ese plazo lo resolvemos nosotros, con servicio técnico propio.",
  },
  {
    q: "¿Puedo entregar mi iPhone usado como parte de pago?",
    a: "Sí, es el Plan Canje. Cotizás tu equipo en el sitio en dos minutos, te decimos cuánto te tomamos por él, y pagás solo la diferencia contra el que te quieras llevar.",
  },
  {
    q: "¿Hace falta crear una cuenta para comprar?",
    a: "No. Podés armar el pedido y confirmarlo sin registrarte. La cuenta es opcional y sirve para guardar favoritos y seguir tus pedidos.",
  },
  {
    q: "¿Los precios publicados son los finales?",
    a: "Sí. Lo que ves publicado es lo que pagás, sin cargos que aparezcan al final. Los precios y el stock se actualizan a medida que entran y salen equipos.",
  },
  {
    q: "¿Reparan equipos que no compré acá?",
    a: "Sí. Hacemos cambio de pantalla, batería, pin de carga, cámara y recuperación por daño de líquido, con diagnóstico sin cargo y garantía sobre la reparación.",
  },
];

export function Faq() {
  return (
    <section className="border-line border-t">
      <div className="shell aparece py-16 sm:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">Preguntas frecuentes</h2>

        <div className="border-line mt-8 border-t">
          {PREGUNTAS.map(({ q, a }) => (
            <details key={q} className="border-line group border-b">
              <summary className="hover:text-foreground flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium transition-colors">
                {q}
                {/* Un signo que rota: no hace falta traer un ícono para esto. */}
                <span
                  aria-hidden
                  className="text-muted-foreground shrink-0 text-xl leading-none transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-muted-foreground prosa pb-5 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Las mismas preguntas en el formato que Google usa para el desplegable. */
export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREGUNTAS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};
