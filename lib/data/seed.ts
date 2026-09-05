import { parseModel } from "@/lib/catalog";
import { FOTOS_PRODUCTO } from "./fotos.generado";
import { camaraDe, chipDe, pulgadasDe } from "./ficha-tecnica";
import type {
  Authenticity,
  Category,
  Line,
  Post,
  Product,
  ProductImage,
  RepairService,
  StoreSettings,
  Supplier,
  TradeInPrice,
  Variant,
  Grade,
} from "@/types";

/**
 * Datos de demostración.
 *
 * Se usan cuando Supabase todavía no está configurado, para que el sitio se pueda
 * recorrer completo sin base de datos. `lib/supabase/seed.sql` carga estos mismos
 * datos en Postgres, así el salto a Supabase no deja el catálogo vacío.
 */

export const SETTINGS: StoreSettings = {
  dollarRate: 1450,
  dollarRateUpdatedAt: new Date().toISOString(),
  defaultMarginPct: 18,
  whatsappNumber: "5491100000000",
  whatsappDisplay: "+54 9 11 0000-0000",
  instagram: "https://instagram.com/iphonepurple",
  tiktok: "https://tiktok.com/@iphonepurple",
  email: "hola@iphonepurple.com.ar",
  // TODO: reemplazar por la dirección real del local.
  address: "Calle 7 1234, La Plata",
  hours: "Lunes a sábado de 10 a 19 h",
  mapsUrl: "https://maps.google.com/?q=Calle+7+1234,+La+Plata",
};

/**
 * Fotos de un producto.
 *
 * O están las del producto exacto —en public/productos/<slug>/, listadas por
 * `npm run fotos`— o no hay ninguna. No se rellena con una foto genérica de la
 * familia: mostrar un iPhone cualquiera donde va un Motorola, o un secador
 * distinto del que se vende, es peor que no mostrar nada. Quien compra confía
 * en que la foto es del equipo.
 *
 * Sin fotos, la tarjeta muestra un espacio con el nombre del equipo y avisa
 * que la foto está en camino. Es información honesta, y encima empuja a
 * cargar las propias.
 */
function fotosDe(slug: string, seed: SeedProduct): ProductImage[] {
  // El texto alternativo describe el equipo y dónde se consigue: lo lee quien
  // usa lector de pantalla, y también es lo que indexa la búsqueda de
  // imágenes, por donde entra bastante tráfico en este rubro.
  const alt = `${seed.name} ${seed.brand} en venta en La Plata`;
  const propias = FOTOS_PRODUCTO[slug];
  // Ya están servidas desde el propio dominio: no llevan los parámetros de
  // recorte de Unsplash.
  return propias?.length ? propias.map((f) => ({ url: f.url, alt })) : [];
}

/**
 * Fotos de portada de las notas del blog.
 *
 * Acá una foto ambiental sí corresponde: la portada de una nota ilustra un
 * tema, no representa un producto que alguien va a comprar. Es la diferencia
 * con el catálogo, donde una foto que no es del equipo exacto directamente no
 * se muestra.
 */
const PORTADAS_BLOG = {
  // Dos iPhone Pro de generaciones seguidas, uno al lado del otro: la nota es
  // una comparación, y la portada la muestra sin tener que explicarla.
  comparacion: "https://images.unsplash.com/photo-1726732970014-f2df88c87dd3",
  // Un iPhone abierto con las herramientas al lado. Es lo que ilustra
  // "revisar": mirar el equipo por dentro antes de darlo por bueno.
  revision: "https://images.unsplash.com/photo-1746005718004-1f992c399428",
  // Macro del módulo de cámara. Sirve para la nota de tasación porque el tema
  // es mirar de cerca, y el detalle del vidrio y el titanio se lee enorme.
  detalle: "https://images.unsplash.com/photo-1761435922542-f25f1c5fee5a",
  // iPhone cargando, con los widgets de batería a la vista en la pantalla de
  // bloqueo: la nota habla exactamente de ese número.
  bateria: "https://images.unsplash.com/photo-1682828511261-1d481875deb6",
} as const;

type SeedVariant = {
  storage: string;
  color: string;
  colorHex: string;
  grade: Grade;
  /** Por defecto original: la réplica siempre se declara explícitamente. */
  authenticity?: Authenticity;
  batteryHealth?: number | null;
  priceUsd: number;
  costUsd: number;
  stock: number;
};

type SeedProduct = {
  name: string;
  brand: string;
  model: string;
  category: Category;
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
  variants: SeedVariant[];
};

// ─────────────────────────────────────────────────────────────
// Línea de iPhone, del 11 al 17
//
// Se genera en vez de escribirse a mano: son 21 modelos por tres variantes
// cada uno, y a mano se vuelven imposibles de mantener coherentes. Los
// precios salen de un ancla por generación y línea, con el descuento de cada
// grado aplicado encima.
// ─────────────────────────────────────────────────────────────

/** Precio del sellado en USD, por generación y línea, en la capacidad base. */
const IPHONE_PRICES: Record<number, { base: number; pro: number; proMax: number }> = {
  17: { base: 1050, pro: 1350, proMax: 1550 },
  16: { base: 950, pro: 1250, proMax: 1450 },
  15: { base: 800, pro: 1050, proMax: 1250 },
  14: { base: 650, pro: 850, proMax: 1000 },
  13: { base: 520, pro: 700, proMax: 820 },
  12: { base: 400, pro: 550, proMax: 650 },
  11: { base: 300, pro: 420, proMax: 500 },
};

/** Cuánto vale un seminuevo respecto del mismo equipo sellado. */
const GRADE_DISCOUNT: Record<Grade, number> = {
  sellado: 1,
  "a-plus": 0.88,
  a: 0.8,
  "a-minus": 0.7,
};

const IPHONE_STORAGES = {
  base: ["128GB", "256GB"],
  pro: ["128GB", "256GB", "512GB"],
  proMax: ["256GB", "512GB", "1TB"],
} as const;

/** Cada capacidad suma sobre el precio base. */
const STORAGE_STEP: Record<string, number> = {
  "128GB": 0,
  "256GB": 110,
  "512GB": 300,
  "1TB": 520,
};

const IPHONE_COLORS: Record<number, [string, string][]> = {
  17: [
    ["Naranja Cósmico", "#d97a45"],
    ["Blanco Nube", "#f0efeb"],
  ],
  16: [
    ["Titanio Negro", "#3b3b3d"],
    ["Titanio Natural", "#c2bcb2"],
  ],
  15: [
    ["Titanio Azul", "#5f6b7a"],
    ["Titanio Natural", "#c2bcb2"],
  ],
  14: [
    ["Morado Oscuro", "#5b5069"],
    ["Medianoche", "#2c2c34"],
  ],
  13: [
    ["Medianoche", "#2c2c34"],
    ["Azul Sierra", "#87a6c4"],
  ],
  12: [
    ["Negro", "#2c2c2e"],
    ["Verde", "#c9ddc4"],
  ],
  11: [
    ["Blanco", "#f2f2f0"],
    ["Negro", "#2c2c2e"],
  ],
};

// La medida de pantalla no está acá: depende de la generación, no solo de la
// línea, y tenerla fija hacía que un iPhone 15 Pro figurara con la pantalla de
// un 16 Pro. Sale de `pulgadasDe`, que es la misma fuente que usa la ficha
// técnica, así el catálogo y la ficha no pueden discrepar.
const LINE_SPECS: Record<"base" | "pro" | "proMax", { suffix: string }> = {
  base: { suffix: "" },
  pro: { suffix: " Pro" },
  proMax: { suffix: " Pro Max" },
};

/** Línea del catálogo a partir de la clave interna de la semilla. */
const LINE_KEY: Record<"base" | "pro" | "proMax", Line> = {
  base: "base",
  pro: "pro",
  proMax: "pro-max",
};

/** Reparte grados y stock para que el catálogo de demo no sea uniforme. */
function iphoneVariants(
  generation: number,
  line: "base" | "pro" | "proMax"
): SeedVariant[] {
  const anchor = IPHONE_PRICES[generation][line];
  const colors = IPHONE_COLORS[generation];
  const storages = IPHONE_STORAGES[line];

  // Los modelos nuevos llegan sellados; los viejos, seminuevos.
  const grades: Grade[] =
    generation >= 16
      ? ["sellado", "a-plus", "a"]
      : generation >= 14
        ? ["a-plus", "a", "a-minus"]
        : ["a", "a-minus"];

  return grades.map((grade, i) => {
    const storage = storages[i % storages.length];
    const [color, colorHex] = colors[i % colors.length];
    const priceUsd = Math.round((anchor + STORAGE_STEP[storage]) * GRADE_DISCOUNT[grade]);

    return {
      storage,
      color,
      colorHex,
      grade,
      batteryHealth:
        grade === "sellado" ? null : grade === "a-plus" ? 97 : grade === "a" ? 91 : 84,
      priceUsd,
      costUsd: Math.round(priceUsd * 0.84),
      // Alguno sin stock a propósito: el sitio no lo muestra, y eso se prueba.
      stock: (generation + i) % 7 === 0 ? 0 : ((generation + i) % 3) + 1,
    };
  });
}

const IPHONE_SEED: SeedProduct[] = Object.keys(IPHONE_PRICES)
  .map(Number)
  .sort((a, b) => b - a)
  .flatMap((generation) =>
    (["base", "pro", "proMax"] as const).map((line) => {
      const { suffix } = LINE_SPECS[line];
      const pulgadas = pulgadasDe(generation, LINE_KEY[line]);
      const name = `iPhone ${generation}${suffix}`;

      return {
        name,
        brand: "Apple",
        model: name,
        category: "celular" as Category,
        description: `${name} revisado y con garantía escrita. Verificamos batería, piezas originales y bloqueo de iCloud antes de publicarlo.`,
        specs: {
          Pantalla: pulgadas ? `${pulgadas} Super Retina XDR` : "Super Retina XDR",
          // Chip y cámara salen de la ficha técnica, que es la fuente única:
          // acá había una fórmula que inventaba el nombre del chip.
          Chip: chipDe(generation, LINE_KEY[line]) ?? "Apple",
          Cámara: camaraDe(generation, LINE_KEY[line]) ?? "Sistema de cámaras",
          Material: generation >= 15 && line !== "base" ? "Titanio" : "Aluminio",
        },
        featured: generation >= 16,
        variants: iphoneVariants(generation, line),
      };
    })
  );

// ─────────────────────────────────────────────────────────────
// Catálogo multimarca
//
// Cargado desde una lista real de proveedor. Los importes son el COSTO que
// cobra el proveedor en dólares; el precio de venta sale de aplicarle el
// margen, igual que hace el importador del panel.
//
// Las fotos son genéricas por categoría: no hay forma de conseguir la imagen
// real de cada modelo sin inventarla, así que se reemplazan subiendo las
// propias desde el panel.
// ─────────────────────────────────────────────────────────────

const MARGEN_DEMO = 0.18;

/** Costo del proveedor → precio de venta, redondeado a decenas de dólar. */
const conMargen = (costo: number) => Math.round((costo * (1 + MARGEN_DEMO)) / 10) * 10;

type ItemProveedor = {
  marca: string;
  nombre: string;
  categoria: Category;
  /** Lo que distingue a la variante: capacidad, medida o versión. */
  variante: string;
  colores: [string, string][];
  costoUsd: number;
  specs?: Record<string, string>;
  stock?: number;
};

const LISTA_PROVEEDOR: ItemProveedor[] = [
  // ── Notebooks de oficina y uso general
  {
    marca: "Acer",
    nombre: "Acer Aspire Go 15 AG15-42P",
    categoria: "notebook",
    variante: "16GB · 512GB",
    colores: [["Pure Silver", "#c9ccd1"]],
    costoUsd: 780,
    specs: {
      Procesador: "AMD Ryzen 7 7730U",
      Memoria: "16 GB DDR4",
      Almacenamiento: "512 GB SSD",
      Pantalla: '15.6" Full HD',
      "Sistema operativo": "Windows 11",
    },
  },
  {
    marca: "Acer",
    nombre: "Acer Swift Go SFG16-72",
    categoria: "notebook",
    variante: "8GB · 512GB",
    colores: [["Steel Gray", "#6b6f76"]],
    costoUsd: 800,
    specs: {
      Procesador: "Intel Core Ultra 5 125H",
      Memoria: "8 GB DDR5",
      Almacenamiento: "512 GB SSD",
      Pantalla: '16" 3.2K OLED, 120 Hz',
      "Sistema operativo": "Windows 11 Home",
    },
  },
  {
    marca: "Asus",
    nombre: "Asus Vivobook Go E1504FA",
    categoria: "notebook",
    variante: "8GB · 512GB",
    colores: [["Mixed Black", "#2c2c2e"]],
    costoUsd: 575,
    specs: {
      Procesador: "AMD Ryzen 5",
      Memoria: "8 GB",
      Almacenamiento: "512 GB SSD",
      Pantalla: '15.6" Full HD',
      "Sistema operativo": "Windows 11",
    },
  },
  {
    marca: "Asus",
    nombre: "Asus X1404VA",
    categoria: "notebook",
    variante: "12GB · 512GB",
    colores: [["Azul", "#3f5878"]],
    costoUsd: 765,
    specs: {
      Procesador: "Intel Core i7-1355U",
      Memoria: "12 GB",
      Almacenamiento: "512 GB SSD",
      Pantalla: '14" Full HD',
      "Sistema operativo": "Windows 11",
    },
  },
  {
    marca: "Asus",
    nombre: "Asus Vivobook X1407QA",
    categoria: "notebook",
    variante: "16GB · 512GB",
    colores: [["Cool Silver", "#c9ccd1"]],
    costoUsd: 745,
    specs: {
      Procesador: "Snapdragon X8 X1-26-100",
      Memoria: "16 GB LPDDR5X",
      Almacenamiento: "512 GB SSD",
      Pantalla: '14" 1920 × 1200',
      "Sistema operativo": "Windows 11",
    },
  },
  {
    marca: "Asus",
    nombre: "Asus Vivobook Go F1504VAP",
    categoria: "notebook",
    variante: "16GB · 1TB",
    colores: [["Cool Silver", "#c9ccd1"]],
    costoUsd: 1025,
    specs: {
      Procesador: "Intel Core 7 150U",
      Memoria: "16 GB",
      Almacenamiento: "1 TB SSD",
      Pantalla: '15.6" Full HD táctil',
      "Sistema operativo": "Windows 11 Home",
    },
  },

  // ── Consolas y gaming
  {
    marca: "Nintendo",
    nombre: "Nintendo Switch OLED",
    categoria: "consola",
    variante: "64GB",
    colores: [["Neón", "#e60012"]],
    costoUsd: 419,
    specs: { Pantalla: '7" OLED', Almacenamiento: "64 GB", Incluye: "Dock y Joy-Con" },
  },
  {
    marca: "Nintendo",
    nombre: "Nintendo Switch 2 + Mario Kart",
    categoria: "consola",
    variante: "Bundle US",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 630,
    specs: { Incluye: "Consola + Mario Kart", Región: "US" },
  },
  {
    marca: "Logitech",
    nombre: "Logitech G29 Driving Force",
    categoria: "accesorio",
    variante: "Volante + pedales",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 350,
    specs: { Compatibilidad: "PS5, PS4 y PC", Incluye: "Volante y pedales" },
  },
  {
    marca: "Western Digital",
    nombre: "WD_Black NVMe SSD para PS5",
    categoria: "accesorio",
    variante: "2TB",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 370,
    specs: { Capacidad: "2 TB", Interfaz: "NVMe", Uso: "Expansión de PS5" },
  },

  // ── Xiaomi
  {
    marca: "Xiaomi",
    nombre: "Redmi 15C",
    categoria: "celular",
    variante: "8+256",
    colores: [
      ["Negro", "#2c2c2e"],
      ["Verde", "#7fa886"],
    ],
    costoUsd: 180,
    specs: { Memoria: "8 GB + 256 GB", Red: "4G" },
  },
  {
    marca: "Xiaomi",
    nombre: "Redmi Pad 2",
    categoria: "tablet",
    variante: '11" 4+128',
    colores: [
      ["Gris", "#8a8a90"],
      ["Verde", "#7fa886"],
    ],
    costoUsd: 210,
    specs: { Pantalla: '11"', Memoria: "4 GB + 128 GB" },
  },
  {
    marca: "Xiaomi",
    nombre: "Poco F8 Ultra",
    categoria: "celular",
    variante: "12+256 5G",
    colores: [["Azul", "#3f6fb5"]],
    costoUsd: 720,
    specs: { Memoria: "12 GB + 256 GB", Red: "5G" },
  },
  {
    marca: "Xiaomi",
    nombre: "Xiaomi 17",
    categoria: "celular",
    variante: "12+512 5G",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 880,
    specs: { Memoria: "12 GB + 512 GB", Red: "5G" },
  },
  {
    marca: "Xiaomi",
    nombre: "Xiaomi 17 Ultra",
    categoria: "celular",
    variante: "12+512 5G",
    colores: [
      ["Blanco", "#f0efeb"],
      ["Verde", "#7fa886"],
    ],
    costoUsd: 1250,
    specs: { Memoria: "12 GB + 512 GB", Red: "5G" },
  },

  // ── Motorola
  {
    marca: "Motorola",
    nombre: "Moto G06",
    categoria: "celular",
    variante: "4+128 DS",
    colores: [["Azul", "#3f6fb5"]],
    costoUsd: 145,
    specs: { Memoria: "4 GB + 128 GB", SIM: "Dual" },
  },
  {
    marca: "Motorola",
    nombre: "Moto G15",
    categoria: "celular",
    variante: "4+512 DS",
    colores: [["Azul", "#3f6fb5"]],
    costoUsd: 175,
    specs: { Memoria: "4 GB + 512 GB", SIM: "Dual" },
  },
  {
    marca: "Motorola",
    nombre: "Moto G17",
    categoria: "celular",
    variante: "4+256 DS",
    colores: [
      ["Arándano", "#6b3a5b"],
      ["Celeste", "#8fc0d8"],
    ],
    costoUsd: 200,
    specs: { Memoria: "4 GB + 256 GB", SIM: "Dual" },
  },
  {
    marca: "Motorola",
    nombre: "Moto G35",
    categoria: "celular",
    variante: "4+256 DS",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 175,
    specs: { Memoria: "4 GB + 256 GB", SIM: "Dual" },
  },
  {
    marca: "Motorola",
    nombre: "Moto G67",
    categoria: "celular",
    variante: "4+256 DS",
    colores: [["Gris", "#8a8a90"]],
    costoUsd: 265,
    specs: { Memoria: "4 GB + 256 GB", SIM: "Dual" },
  },

  // ── Hogar y belleza
  {
    marca: "Dyson",
    nombre: "Dyson HD18 Hair Dryer R Professional",
    categoria: "hogar",
    variante: "Sin estuche",
    colores: [
      ["Vinca Blue", "#5f7fb5"],
      ["Topaz", "#c89a5b"],
    ],
    costoUsd: 549,
    specs: { Tensión: "220V", Incluye: "Accesorios", Estuche: "No incluye" },
  },
  {
    marca: "Dyson",
    nombre: "Dyson HD16 Hair Dryer Nural",
    categoria: "hogar",
    variante: "Sin estuche",
    colores: [
      ["Vinca Blue", "#5f7fb5"],
      ["Ceramic", "#dcd3c6"],
    ],
    costoUsd: 449,
    specs: { Tensión: "220V", Estuche: "No incluye" },
  },
  {
    marca: "Dyson",
    nombre: "Dyson HS08 I.d Straight+Wavy",
    categoria: "hogar",
    variante: "Moldeador",
    colores: [["Jasper Plum", "#6b4a6b"]],
    costoUsd: 699,
    specs: { Tensión: "220V", Tipo: "Moldeador multifunción" },
  },
  {
    marca: "Xiaomi",
    nombre: "Xiaomi Aspiradora Mijia 2",
    categoria: "hogar",
    variante: "Inalámbrica",
    colores: [["Blanco", "#f0efeb"]],
    costoUsd: 279,
    specs: { Tipo: "Inalámbrica", Tensión: "220V" },
  },

  // ── Relojes
  {
    marca: "Xiaomi",
    nombre: "Xiaomi Band 9 Active",
    categoria: "reloj",
    variante: "Estándar",
    colores: [
      ["Rosa", "#e8a7bd"],
      ["Blanco", "#f0efeb"],
    ],
    costoUsd: 28,
    specs: { Tipo: "Banda de actividad" },
    stock: 12,
  },
  {
    marca: "Garmin",
    nombre: "Garmin Instinct 2S Solar",
    categoria: "reloj",
    variante: "Rugged",
    colores: [["Grafito", "#4a4a52"]],
    costoUsd: 259,
    specs: { Carga: "Solar", Uso: "Outdoor" },
  },
  {
    marca: "Garmin",
    nombre: "Garmin Epix Pro Gen 2",
    categoria: "reloj",
    variante: "51mm Sapphire",
    colores: [
      ["Gris", "#8a8a90"],
      ["Blanco", "#f0efeb"],
    ],
    costoUsd: 649,
    specs: { Caja: "51 mm", Cristal: "Zafiro", Uso: "Multideporte" },
  },
  {
    marca: "Garmin",
    nombre: "Garmin Approach S70",
    categoria: "reloj",
    variante: "42mm Golf",
    colores: [["Negro", "#2c2c2e"]],
    costoUsd: 529,
    specs: { Caja: "42 mm", Uso: "Golf" },
  },
  {
    marca: "Kieslect",
    nombre: "Kieslect Calling Watch Kr3",
    categoria: "reloj",
    variante: "Estándar",
    colores: [["Denim", "#5f7fb5"]],
    costoUsd: 69,
    stock: 8,
  },
  {
    marca: "Kieslect",
    nombre: "Kieslect Calling Watch Kr Ultra 3",
    categoria: "reloj",
    variante: "Ultra",
    colores: [["Ice White", "#eef1f4"]],
    costoUsd: 69,
    stock: 8,
  },
  {
    marca: "Kieslect",
    nombre: "Kieslect Lady Watch Elfin",
    categoria: "reloj",
    variante: "Estándar",
    colores: [
      ["Negro Grafito", "#3a3a42"],
      ["Rosa Dorado", "#d8a68f"],
      ["Plata", "#c9c9d2"],
    ],
    costoUsd: 69,
    stock: 10,
  },
  {
    marca: "Kieslect",
    nombre: "Kieslect Al Watch Elite 2",
    categoria: "reloj",
    variante: "Elite",
    colores: [["Titan Black", "#2c2c34"]],
    costoUsd: 79,
    stock: 6,
  },
];

const PROVEEDOR_SEED: SeedProduct[] = LISTA_PROVEEDOR.map((item) => ({
  name: item.nombre,
  brand: item.marca,
  model: item.nombre,
  category: item.categoria,
  description: `${item.nombre} nuevo, sellado y con garantía. Consultanos por disponibilidad de color.`,
  specs: item.specs ?? {},
  // Un color por variante: es lo que distingue las unidades en stock.
  variants: item.colores.map(([color, colorHex]) => ({
    storage: item.variante,
    color,
    colorHex,
    grade: "sellado" as Grade,
    batteryHealth: null,
    priceUsd: conMargen(item.costoUsd),
    costUsd: item.costoUsd,
    stock: item.stock ?? 2,
  })),
}));

/**
 * Línea Apple de la lista mayorista.
 *
 * Van aparte de `LISTA_PROVEEDOR` porque acá un mismo modelo tiene varias
 * configuraciones —memoria, disco y color cambian el precio— y agruparlas bajo
 * un solo producto es lo que deja comparar: quien busca una MacBook Pro de 14"
 * quiere ver las opciones juntas, no seis fichas casi iguales compitiendo
 * entre sí en la grilla.
 */
type ConfigApple = {
  /** Lo que distingue esta configuración dentro del modelo. */
  config: string;
  colores: [string, string][];
  costoUsd: number;
  stock?: number;
};

type ModeloApple = {
  nombre: string;
  categoria: Category;
  specs: Record<string, string>;
  configs: ConfigApple[];
};

const LINEA_APPLE: ModeloApple[] = [
  {
    nombre: "MacBook Neo 13",
    categoria: "notebook",
    specs: {
      Chip: "Apple A18 Pro, 6 núcleos de CPU y 5 de GPU",
      Pantalla: '13" Liquid Retina (2408 × 1506)',
      Memoria: "8 GB",
    },
    configs: [
      {
        config: "256GB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Indigo", "#4a5578"],
          ["Blush", "#e8c6c0"],
          ["Citrus", "#e5c063"],
        ],
        costoUsd: 830,
      },
      {
        config: "512GB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Indigo", "#4a5578"],
          ["Blush", "#e8c6c0"],
        ],
        costoUsd: 940,
      },
    ],
  },
  {
    nombre: "MacBook Air M5 13",
    categoria: "notebook",
    specs: {
      Chip: "Apple M5, 10 núcleos de CPU y 10 de GPU",
      Pantalla: '13.6" Liquid Retina',
    },
    configs: [
      {
        config: "16GB · 512GB",
        colores: [
          ["Midnight", "#2e3642"],
          ["Starlight", "#e9dfd0"],
        ],
        costoUsd: 1430,
      },
      {
        config: "16GB · 1TB",
        colores: [
          ["Midnight", "#2e3642"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 1600,
      },
      { config: "24GB · 1TB", colores: [["Starlight", "#e9dfd0"]], costoUsd: 1950 },
    ],
  },
  {
    nombre: "MacBook Air M5 15",
    categoria: "notebook",
    specs: {
      Chip: "Apple M5, 10 núcleos de CPU y 10 de GPU",
      Pantalla: '15.3" Liquid Retina',
    },
    configs: [
      {
        config: "16GB · 512GB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Sky Blue", "#a9c3d8"],
          ["Midnight", "#2e3642"],
        ],
        costoUsd: 1690,
      },
      {
        config: "24GB · 1TB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Sky Blue", "#a9c3d8"],
          ["Midnight", "#2e3642"],
          ["Starlight", "#e9dfd0"],
        ],
        costoUsd: 2300,
      },
    ],
  },
  {
    nombre: "MacBook Pro M4 Pro 14",
    categoria: "notebook",
    specs: { Chip: "Apple M4 Pro", Pantalla: '14.2" Liquid Retina XDR' },
    configs: [
      {
        config: "12 CPU · 16 GPU · 24GB · 512GB",
        colores: [["Silver", "#dcdee1"]],
        costoUsd: 2190,
      },
      {
        config: "14 CPU · 20 GPU · 24GB · 1TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 2450,
      },
    ],
  },
  {
    nombre: "MacBook Pro M5 14",
    categoria: "notebook",
    specs: {
      Chip: "Apple M5, 10 núcleos de CPU y 10 de GPU",
      Pantalla: '14.2" Liquid Retina XDR',
    },
    configs: [
      {
        config: "16GB · 1TB",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 2030,
      },
      {
        config: "24GB · 1TB",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 2400,
      },
      {
        config: "24GB · 1TB · teclado español",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 2500,
      },
      {
        config: "32GB · 1TB",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 2750,
      },
    ],
  },
  {
    nombre: "MacBook Pro M5 Pro 14",
    categoria: "notebook",
    specs: { Chip: "Apple M5 Pro", Pantalla: '14.2" Liquid Retina XDR' },
    configs: [
      {
        config: "15 CPU · 16 GPU · 24GB · 1TB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Space Black", "#2b2b2d"],
        ],
        costoUsd: 2650,
      },
      {
        config: "18 CPU · 20 GPU · 24GB · 2TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 3330,
      },
    ],
  },
  {
    nombre: "MacBook Pro M5 Max 14",
    categoria: "notebook",
    specs: { Chip: "Apple M5 Max", Pantalla: '14.2" Liquid Retina XDR' },
    configs: [
      {
        config: "18 CPU · 32 GPU · 36GB · 2TB",
        colores: [["Silver", "#dcdee1"]],
        costoUsd: 4150,
        stock: 1,
      },
    ],
  },
  {
    nombre: "MacBook Pro M5 Pro 16",
    categoria: "notebook",
    specs: {
      Chip: "Apple M5 Pro, 18 núcleos de CPU y 20 de GPU",
      Pantalla: '16.2" Liquid Retina XDR',
    },
    configs: [
      {
        config: "24GB · 1TB",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 3080,
      },
      {
        config: "48GB · 1TB",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 3950,
      },
      {
        config: "48GB · 1TB · Nano Texture",
        colores: [
          ["Space Black", "#2b2b2d"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 4150,
      },
    ],
  },
  {
    nombre: "MacBook Pro M5 Max 16",
    categoria: "notebook",
    specs: { Chip: "Apple M5 Max", Pantalla: '16.2" Liquid Retina XDR' },
    configs: [
      {
        config: "18 CPU · 32 GPU · 36GB · 2TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 4300,
      },
      {
        config: "18 CPU · 40 GPU · 48GB · 2TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 5300,
      },
      {
        config: "18 CPU · 40 GPU · 64GB · 2TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 6550,
      },
      {
        config: "18 CPU · 40 GPU · 128GB · 2TB",
        colores: [["Space Black", "#2b2b2d"]],
        costoUsd: 8600,
        stock: 1,
      },
    ],
  },
  {
    nombre: "iPad 11ª generación",
    categoria: "tablet",
    specs: { Chip: "Apple A16", Pantalla: '11" Liquid Retina' },
    configs: [
      {
        config: "128GB",
        colores: [
          ["Silver", "#dcdee1"],
          ["Blue", "#7f9cc0"],
          ["Yellow", "#e8d07a"],
        ],
        costoUsd: 510,
      },
      {
        config: "256GB",
        colores: [
          ["Blue", "#7f9cc0"],
          ["Silver", "#dcdee1"],
        ],
        costoUsd: 590,
      },
    ],
  },
  {
    nombre: "iPad Air 11 M4",
    categoria: "tablet",
    specs: { Chip: "Apple M4", Pantalla: '11" Liquid Retina' },
    configs: [
      {
        config: "128GB",
        colores: [
          ["Blue", "#7f9cc0"],
          ["Purple", "#b3a7cd"],
          ["Space Gray", "#5c5c5e"],
        ],
        costoUsd: 790,
      },
      {
        config: "256GB",
        colores: [
          ["Blue", "#7f9cc0"],
          ["Space Gray", "#5c5c5e"],
        ],
        costoUsd: 920,
      },
    ],
  },
  {
    nombre: "iPad Air 13 M3",
    categoria: "tablet",
    specs: { Chip: "Apple M3", Pantalla: '13" Liquid Retina' },
    configs: [
      { config: "128GB", colores: [["Starlight", "#e9dfd0"]], costoUsd: 870 },
      {
        config: "256GB",
        colores: [
          ["Blue", "#7f9cc0"],
          ["Purple", "#b3a7cd"],
        ],
        costoUsd: 930,
      },
    ],
  },
  {
    nombre: "iPad Air 13 M4",
    categoria: "tablet",
    specs: { Chip: "Apple M4", Pantalla: '13" Liquid Retina' },
    configs: [
      {
        config: "128GB",
        colores: [
          ["Space Gray", "#5c5c5e"],
          ["Blue", "#7f9cc0"],
          ["Starlight", "#e9dfd0"],
        ],
        costoUsd: 955,
      },
      {
        config: "256GB",
        colores: [
          ["Space Gray", "#5c5c5e"],
          ["Starlight", "#e9dfd0"],
        ],
        costoUsd: 1120,
      },
    ],
  },
];

/** Cada modelo Apple es un producto, y cada configuración por color, una variante. */
const APPLE_SEED: SeedProduct[] = LINEA_APPLE.map((modelo) => ({
  name: modelo.nombre,
  brand: "Apple",
  model: modelo.nombre,
  category: modelo.categoria,
  description: `${modelo.nombre} nuevo, sellado y con garantía. Consultanos por disponibilidad de color y configuración.`,
  specs: modelo.specs,
  variants: modelo.configs.flatMap((c) =>
    c.colores.map(([color, colorHex]) => ({
      storage: c.config,
      color,
      colorHex,
      grade: "sellado" as Grade,
      batteryHealth: null,
      priceUsd: conMargen(c.costoUsd),
      costUsd: c.costoUsd,
      stock: c.stock ?? 2,
    }))
  ),
}));

const SEED: SeedProduct[] = [
  ...IPHONE_SEED,
  ...PROVEEDOR_SEED,
  ...APPLE_SEED,
  {
    name: "iPad Air M2",
    brand: "Apple",
    model: "iPad Air M2",
    category: "tablet",
    description:
      'iPad Air de 11" con chip M2. Compatible con Apple Pencil Pro y Magic Keyboard.',
    specs: {
      Pantalla: '11" Liquid Retina',
      Chip: "M2",
      Cámara: "12 MP gran angular",
      Batería: "Hasta 10 h de navegación",
      Conectividad: "Wi-Fi 6E",
    },
    variants: [
      {
        storage: "128GB",
        color: "Azul",
        colorHex: "#7d95ad",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 700,
        costUsd: 590,
        stock: 2,
      },
      {
        storage: "256GB",
        color: "Gris Espacial",
        colorHex: "#57585c",
        grade: "a-plus",
        batteryHealth: 100,
        priceUsd: 780,
        costUsd: 660,
        stock: 1,
      },
    ],
  },
  {
    name: "Apple Watch Series 10",
    brand: "Apple",
    model: "Apple Watch Series 10",
    category: "reloj",
    description:
      "La pantalla más grande y el cuerpo más delgado de la historia del Apple Watch.",
    specs: {
      Caja: "46 mm aluminio",
      Pantalla: "LTPO3 OLED siempre activa",
      Sensores: "ECG, oxígeno en sangre, temperatura",
      Batería: "Hasta 18 h",
      Resistencia: "50 m",
    },
    variants: [
      {
        storage: "46mm GPS",
        color: "Titanio Natural",
        colorHex: "#c2bcb2",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 450,
        costUsd: 378,
        stock: 3,
      },
      {
        storage: "42mm GPS",
        color: "Medianoche",
        colorHex: "#2c2c34",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 400,
        costUsd: 336,
        stock: 2,
      },
    ],
  },
  {
    name: "AirPods Pro 2",
    brand: "Apple",
    model: "AirPods Pro 2",
    category: "audio",
    description:
      "Cancelación activa de ruido, Audio Adaptativo y estuche con USB-C. También funcionan como audífonos.",
    specs: {
      Chip: "H2",
      Cancelación: "Activa, hasta 2x más efectiva",
      Batería: "6 h + 30 h con el estuche",
      Estuche: "USB-C con MagSafe",
      Resistencia: "IP54",
    },
    featured: true,
    variants: [
      {
        storage: "USB-C",
        color: "Blanco",
        colorHex: "#f5f5f7",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 220,
        costUsd: 182,
        stock: 8,
      },
    ],
  },
  {
    name: "MacBook Air M3",
    brand: "Apple",
    model: "MacBook Air M3",
    category: "notebook",
    description:
      'MacBook Air de 13" con chip M3. Silencioso, delgado y con casi 18 horas de batería.',
    specs: {
      Pantalla: '13.6" Liquid Retina',
      Chip: "M3 de 8 núcleos",
      Memoria: "8 GB unificada",
      Batería: "Hasta 18 h",
      Puertos: "2× Thunderbolt, MagSafe 3",
    },
    variants: [
      {
        storage: "256GB",
        color: "Medianoche",
        colorHex: "#2c2c34",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1150,
        costUsd: 970,
        stock: 1,
      },
      {
        storage: "512GB",
        color: "Blanco Estelar",
        colorHex: "#f0ece4",
        grade: "a-plus",
        batteryHealth: 99,
        priceUsd: 1290,
        costUsd: 1090,
        stock: 1,
      },
    ],
  },
  {
    name: "PlayStation 5 Slim",
    brand: "Sony",
    model: "PlayStation 5 Slim",
    category: "consola",
    description:
      "PS5 Slim con lectora de discos. Más chica y liviana que la original, mismo rendimiento.",
    specs: {
      Almacenamiento: "1 TB SSD",
      Resolución: "Hasta 4K 120 Hz",
      Lectora: "Blu-ray Ultra HD",
      Incluye: "Un joystick DualSense",
    },
    variants: [
      {
        storage: "1TB",
        color: "Blanco",
        colorHex: "#f2f2f2",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 620,
        costUsd: 520,
        stock: 2,
      },
      {
        storage: "1TB",
        color: "Blanco",
        colorHex: "#f2f2f2",
        grade: "a-plus",
        batteryHealth: null,
        priceUsd: 540,
        costUsd: 452,
        stock: 1,
      },
    ],
  },
  {
    name: "Smartwatch estilo Watch Ultra",
    brand: "Genérico",
    model: "Smartwatch estilo Watch Ultra",
    category: "accesorio",
    description:
      "Réplica de línea premium. No es un Apple Watch: no corre watchOS ni se integra con el ecosistema de Apple.",
    specs: {
      Pantalla: '1.9" AMOLED',
      Batería: "Hasta 7 días",
      Compatibilidad: "Android e iOS por app propia",
      Resistencia: "IP68",
    },
    variants: [
      {
        storage: "49mm",
        color: "Titanio",
        colorHex: "#c2bcb2",
        grade: "sellado",
        authenticity: "replica",
        batteryHealth: null,
        priceUsd: 45,
        costUsd: 28,
        stock: 12,
      },
    ],
  },
  {
    name: "Auriculares estilo AirPods Pro",
    brand: "Genérico",
    model: "Auriculares estilo AirPods Pro",
    category: "accesorio",
    description:
      "Réplica con cancelación de ruido. No son AirPods originales: no tienen chip H2 ni integración nativa con iOS.",
    specs: {
      Cancelación: "Activa básica",
      Batería: "4 h + 20 h con estuche",
      Conexión: "Bluetooth 5.3",
      Estuche: "USB-C",
    },
    variants: [
      {
        storage: "USB-C",
        color: "Blanco",
        colorHex: "#f5f5f7",
        grade: "sellado",
        authenticity: "replica",
        batteryHealth: null,
        priceUsd: 25,
        costUsd: 14,
        stock: 20,
      },
    ],
  },
];

function slugFor(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Convierte la semilla declarativa en objetos de dominio con ids y precios en pesos. */
function buildProducts(): Product[] {
  const now = Date.now();
  return SEED.map((seed, i) => {
    const id = `p${i + 1}`;
    const slug = slugFor(seed.name);
    const variants: Variant[] = seed.variants.map((v, j) => ({
      id: `${id}v${j + 1}`,
      productId: id,
      storage: v.storage,
      color: v.color,
      colorHex: v.colorHex,
      grade: v.grade,
      authenticity: v.authenticity ?? "original",
      batteryHealth: v.batteryHealth ?? null,
      priceUsd: v.priceUsd,
      priceArs: Math.round((v.priceUsd * SETTINGS.dollarRate) / 1000) * 1000,
      costUsd: v.costUsd,
      stock: v.stock,
      // El slug ya es único por producto, así que sirve de raíz del SKU.
      sku: `${slug.toUpperCase()}-${v.storage}-${j + 1}`,
    }));

    return {
      id,
      name: seed.name,
      slug,
      ...parseModel(seed.model),
      brand: seed.brand,
      model: seed.model,
      category: seed.category,
      description: seed.description,
      specs: seed.specs,
      images: fotosDe(slug, seed),
      variants,
      isFeatured: seed.featured ?? false,
      // Escalonadas hacia atrás para que "más nuevo" tenga un orden estable.
      createdAt: new Date(now - i * 86_400_000).toISOString(),
    };
  });
}

export const PRODUCTS: Product[] = buildProducts();

export const REPAIR_SERVICES: RepairService[] = [
  {
    id: "r1",
    name: "Cambio de pantalla",
    device: "iPhone 11 a 16 Pro Max",
    description:
      "Módulo original o calidad premium según disponibilidad. Incluye prueba de Face ID y True Tone.",
    priceFrom: 85000,
    duration: "1 a 2 h",
    isActive: true,
  },
  {
    id: "r2",
    name: "Cambio de batería",
    device: "iPhone 11 a 16 Pro Max",
    description:
      "Batería nueva con ciclo cero. Recuperás la autonomía original del equipo.",
    priceFrom: 55000,
    duration: "45 min",
    isActive: true,
  },
  {
    id: "r3",
    name: "Cambio de pin de carga",
    device: "iPhone y iPad",
    description:
      "Reemplazo del puerto Lightning o USB-C cuando el equipo no carga o carga intermitente.",
    priceFrom: 48000,
    duration: "1 h",
    isActive: true,
  },
  {
    id: "r4",
    name: "Cambio de tapa trasera",
    device: "iPhone 8 a 16 Pro Max",
    description:
      "Reemplazo del vidrio trasero por láser, sin afectar la carga inalámbrica.",
    priceFrom: 65000,
    duration: "2 h",
    isActive: true,
  },
  {
    id: "r5",
    name: "Reparación de cámara",
    device: "iPhone 11 a 16 Pro Max",
    description:
      "Cámara trasera o frontal con fallas de enfoque, manchas o pantalla negra al abrir la app.",
    priceFrom: 72000,
    duration: "1 a 2 h",
    isActive: true,
  },
  {
    id: "r6",
    name: "Cambio de altavoz o micrófono",
    device: "iPhone y iPad",
    description:
      "Para equipos donde no se escucha en llamada o el otro lado no te escucha a vos.",
    priceFrom: 42000,
    duration: "1 h",
    isActive: true,
  },
  {
    id: "r7",
    name: "Recuperación por daño de líquido",
    device: "iPhone y iPad",
    description:
      "Limpieza ultrasónica de placa y diagnóstico. Se presupuesta después de revisarlo.",
    priceFrom: 60000,
    duration: "24 a 72 h",
    isActive: true,
  },
  {
    id: "r8",
    name: "Diagnóstico completo",
    device: "Todos los equipos Apple",
    description:
      "Revisión de batería, pantalla, cámaras, sensores y placa. Sin cargo si hacés la reparación acá.",
    priceFrom: 0,
    duration: "30 min",
    isActive: true,
  },
];

/**
 * Valores de toma del Plan Canje.
 *
 * Solo Apple: el canje es sobre lo que después podemos revender, y esa es la
 * especialidad. Se generan desde el mismo ancla de precio del catálogo, a un
 * porcentaje de lo que vale ese equipo sellado, así el canje nunca queda
 * desalineado del precio de venta.
 */
export const TRADE_IN_PRICES: TradeInPrice[] = Object.keys(IPHONE_PRICES)
  .map(Number)
  .sort((a, b) => b - a)
  .flatMap((generation, i) => {
    const { base, pro, proMax } = IPHONE_PRICES[generation];
    // Cuanto más viejo el equipo, más castigada la toma: se revende peor.
    const ratio = 0.72 - i * 0.02;

    /**
     * Todas las capacidades de cada modelo, no solo la base.
     *
     * Antes había una sola fila por modelo y quien tenía un 256 GB no podía
     * elegir su equipo: le quedaba una capacidad que no era la suya. El valor
     * de la toma acompaña el mismo escalón de precio que usa el catálogo, así
     * un 512 GB no se cotiza igual que un 128 GB.
     */
    return (
      [
        { line: "", price: base, key: "base" as const },
        { line: " Pro", price: pro, key: "pro" as const },
        { line: " Pro Max", price: proMax, key: "proMax" as const },
      ] as const
    ).flatMap(({ line, price, key }) =>
      IPHONE_STORAGES[key].map((storage) => ({
        id: `t-${generation}${line.trim().toLowerCase().replace(/\s+/g, "-") || "base"}-${storage.toLowerCase()}`,
        brand: "Apple",
        model: `iPhone ${generation}${line}`,
        storage,
        baseValue: Math.round(((price + STORAGE_STEP[storage]) * ratio) / 5) * 5,
      }))
    );
  });

export const SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Distribuidora Centro",
    phone: "+54 9 11 5555-1111",
    defaultMarginPct: 18,
    isActive: true,
  },
  {
    id: "s2",
    name: "Mayorista Once",
    phone: "+54 9 11 5555-2222",
    defaultMarginPct: 15,
    isActive: true,
  },
  {
    id: "s3",
    name: "Importaciones Sur",
    phone: "+54 9 11 5555-3333",
    defaultMarginPct: 22,
    isActive: true,
  },
];

export const POSTS: Post[] = [
  {
    id: "b1",
    title: "iPhone 16 vs iPhone 15: ¿conviene el salto?",
    slug: "iphone-16-vs-iphone-15",
    excerpt:
      "Comparamos las dos generaciones en cámara, batería y rendimiento real para ayudarte a decidir si el cambio vale la pena.",
    body: `El iPhone 16 trajo el chip A18, el botón de Control de Cámara y una mejora concreta en batería. Pero si venís de un iPhone 15, la pregunta es si esas diferencias justifican el cambio.

## Rendimiento

El A18 rinde entre un 20 y un 25 % más que el A16 del iPhone 15 en tareas exigentes. En uso diario —redes, mensajes, cámara— la diferencia es casi imperceptible. Se nota en edición de video y juegos pesados.

## Cámara

Los dos tienen sensor principal de 48 MP. El 16 suma un ultra gran angular con enfoque automático que habilita macro, algo que el 15 no puede hacer. Si sacás muchas fotos de cerca, es el argumento más fuerte.

## Batería

El 16 rinde alrededor de dos horas más de video. Si tu 15 ya tiene la batería por debajo del 85 %, cambiar la batería puede resolverte el problema por mucho menos plata.

## Conclusión

Si venís de un iPhone 13 o anterior, el salto al 16 se siente muchísimo. Si tenés un 15 en buen estado, esperá una generación más — o traelo por Plan Canje cuando salga el 17.`,
    coverUrl: `${PORTADAS_BLOG.comparacion}?auto=format&fit=crop&w=1200&h=750&q=80`,
    author: "Equipo iPhone Purple",
    publishedAt: "2026-08-18",
  },
  {
    id: "b2",
    title: "Cómo saber si un iPhone usado está en buen estado",
    slug: "como-revisar-un-iphone-usado",
    excerpt:
      "Los seis chequeos que hacemos en cada equipo antes de publicarlo, para que puedas hacerlos vos también.",
    body: `Comprar un iPhone usado es una gran decisión si sabés qué mirar. Estos son los chequeos que hacemos nosotros en cada equipo antes de que entre al catálogo.

## 1. Salud de la batería

Ajustes → Batería → Salud de la batería. Por debajo de 80 % el equipo empieza a limitar rendimiento. Nosotros no publicamos nada por debajo de 80, y siempre informamos el número exacto.

## 2. Que no esté bloqueado

Ajustes → General → Información. Si aparece "Bloqueo de activación", el equipo está atado a otra cuenta de iCloud y es inutilizable. Es el chequeo más importante de todos.

## 3. Número de serie

Verificalo en la página de cobertura de Apple. Te confirma el modelo real y si tiene garantía vigente.

## 4. Piezas originales

Ajustes → General → Información → Piezas y servicio. Ahí figura si la pantalla o la batería fueron cambiadas y si son originales.

## 5. Cámaras y sensores

Sacá una foto con cada lente, probá el Face ID y hacé una llamada. Son treinta segundos que evitan sorpresas.

## 6. Prueba de carga

Enchufalo y movelo. Si la carga se corta al mover el cable, el pin está gastado.

Todos los equipos que vendemos pasan por estos seis pasos y van con garantía escrita.`,
    coverUrl: `${PORTADAS_BLOG.revision}?auto=format&fit=crop&w=1200&h=750&q=80`,
    author: "Equipo iPhone Purple",
    publishedAt: "2026-07-30",
  },
  {
    id: "b3",
    title: "Plan Canje: cómo calculamos lo que vale tu equipo",
    slug: "como-calculamos-el-plan-canje",
    excerpt:
      "No hay misterio ni letra chica. Te contamos exactamente qué mira nuestra tasación y por qué.",
    body: `Mucha gente llega desconfiando del canje, y se entiende. Así que preferimos mostrar cómo se arma el número.

## El valor base

Cada modelo y capacidad tiene un valor de referencia que actualizamos todas las semanas según cómo se mueve el mercado local. Ese valor corresponde a un equipo en estado muy bueno.

## El estado

Sobre ese valor base aplicamos un ajuste según el estado real:

- **Como nuevo**: sin marcas de uso, batería arriba de 95 % → +15 %
- **Muy bueno**: micromarcas que no se ven de frente, batería arriba de 88 % → valor base
- **Bueno**: rayas visibles o batería entre 80 y 88 % → −15 %
- **Con detalles**: pantalla o tapa rotas, batería debajo de 80 % → se cotiza aparte

## Lo que suma

Caja, cable original y accesorios suman un poco. La factura de compra también, porque nos permite revenderlo con más confianza.

## Lo que resta

Bloqueo de iCloud pendiente, pantalla no original o daño por líquido cambian bastante el número. Nada de esto lo descubrimos después: lo revisamos con vos en el mostrador.

Podés cotizar online en dos minutos y después traerlo para confirmar. El valor que te damos online se respeta si el equipo está como lo describiste.`,
    coverUrl: `${PORTADAS_BLOG.detalle}?auto=format&fit=crop&w=1200&h=750&q=80`,
    author: "Equipo iPhone Purple",
    publishedAt: "2026-07-12",
  },
  {
    id: "b4",
    title: "Cuánto dura realmente la batería de un iPhone",
    slug: "cuanto-dura-la-bateria-de-un-iphone",
    excerpt:
      "Ciclos, porcentaje de salud y los hábitos que más la desgastan. Qué esperar y cuándo conviene cambiarla.",
    body: `La batería es la pieza que más consultas nos genera. Vamos con los números concretos.

## Los ciclos

Apple diseña las baterías de iPhone para conservar el 80 % de su capacidad después de 500 ciclos completos de carga —1000 en los modelos desde el iPhone 15. Un uso normal es de un ciclo por día, así que hablamos de entre año y medio y tres años.

## Qué significa el porcentaje

El número de "Salud de la batería" es capacidad máxima respecto de una batería nueva. Al 85 % tu equipo dura un 15 % menos que el primer día. Debajo de 80 %, iOS puede empezar a limitar el rendimiento para evitar apagones.

## Lo que más la desgasta

El calor, sobre todo. Dejar el equipo al sol o cargarlo dentro de una funda gruesa envejece la batería mucho más rápido que la cantidad de cargas. Cargarlo de noche no le hace mal: iOS administra la carga final.

## Cuándo cambiarla

Si estás por debajo de 85 % y te queda corto el día, el cambio de batería es la mejor inversión posible: por una fracción del precio de un equipo nuevo, recuperás la autonomía original.`,
    coverUrl: `${PORTADAS_BLOG.bateria}?auto=format&fit=crop&w=1200&h=750&q=80`,
    author: "Equipo iPhone Purple",
    publishedAt: "2026-06-25",
  },
];
