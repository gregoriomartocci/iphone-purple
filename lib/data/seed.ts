import { parseModel } from "@/lib/catalog";
import type {
  Authenticity,
  Category,
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
  defaultMarginPct: 18,
  whatsappNumber: "5491100000000",
  whatsappDisplay: "+54 9 11 0000-0000",
  instagram: "https://instagram.com/iphonepurple",
  tiktok: "https://tiktok.com/@iphonepurple",
  email: "hola@iphonepurple.com.ar",
  address: "Av. Corrientes 1234, CABA",
  hours: "Lunes a sábado de 10 a 19 h",
  mapsUrl: "https://maps.google.com/?q=Av.+Corrientes+1234,+CABA",
};

const img = (url: string, alt: string): ProductImage => ({
  url: `${url}?auto=format&fit=crop&w=1200&q=80`,
  alt,
});

/** Fotos genéricas por familia de producto. Se reemplazan al cargar las reales. */
const PHOTOS: Record<string, string> = {
  iphonePro: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
  iphone: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
  iphoneOlder: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
  ipad: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
  watch: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
  airpods: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
  mac: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  consola: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3",
  replica: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
};

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
  photo: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const SEED: SeedProduct[] = [
  {
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    model: "iPhone 16 Pro Max",
    category: "iphone",
    description:
      "El iPhone más grande y más rápido. Titanio, chip A18 Pro y el sistema de cámaras más completo que hizo Apple.",
    specs: {
      Pantalla: '6.9" Super Retina XDR ProMotion',
      Chip: "A18 Pro",
      Cámara: "48 MP principal + ultra gran angular + teleobjetivo 5x",
      Batería: "Hasta 33 h de video",
      Material: "Titanio",
    },
    photo: PHOTOS.iphonePro,
    featured: true,
    variants: [
      {
        storage: "256GB",
        color: "Titanio Desierto",
        colorHex: "#bfa48f",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1550,
        costUsd: 1310,
        stock: 3,
      },
      {
        storage: "512GB",
        color: "Titanio Natural",
        colorHex: "#c2bcb2",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1780,
        costUsd: 1510,
        stock: 1,
      },
      {
        storage: "256GB",
        color: "Titanio Negro",
        colorHex: "#3b3b3d",
        grade: "a-plus",
        batteryHealth: 99,
        priceUsd: 1380,
        costUsd: 1170,
        stock: 2,
      },
    ],
  },
  {
    name: "iPhone 16 Pro",
    brand: "Apple",
    model: "iPhone 16 Pro",
    category: "iphone",
    description:
      "Todo el poder del A18 Pro en un cuerpo más manejable. Botón de Control de Cámara y grabación en 4K120.",
    specs: {
      Pantalla: '6.3" Super Retina XDR ProMotion',
      Chip: "A18 Pro",
      Cámara: "48 MP principal + teleobjetivo 5x",
      Batería: "Hasta 27 h de video",
      Material: "Titanio",
    },
    photo: PHOTOS.iphonePro,
    featured: true,
    variants: [
      {
        storage: "128GB",
        color: "Titanio Natural",
        colorHex: "#c2bcb2",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1350,
        costUsd: 1140,
        stock: 4,
      },
      {
        storage: "256GB",
        color: "Titanio Negro",
        colorHex: "#3b3b3d",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1470,
        costUsd: 1245,
        stock: 2,
      },
      {
        storage: "128GB",
        color: "Titanio Blanco",
        colorHex: "#e8e4dd",
        grade: "a",
        batteryHealth: 94,
        priceUsd: 1150,
        costUsd: 975,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 16",
    brand: "Apple",
    model: "iPhone 16",
    category: "iphone",
    description:
      "Chip A18, cámara de 48 MP y Control de Cámara. El equilibrio justo entre precio y potencia.",
    specs: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A18",
      Cámara: "48 MP principal + ultra gran angular",
      Batería: "Hasta 22 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphone,
    featured: true,
    variants: [
      {
        storage: "128GB",
        color: "Ultramarino",
        colorHex: "#8fa5cc",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1000,
        costUsd: 845,
        stock: 5,
      },
      {
        storage: "256GB",
        color: "Verde Azulado",
        colorHex: "#a8c4bd",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1120,
        costUsd: 950,
        stock: 3,
      },
      {
        storage: "128GB",
        color: "Negro",
        colorHex: "#2c2c2e",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 1000,
        costUsd: 845,
        stock: 2,
      },
    ],
  },
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    category: "iphone",
    description:
      "Titanio, A17 Pro y teleobjetivo 5x. Uno de los equipos con mejor relación precio-calidad del catálogo.",
    specs: {
      Pantalla: '6.7" Super Retina XDR ProMotion',
      Chip: "A17 Pro",
      Cámara: "48 MP + teleobjetivo 5x",
      Batería: "Hasta 29 h de video",
      Material: "Titanio",
    },
    photo: PHOTOS.iphonePro,
    featured: true,
    variants: [
      {
        storage: "256GB",
        color: "Titanio Natural",
        colorHex: "#c2bcb2",
        grade: "a-plus",
        batteryHealth: 97,
        priceUsd: 1120,
        costUsd: 950,
        stock: 2,
      },
      {
        storage: "256GB",
        color: "Titanio Azul",
        colorHex: "#5f6b7a",
        grade: "a",
        batteryHealth: 91,
        priceUsd: 1010,
        costUsd: 855,
        stock: 1,
      },
      {
        storage: "512GB",
        color: "Titanio Negro",
        colorHex: "#3b3b3d",
        grade: "a",
        batteryHealth: 89,
        priceUsd: 1180,
        costUsd: 1000,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "iPhone 15 Pro",
    category: "iphone",
    description:
      "El primer iPhone de titanio en formato compacto. USB-C, A17 Pro y botón de Acción.",
    specs: {
      Pantalla: '6.1" Super Retina XDR ProMotion',
      Chip: "A17 Pro",
      Cámara: "48 MP + teleobjetivo 3x",
      Batería: "Hasta 23 h de video",
      Material: "Titanio",
    },
    photo: PHOTOS.iphonePro,
    variants: [
      {
        storage: "128GB",
        color: "Titanio Negro",
        colorHex: "#3b3b3d",
        grade: "a",
        batteryHealth: 92,
        priceUsd: 870,
        costUsd: 735,
        stock: 3,
      },
      {
        storage: "256GB",
        color: "Titanio Blanco",
        colorHex: "#e8e4dd",
        grade: "a-plus",
        batteryHealth: 98,
        priceUsd: 980,
        costUsd: 830,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 15",
    brand: "Apple",
    model: "iPhone 15",
    category: "iphone",
    description:
      "Dynamic Island, cámara de 48 MP y USB-C. Sigue siendo la mejor puerta de entrada a iOS.",
    specs: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A16 Bionic",
      Cámara: "48 MP principal + ultra gran angular",
      Batería: "Hasta 20 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphone,
    featured: true,
    variants: [
      {
        storage: "128GB",
        color: "Rosa",
        colorHex: "#f0d5d8",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 820,
        costUsd: 690,
        stock: 4,
      },
      {
        storage: "128GB",
        color: "Negro",
        colorHex: "#2c2c2e",
        grade: "a",
        batteryHealth: 93,
        priceUsd: 700,
        costUsd: 590,
        stock: 2,
      },
      {
        storage: "256GB",
        color: "Azul",
        colorHex: "#b4c8d8",
        grade: "a",
        batteryHealth: 90,
        priceUsd: 780,
        costUsd: 660,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 14 Pro",
    brand: "Apple",
    model: "iPhone 14 Pro",
    category: "iphone",
    description:
      "El que estrenó la Dynamic Island. Pantalla siempre activa y cámara de 48 MP a muy buen precio.",
    specs: {
      Pantalla: '6.1" Super Retina XDR ProMotion',
      Chip: "A16 Bionic",
      Cámara: "48 MP + teleobjetivo 3x",
      Batería: "Hasta 23 h de video",
      Material: "Acero inoxidable",
    },
    photo: PHOTOS.iphonePro,
    variants: [
      {
        storage: "128GB",
        color: "Morado Oscuro",
        colorHex: "#5b5069",
        grade: "a",
        batteryHealth: 88,
        priceUsd: 700,
        costUsd: 590,
        stock: 2,
      },
      {
        storage: "256GB",
        color: "Negro Espacial",
        colorHex: "#3a3a3c",
        grade: "a",
        batteryHealth: 91,
        priceUsd: 780,
        costUsd: 660,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 14",
    brand: "Apple",
    model: "iPhone 14",
    category: "iphone",
    description:
      "Batería para todo el día y cámaras muy sólidas. La opción más elegida por relación precio-calidad.",
    specs: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A15 Bionic",
      Cámara: "12 MP principal + ultra gran angular",
      Batería: "Hasta 20 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphone,
    variants: [
      {
        storage: "128GB",
        color: "Medianoche",
        colorHex: "#2c2c34",
        grade: "a",
        batteryHealth: 89,
        priceUsd: 600,
        costUsd: 505,
        stock: 3,
      },
      {
        storage: "128GB",
        color: "Blanco Estelar",
        colorHex: "#f0ece4",
        grade: "a-minus",
        batteryHealth: 84,
        priceUsd: 540,
        costUsd: 455,
        stock: 2,
      },
    ],
  },
  {
    name: "iPhone 13",
    brand: "Apple",
    model: "iPhone 13",
    category: "iphone",
    description:
      "Un clásico que no baja el nivel. Excelente batería y cámara con modo Cinemático.",
    specs: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A15 Bionic",
      Cámara: "12 MP dual",
      Batería: "Hasta 19 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphoneOlder,
    variants: [
      {
        storage: "128GB",
        color: "Medianoche",
        colorHex: "#2c2c34",
        grade: "a",
        batteryHealth: 87,
        priceUsd: 470,
        costUsd: 395,
        stock: 4,
      },
      {
        storage: "256GB",
        color: "Azul",
        colorHex: "#87a6c4",
        grade: "a-minus",
        batteryHealth: 83,
        priceUsd: 510,
        costUsd: 430,
        stock: 1,
      },
    ],
  },
  {
    name: "iPhone 12",
    brand: "Apple",
    model: "iPhone 12",
    category: "iphone",
    description:
      "Pantalla OLED y 5G en el rango más accesible. Ideal como primer iPhone.",
    specs: {
      Pantalla: '6.1" Super Retina XDR',
      Chip: "A14 Bionic",
      Cámara: "12 MP dual",
      Batería: "Hasta 17 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphoneOlder,
    variants: [
      {
        storage: "64GB",
        color: "Negro",
        colorHex: "#2c2c2e",
        grade: "a-minus",
        batteryHealth: 82,
        priceUsd: 330,
        costUsd: 275,
        stock: 3,
      },
      {
        storage: "128GB",
        color: "Verde",
        colorHex: "#c9ddc4",
        grade: "a",
        batteryHealth: 86,
        priceUsd: 390,
        costUsd: 328,
        stock: 2,
      },
    ],
  },
  {
    name: "iPhone 11",
    brand: "Apple",
    model: "iPhone 11",
    category: "iphone",
    description:
      "El más vendido de su generación. Batería enorme y buen rendimiento para el uso diario.",
    specs: {
      Pantalla: '6.1" Liquid Retina HD',
      Chip: "A13 Bionic",
      Cámara: "12 MP dual",
      Batería: "Hasta 17 h de video",
      Material: "Aluminio",
    },
    photo: PHOTOS.iphoneOlder,
    variants: [
      {
        storage: "64GB",
        color: "Blanco",
        colorHex: "#f2f2f0",
        grade: "a-minus",
        batteryHealth: 81,
        priceUsd: 250,
        costUsd: 208,
        stock: 2,
      },
      {
        storage: "128GB",
        color: "Negro",
        colorHex: "#2c2c2e",
        grade: "a-minus",
        batteryHealth: 80,
        priceUsd: 290,
        costUsd: 242,
        stock: 0,
      },
    ],
  },
  {
    name: "iPad Air M2",
    brand: "Apple",
    model: "iPad Air M2",
    category: "ipad",
    description:
      'iPad Air de 11" con chip M2. Compatible con Apple Pencil Pro y Magic Keyboard.',
    specs: {
      Pantalla: '11" Liquid Retina',
      Chip: "M2",
      Cámara: "12 MP gran angular",
      Batería: "Hasta 10 h de navegación",
      Conectividad: "Wi-Fi 6E",
    },
    photo: PHOTOS.ipad,
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
    category: "watch",
    description:
      "La pantalla más grande y el cuerpo más delgado de la historia del Apple Watch.",
    specs: {
      Caja: "46 mm aluminio",
      Pantalla: "LTPO3 OLED siempre activa",
      Sensores: "ECG, oxígeno en sangre, temperatura",
      Batería: "Hasta 18 h",
      Resistencia: "50 m",
    },
    photo: PHOTOS.watch,
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
    photo: PHOTOS.airpods,
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
    category: "mac",
    description:
      'MacBook Air de 13" con chip M3. Silencioso, delgado y con casi 18 horas de batería.',
    specs: {
      Pantalla: '13.6" Liquid Retina',
      Chip: "M3 de 8 núcleos",
      Memoria: "8 GB unificada",
      Batería: "Hasta 18 h",
      Puertos: "2× Thunderbolt, MagSafe 3",
    },
    photo: PHOTOS.mac,
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
    photo: PHOTOS.consola,
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
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    model: "Nintendo Switch OLED",
    category: "consola",
    description:
      "Pantalla OLED de 7 pulgadas, dock con puerto de red y 64 GB de almacenamiento.",
    specs: {
      Pantalla: '7" OLED',
      Almacenamiento: "64 GB",
      Batería: "4.5 a 9 h",
      Incluye: "Dock y Joy-Con",
    },
    photo: PHOTOS.consola,
    variants: [
      {
        storage: "64GB",
        color: "Blanco",
        colorHex: "#f2f2f2",
        grade: "sellado",
        batteryHealth: null,
        priceUsd: 390,
        costUsd: 325,
        stock: 3,
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
    photo: PHOTOS.watch,
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
    photo: PHOTOS.airpods,
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
      images: [img(seed.photo, seed.name)],
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

export const TRADE_IN_PRICES: TradeInPrice[] = [
  {
    id: "t1",
    brand: "Apple",
    model: "iPhone 16 Pro Max",
    storage: "256GB",
    baseValue: 1120,
  },
  { id: "t2", brand: "Apple", model: "iPhone 16 Pro", storage: "128GB", baseValue: 950 },
  { id: "t3", brand: "Apple", model: "iPhone 16", storage: "128GB", baseValue: 700 },
  {
    id: "t4",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    storage: "256GB",
    baseValue: 830,
  },
  { id: "t5", brand: "Apple", model: "iPhone 15 Pro", storage: "128GB", baseValue: 690 },
  { id: "t6", brand: "Apple", model: "iPhone 15", storage: "128GB", baseValue: 540 },
  { id: "t7", brand: "Apple", model: "iPhone 14 Pro", storage: "128GB", baseValue: 530 },
  { id: "t8", brand: "Apple", model: "iPhone 14", storage: "128GB", baseValue: 420 },
  { id: "t9", brand: "Apple", model: "iPhone 13", storage: "128GB", baseValue: 330 },
  { id: "t10", brand: "Apple", model: "iPhone 12", storage: "64GB", baseValue: 220 },
  { id: "t11", brand: "Apple", model: "iPhone 11", storage: "64GB", baseValue: 160 },
  {
    id: "t12",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    storage: "256GB",
    baseValue: 560,
  },
  { id: "t13", brand: "Samsung", model: "Galaxy S23", storage: "128GB", baseValue: 300 },
  {
    id: "t14",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro",
    storage: "256GB",
    baseValue: 130,
  },
];

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
    coverUrl: `${PHOTOS.iphone}?auto=format&fit=crop&w=1200&q=80`,
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
    coverUrl: `${PHOTOS.iphoneOlder}?auto=format&fit=crop&w=1200&q=80`,
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
    coverUrl: `${PHOTOS.iphonePro}?auto=format&fit=crop&w=1200&q=80`,
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
    coverUrl: `${PHOTOS.airpods}?auto=format&fit=crop&w=1200&q=80`,
    author: "Equipo iPhone Purple",
    publishedAt: "2026-06-25",
  },
];
