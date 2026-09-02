import type { Line, Product } from "@/types";

/**
 * Ficha técnica agrupada de un equipo.
 *
 * Se arma desde la generación y la línea en vez de escribirla producto por
 * producto: son 21 iPhone y a mano se desincronizan enseguida, además de que
 * copiar y pegar 21 tablas es la forma más segura de que una quede con el dato
 * de otra.
 *
 * Regla de la que no nos movemos: acá va solo lo que se puede afirmar. Una
 * ficha con un dato inventado —una capacidad de batería en mAh que suena
 * razonable, un número de píxeles aproximado— es peor que una ficha más corta,
 * porque alguien la va a usar para decidir una compra y después reclamar. Por
 * eso no hay mAh ni horas de autonomía: se listan el chip, la pantalla, las
 * cámaras, los materiales y la conectividad, que es lo verificable.
 */
export type Seccion = { titulo: string; datos: [string, string][] };

type Linea = "base" | "pro" | "proMax";

/** Traduce la línea del catálogo a las tres variantes que cambian specs. */
function lineaDe(line: Line | null): Linea {
  if (line === "pro") return "pro";
  if (line === "pro-max") return "proMax";
  return "base";
}

/** Chip por generación. El Pro se separa cuando Apple usó uno distinto. */
const CHIP: Record<number, { base: string; pro: string }> = {
  17: { base: "Apple A19", pro: "Apple A19 Pro" },
  16: { base: "Apple A18", pro: "Apple A18 Pro" },
  15: { base: "Apple A16 Bionic", pro: "Apple A17 Pro" },
  14: { base: "Apple A15 Bionic", pro: "Apple A16 Bionic" },
  13: { base: "Apple A15 Bionic", pro: "Apple A15 Bionic" },
  12: { base: "Apple A14 Bionic", pro: "Apple A14 Bionic" },
  11: { base: "Apple A13 Bionic", pro: "Apple A13 Bionic" },
};

/** Medida de pantalla en pulgadas, por generación y línea. */
const PULGADAS: Record<number, Record<Linea, string>> = {
  17: { base: '6.3"', pro: '6.3"', proMax: '6.9"' },
  16: { base: '6.1"', pro: '6.3"', proMax: '6.9"' },
  15: { base: '6.1"', pro: '6.1"', proMax: '6.7"' },
  14: { base: '6.1"', pro: '6.1"', proMax: '6.7"' },
  13: { base: '6.1"', pro: '6.1"', proMax: '6.7"' },
  12: { base: '6.1"', pro: '6.1"', proMax: '6.7"' },
  11: { base: '6.1"', pro: '5.8"', proMax: '6.5"' },
};

/** Cámara principal y teleobjetivo, que es lo que más se pregunta. */
const CAMARA: Record<number, Record<Linea, { principal: string; sistema: string }>> = {
  17: {
    base: {
      principal: "48 MP Fusion",
      sistema: "Doble: gran angular y ultra gran angular",
    },
    pro: { principal: "48 MP Fusion", sistema: "Triple 48 MP con teleobjetivo" },
    proMax: { principal: "48 MP Fusion", sistema: "Triple 48 MP con teleobjetivo" },
  },
  16: {
    base: {
      principal: "48 MP Fusion",
      sistema: "Doble: gran angular y ultra gran angular",
    },
    pro: { principal: "48 MP Fusion", sistema: "Triple con teleobjetivo 5×" },
    proMax: { principal: "48 MP Fusion", sistema: "Triple con teleobjetivo 5×" },
  },
  15: {
    base: { principal: "48 MP", sistema: "Doble: gran angular y ultra gran angular" },
    pro: { principal: "48 MP", sistema: "Triple con teleobjetivo 3×" },
    proMax: { principal: "48 MP", sistema: "Triple con teleobjetivo 5×" },
  },
  14: {
    base: { principal: "12 MP", sistema: "Doble: gran angular y ultra gran angular" },
    pro: { principal: "48 MP", sistema: "Triple con teleobjetivo 3× y LiDAR" },
    proMax: { principal: "48 MP", sistema: "Triple con teleobjetivo 3× y LiDAR" },
  },
  13: {
    base: { principal: "12 MP", sistema: "Doble: gran angular y ultra gran angular" },
    pro: { principal: "12 MP", sistema: "Triple con teleobjetivo 3× y LiDAR" },
    proMax: { principal: "12 MP", sistema: "Triple con teleobjetivo 3× y LiDAR" },
  },
  12: {
    base: { principal: "12 MP", sistema: "Doble: gran angular y ultra gran angular" },
    pro: { principal: "12 MP", sistema: "Triple con teleobjetivo y LiDAR" },
    proMax: { principal: "12 MP", sistema: "Triple con teleobjetivo y LiDAR" },
  },
  11: {
    base: { principal: "12 MP", sistema: "Doble: gran angular y ultra gran angular" },
    pro: { principal: "12 MP", sistema: "Triple con teleobjetivo" },
    proMax: { principal: "12 MP", sistema: "Triple con teleobjetivo" },
  },
};

/** Material del marco: es lo que se nota en la mano y define el peso. */
function material(generation: number, linea: Linea): string {
  const esPro = linea !== "base";
  if (generation >= 17) return esPro ? "Aluminio unibody" : "Aluminio";
  if (generation >= 15) return esPro ? "Titanio grado 5" : "Aluminio";
  if (generation >= 12) return esPro ? "Acero inoxidable" : "Aluminio";
  return esPro ? "Acero inoxidable" : "Aluminio";
}

/**
 * Medida de pantalla de un iPhone. La usa también la semilla, para que el
 * dato del catálogo y el de la ficha no puedan discrepar.
 */
export function pulgadasDe(generation: number, line: Line | null): string | null {
  return PULGADAS[generation]?.[lineaDe(line)] ?? null;
}

/**
 * Ficha técnica de un iPhone, por generación y línea.
 *
 * Devuelve `null` para cualquier otro equipo: preferimos no mostrar sección a
 * mostrarla con datos de otra marca.
 */
function fichaIphone(generation: number, line: Line | null): Seccion[] | null {
  const linea = lineaDe(line);
  if (!CHIP[generation] || !PULGADAS[generation]) return null;

  const esPro = linea !== "base";
  const chip = esPro ? CHIP[generation].pro : CHIP[generation].base;
  const camara = CAMARA[generation][linea];
  // ProMotion (120 Hz) llegó con el 13 Pro, y al modelo base recién con el 17.
  const proMotion = esPro ? generation >= 13 : generation >= 17;
  const pantalla =
    generation >= 12
      ? "Super Retina XDR (OLED)"
      : esPro
        ? "Super Retina XDR (OLED)"
        : "Liquid Retina HD (LCD)";

  return [
    {
      titulo: "Pantalla",
      datos: [
        ["Tamaño", PULGADAS[generation][linea]],
        ["Tecnología", pantalla],
        ["Tasa de refresco", proMotion ? "ProMotion, hasta 120 Hz" : "60 Hz"],
        // La Isla Dinámica reemplazó al notch en el 14 Pro y se generalizó en el 15.
        [
          "Frente",
          generation >= 15 || (esPro && generation >= 14)
            ? "Isla Dinámica"
            : "Muesca (notch)",
        ],
      ],
    },
    {
      titulo: "Rendimiento",
      datos: [
        ["Chip", chip],
        ["Red", generation >= 12 ? "5G" : "4G LTE"],
        [
          "Apple Intelligence",
          generation >= 16 || (esPro && generation === 15)
            ? "Compatible"
            : "No compatible",
        ],
      ],
    },
    {
      titulo: "Cámara",
      datos: [
        ["Principal", camara.principal],
        ["Sistema", camara.sistema],
        ["Video", "4K a 60 cuadros por segundo"],
        ["Frontal", "12 MP"],
      ],
    },
    {
      titulo: "Diseño y resistencia",
      datos: [
        ["Marco", material(generation, linea)],
        ["Cristal frontal", generation >= 12 ? "Ceramic Shield" : "Cristal reforzado"],
        ["Resistencia", "IP68: agua y polvo"],
        ["Desbloqueo", "Face ID"],
      ],
    },
    {
      titulo: "Carga y conexiones",
      datos: [
        ["Puerto", generation >= 15 ? "USB-C" : "Lightning"],
        ["Carga inalámbrica", generation >= 12 ? "MagSafe y Qi" : "Qi"],
        ["Audio", "Altavoces estéreo"],
      ],
    },
  ];
}

/**
 * Ficha técnica del producto, lista para mostrar.
 *
 * Para un iPhone la arma desde la generación; para el resto agrupa lo que el
 * producto trae cargado, que viene de la lista del proveedor.
 */
export function fichaTecnica(product: Product): Seccion[] {
  if (product.brand === "Apple" && product.generation !== null) {
    const ficha = fichaIphone(product.generation, product.line);
    if (ficha) return ficha;
  }

  const datos = Object.entries(product.specs) as [string, string][];
  return datos.length > 0 ? [{ titulo: "Especificaciones", datos }] : [];
}
