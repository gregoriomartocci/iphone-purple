import { GRADE_LABELS, type Product, type StoreSettings, type Variant } from "@/types";
import { formatARS, formatUSD } from "@/utils/format";

/**
 * Plan de historias de Instagram armado con el catálogo real.
 *
 * Cada día tiene un tema fijo —el público aprende qué esperar— y tres
 * historias: el producto a la mañana, algo para interactuar al mediodía y un
 * llamado a escribir a la noche. Los productos rotan día a día para no repetir
 * siempre el mismo equipo, y solo se usan los que tienen foto y stock.
 */

export interface ProductoHistoria {
  nombre: string;
  slug: string;
  foto: string;
  detalle: string;
  precio: string;
}

export interface Historia {
  hora: string;
  formato: string;
  idea: string;
  texto: string;
  sticker: string;
  producto: ProductoHistoria | null;
}

export interface DiaDePlan {
  fecha: string;
  tema: string;
  objetivo: string;
  historias: Historia[];
}

type Disponible = { producto: Product; variante: Variant };

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function disponibles(productos: Product[]): Disponible[] {
  return productos.flatMap((producto) => {
    if (producto.images.length === 0) return [];
    const conStock = producto.variants.filter((v) => v.stock > 0 && v.priceArs > 0);
    if (conStock.length === 0) return [];
    const variante = [...conStock].sort((a, b) => a.priceArs - b.priceArs)[0];
    return [{ producto, variante }];
  });
}

function tarjeta({ producto, variante }: Disponible): ProductoHistoria {
  return {
    nombre: producto.name,
    slug: producto.slug,
    foto: producto.images[0].url,
    detalle: [
      variante.storage && variante.storage !== "—" ? variante.storage : null,
      GRADE_LABELS[variante.grade],
      variante.batteryHealth ? `batería ${variante.batteryHealth}%` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    precio: `${formatUSD(variante.priceUsd)} · ${formatARS(variante.priceArs)}`,
  };
}

/** Rota la lista según el día, para no mostrar siempre el mismo. */
function elegir<T>(lista: T[], indice: number, cuantos = 1): T[] {
  if (lista.length === 0) return [];
  return Array.from(
    { length: Math.min(cuantos, lista.length) },
    (_, i) => lista[(indice + i) % lista.length]
  );
}

const esIphone = (d: Disponible) => /^iphone/i.test(d.producto.name);
const generacion = (d: Disponible) => Number(d.producto.name.match(/\d+/)?.[0] ?? 0);

export function armarPlan(
  productos: Product[],
  negocio: Pick<StoreSettings, "address" | "hours" | "whatsappDisplay" | "instagram">,
  desde: Date,
  dias = 7
): DiaDePlan[] {
  const todo = disponibles(productos);
  const iphones = todo.filter(esIphone);
  const sellados = iphones
    .filter((d) => d.variante.grade === "sellado")
    // El Duo es un equipo de nicho y cuesta el doble: no representa al resto.
    .filter((d) => !/d[uú]o/i.test(d.producto.name))
    .sort((a, b) => generacion(b) - generacion(a));
  const seminuevos = iphones
    .filter((d) => d.variante.grade !== "sellado")
    .sort((a, b) => a.variante.priceArs - b.variante.priceArs);
  const otros = todo.filter((d) => !esIphone(d));
  const masBarato = [...sellados].sort(
    (a, b) => a.variante.priceArs - b.variante.priceArs
  );
  const zona = negocio.address ? `en ${negocio.address}` : "en La Plata";
  const escribinos = negocio.whatsappDisplay
    ? `Escribinos al ${negocio.whatsappDisplay}`
    : "Escribinos por WhatsApp";

  const historia = (
    hora: string,
    formato: string,
    idea: string,
    texto: string,
    sticker: string,
    d?: Disponible
  ): Historia => ({
    hora,
    formato,
    idea,
    texto,
    sticker,
    producto: d ? tarjeta(d) : null,
  });

  return Array.from({ length: dias }, (_, n) => {
    const fecha = new Date(desde.getTime() + n * 86_400_000);
    const dia = fecha.getUTCDay();
    const semana = Math.floor(fecha.getTime() / (7 * 86_400_000));
    const [nuevo, otroNuevo] = elegir(sellados, semana + n, 2);
    const [usado] = elegir(seminuevos, semana + n);
    const [extra] = elegir(otros, semana + n);
    const oferta = masBarato[0];
    const base = { fecha: fecha.toISOString().slice(0, 10) };

    const plan: Record<number, Omit<DiaDePlan, "fecha">> = {
      1: {
        tema: "Llegó stock",
        objetivo: "Mostrar que hay lo último, disponible ya.",
        historias: [
          historia(
            "10:00",
            "Foto del producto",
            "El sellado más nuevo que hay hoy",
            `Ya disponible en La Plata 📦 Sellado, con garantía.`,
            "Enlace a WhatsApp",
            nuevo
          ),
          historia(
            "14:00",
            "Encuesta",
            "Comparar dos sellados",
            "¿Cuál te llevás?",
            `Encuesta: ${nuevo?.producto.name ?? "A"} / ${otroNuevo?.producto.name ?? "B"}`,
            otroNuevo
          ),
          historia(
            "19:00",
            "Texto sobre fondo oscuro",
            "Llamado a consultar",
            `Stock real, entrega inmediata ${zona}. ${escribinos} y te pasamos precio del día.`,
            "Enlace a WhatsApp"
          ),
        ],
      },
      2: {
        tema: "Seminuevos que valen la pena",
        objetivo: "Bajar el miedo a comprar usado.",
        historias: [
          historia(
            "10:00",
            "Foto del producto",
            "El seminuevo con mejor precio",
            "Seminuevo revisado, batería medida y garantía.",
            "Enlace a WhatsApp",
            usado
          ),
          historia(
            "14:00",
            "Texto con íconos",
            "Qué significa A+, A y A−",
            "A+: como nuevo. A: detalles mínimos de uso. A−: marcas visibles, mejor precio. Siempre con batería informada.",
            "Caja de preguntas: ¿Qué te preocupa de comprar usado?"
          ),
          historia(
            "19:00",
            "Video corto",
            "Mostrar cómo se revisa la batería",
            "Así revisamos cada equipo antes de venderlo ✅",
            "Enlace a WhatsApp"
          ),
        ],
      },
      3: {
        tema: "¿Cuál me conviene?",
        objetivo: "Ayudar a decidir y generar mensajes.",
        historias: [
          historia(
            "10:00",
            "Dos fotos lado a lado",
            "Comparar un sellado y un seminuevo",
            "Sellado o seminuevo: ¿qué te conviene?",
            "Encuesta: Sellado / Seminuevo",
            nuevo
          ),
          historia(
            "14:00",
            "Foto del producto",
            "La alternativa más económica",
            "Si buscás gastar menos, esta es la opción.",
            "Enlace a WhatsApp",
            usado
          ),
          historia(
            "19:00",
            "Caja de preguntas",
            "Responder dudas al día siguiente",
            "Contanos qué usás hoy y te recomendamos uno.",
            "Caja de preguntas"
          ),
        ],
      },
      4: {
        tema: "Plan Canje",
        objetivo: "Captar a quien ya tiene iPhone y quiere cambiar.",
        historias: [
          historia(
            "10:00",
            "Texto sobre fondo oscuro",
            "Explicar el canje en una frase",
            "Entregás tu iPhone usado y pagás la diferencia por uno nuevo.",
            "Enlace a la web: Plan Canje"
          ),
          historia(
            "14:00",
            "Foto del producto",
            "Un destino de canje atractivo",
            "¿Tenés un iPhone más viejo? Pasate a este.",
            "Encuesta: ¿Qué iPhone tenés hoy? 13 o menos / 14-15 / 16 o más",
            nuevo
          ),
          historia(
            "19:00",
            "Texto con pasos",
            "Cómo cotizar",
            `1. Mandanos modelo, capacidad y batería. 2. Te cotizamos. 3. Lo cambiás ${zona}.`,
            "Enlace a WhatsApp"
          ),
        ],
      },
      5: {
        tema: "Precio del finde",
        objetivo: "Empujar la compra antes del fin de semana.",
        historias: [
          historia(
            "10:00",
            "Foto del producto con precio grande",
            "El sellado más barato",
            "El iPhone sellado más accesible que tenemos hoy.",
            "Cuenta regresiva: Sábado 12 hs",
            oferta
          ),
          historia(
            "14:00",
            "Foto del producto",
            "Un accesorio para sumar",
            "Sumalo a tu compra.",
            "Enlace a WhatsApp",
            extra
          ),
          historia(
            "19:00",
            "Texto sobre fondo oscuro",
            "Formas de pago",
            "Transferencia, USDT o efectivo. Precio único, sin vueltas.",
            "Enlace a WhatsApp"
          ),
        ],
      },
      6: {
        tema: "Vení a verlo",
        objetivo: "Dar confianza: hay un lugar y personas detrás.",
        historias: [
          historia(
            "10:00",
            "Foto o video del lugar (sin clientes)",
            "Dónde estamos",
            `Te esperamos ${zona}.`,
            "Ubicación"
          ),
          historia(
            "12:00",
            "Foto del producto",
            "Lo que se puede retirar hoy",
            "Disponible para retirar hoy.",
            "Enlace a WhatsApp",
            nuevo
          ),
          historia(
            "13:00",
            "Texto sobre fondo oscuro",
            "Horario",
            negocio.hours || "Consultá horarios por WhatsApp.",
            "Enlace a WhatsApp"
          ),
        ],
      },
      0: {
        tema: "Preguntas frecuentes",
        objetivo: "Responder lo que frena la compra.",
        historias: [
          historia(
            "11:00",
            "Texto con íconos",
            "Garantía",
            "Todos los equipos tienen garantía. Sellados, la oficial de Apple.",
            "Caja de preguntas"
          ),
          historia(
            "15:00",
            "Respuesta a una pregunta de la semana",
            "Usar la caja del miércoles",
            "Respondemos una de tus preguntas 👇",
            "Enlace a WhatsApp"
          ),
          historia(
            "20:00",
            "Foto del producto",
            "Adelanto de la semana",
            "Esta semana entra stock nuevo. Activá las notificaciones.",
            "Recordatorio",
            otroNuevo ?? nuevo
          ),
        ],
      },
    };

    return {
      ...base,
      ...plan[dia],
      tema: `${DIAS[dia][0].toUpperCase()}${DIAS[dia].slice(1)} · ${plan[dia].tema}`,
    };
  });
}
