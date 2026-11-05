/**
 * Colores oficiales de Apple, por familia de modelo.
 *
 * Los proveedores escriben el color como les sale: "Negro", "black", "Desert",
 * "titanio desierto". Sin esto, el mismo color aparecía dos veces con nombres
 * distintos, y como todos se guardaban con el mismo gris, las muestras eran
 * iguales entre sí.
 *
 * Los nombres son los de Apple en inglés, que es como los nombran los
 * proveedores y los clientes ("Burgundy", "Deep Blue"). Los tonos son
 * aproximados: Apple no publica un código de color, y la muestra solo tiene
 * que distinguirse de las otras.
 */

export interface ColorOficial {
  nombre: string;
  hex: string;
}

type Entrada = [nombre: string, hex: string, alias: string[]];

const NEGRO = ["black", "negro"];
const BLANCO = ["white", "blanco"];
const PLATA = ["silver", "plata", "plateado"];
const AZUL = ["blue", "azul"];
const ROSA = ["pink", "rosa"];
const VERDE = ["green", "verde"];
const AMARILLO = ["yellow", "amarillo"];
const ROJO = ["red", "rojo", "product red"];
const VIOLETA = ["purple", "violeta", "morado", "lila"];
const DORADO = ["gold", "dorado", "oro"];

/** De la familia más específica a la más general: gana la primera que coincide. */
const FAMILIAS: [RegExp, Entrada[]][] = [
  [
    /^iphone 18 pro/i,
    [
      ["Silver", "#e3e4e1", PLATA],
      [
        "Burgundy",
        "#6b2433",
        ["burgundy", "bordo", "bordó", "borgoña", "burdeos", "vino"],
      ],
      ["Glacier", "#c9dbe3", ["glacier", "glaciar", "celeste"]],
      ["Black", "#2b2b2d", NEGRO],
    ],
  ],
  [
    /^iphone 17 pro/i,
    [
      [
        "Cosmic Orange",
        "#e8762d",
        ["cosmic orange", "orange", "naranja", "naranja cosmico"],
      ],
      ["Deep Blue", "#2f3c56", ["deep blue", ...AZUL, "azul profundo"]],
      ["Silver", "#e3e4e1", PLATA],
    ],
  ],
  [
    /^iphone 17e/i,
    [
      ["Black", "#2c2c2e", NEGRO],
      ["White", "#f5f5f0", BLANCO],
      ["Soft Pink", "#f4d3d8", ["soft pink", ...ROSA]],
    ],
  ],
  [
    /^iphone 17\b/i,
    [
      ["Black", "#2c2c2e", NEGRO],
      ["White", "#f5f5f0", BLANCO],
      ["Mist Blue", "#a9bfd6", ["mist blue", ...AZUL]],
      ["Sage", "#b4c3a0", ["sage", "salvia", ...VERDE]],
      ["Lavender", "#cbbfe0", ["lavender", "lavanda", ...VIOLETA]],
    ],
  ],
  [
    /^iphone 16e/i,
    [
      ["Black", "#2c2c2e", NEGRO],
      ["White", "#f5f5f0", BLANCO],
    ],
  ],
  [
    /^iphone 16 pro/i,
    [
      ["Black Titanium", "#3c3c3d", ["black titanium", "titanio negro", ...NEGRO]],
      ["White Titanium", "#f2f1ed", ["white titanium", "titanio blanco", ...BLANCO]],
      ["Natural Titanium", "#c2bcb2", ["natural titanium", "titanio natural", "natural"]],
      [
        "Desert Titanium",
        "#bfa48f",
        ["desert titanium", "titanio desierto", "desert", "desierto"],
      ],
    ],
  ],
  [
    /^iphone 16\b/i,
    [
      ["Black", "#3a3a3c", NEGRO],
      ["White", "#f5f5f0", BLANCO],
      ["Pink", "#f5c5d4", ROSA],
      ["Teal", "#a6cfc8", ["teal", "verde azulado", ...VERDE]],
      ["Ultramarine", "#6f7fd6", ["ultramarine", "ultramarino", ...AZUL]],
    ],
  ],
  [
    /^iphone 15 pro/i,
    [
      ["Black Titanium", "#3b3b3d", ["black titanium", "titanio negro", ...NEGRO]],
      ["White Titanium", "#f2f1ed", ["white titanium", "titanio blanco", ...BLANCO]],
      ["Blue Titanium", "#3f4a59", ["blue titanium", "titanio azul", ...AZUL]],
      ["Natural Titanium", "#bab4a9", ["natural titanium", "titanio natural", "natural"]],
    ],
  ],
  [
    /^iphone 15\b/i,
    [
      ["Black", "#35393b", NEGRO],
      ["Blue", "#d4e1e9", AZUL],
      ["Green", "#dde6d4", VERDE],
      ["Yellow", "#f6eebd", AMARILLO],
      ["Pink", "#f3dde0", ROSA],
    ],
  ],
  [
    /^iphone 14 pro/i,
    [
      ["Space Black", "#403e3d", ["space black", "negro espacial", ...NEGRO]],
      ["Silver", "#f0f2f2", PLATA],
      ["Gold", "#f4e8ce", DORADO],
      ["Deep Purple", "#594f63", ["deep purple", "morado oscuro", ...VIOLETA]],
    ],
  ],
  [
    /^iphone 1[34](?! pro)\b/i,
    [
      ["Midnight", "#222930", ["midnight", "medianoche", ...NEGRO]],
      ["Starlight", "#f9f3ee", ["starlight", "blanco estelar", ...BLANCO]],
      ["Blue", "#3f6f8f", AZUL],
      ["Pink", "#faddd7", ROSA],
      ["Green", "#394c38", VERDE],
      ["Purple", "#e5ddea", VIOLETA],
      ["Yellow", "#f9e479", AMARILLO],
      ["(PRODUCT)RED", "#c4122a", ROJO],
    ],
  ],
  [
    /^iphone 13 pro/i,
    [
      ["Graphite", "#54524f", ["graphite", "grafito", ...NEGRO]],
      ["Gold", "#fae7cf", DORADO],
      ["Silver", "#f1f2ed", PLATA],
      ["Sierra Blue", "#a7c1d9", ["sierra blue", "azul sierra", ...AZUL]],
      ["Alpine Green", "#576856", ["alpine green", "verde alpino", ...VERDE]],
    ],
  ],
  [/^mac mini/i, [["Silver", "#e3e4e5", PLATA]]],
  [
    /^macbook air/i,
    [
      ["Sky Blue", "#c7d5e3", ["sky blue", "azul cielo", ...AZUL]],
      ["Silver", "#e3e4e5", PLATA],
      ["Starlight", "#ede6db", ["starlight", "star", "blanco estelar"]],
      ["Midnight", "#2e3642", ["midnight", "mid", "medianoche", ...NEGRO]],
    ],
  ],
  [
    /^macbook pro/i,
    [
      ["Space Black", "#2e2c2f", ["space black", "negro espacial", ...NEGRO]],
      ["Silver", "#e3e4e5", PLATA],
    ],
  ],
  [
    /^ipad air/i,
    [
      [
        "Space Gray",
        "#7d7e80",
        ["space gray", "space grey", "space", "gris espacial", "gris"],
      ],
      ["Blue", "#a9bcd0", AZUL],
      ["Purple", "#c8bfdc", VIOLETA],
      ["Starlight", "#ede6db", ["starlight", "blanco estelar", ...BLANCO]],
    ],
  ],
  [
    /^ipad\b/i,
    [
      ["Blue", "#8fb0d6", AZUL],
      ["Pink", "#f0c3cf", ROSA],
      ["Yellow", "#f5dc6a", AMARILLO],
      ["Silver", "#e3e4e5", PLATA],
    ],
  ],
  [
    /^airpods max/i,
    [
      ["Midnight", "#2e3642", ["midnight", "medianoche", ...NEGRO]],
      ["Starlight", "#ede6db", ["starlight", "blanco estelar", ...BLANCO]],
      ["Blue", "#8fa9c6", AZUL],
      ["Purple", "#c3b4d6", VIOLETA],
      ["Orange", "#f0a46b", ["orange", "naranja"]],
    ],
  ],
];

/** Para todo lo que no es una familia de Apple conocida. */
const GENERICOS: Entrada[] = [
  ["Negro", "#2b2b2d", [...NEGRO, "black titanium", "obsidian"]],
  ["Obsidiana", "#2f3133", ["obsidiana"]],
  ["Blanco", "#f5f5f0", BLANCO],
  [
    "Gris",
    "#8e8e93",
    ["gray", "grey", "gris", "space gray", "gris espacial", "charcoal"],
  ],
  ["Plata", "#e3e4e5", PLATA],
  ["Azul", "#3a5f8f", AZUL],
  ["Celeste", "#a9cbe6", ["light blue", "lightblue", "celeste"]],
  ["Rosa", "#f2c6cf", ROSA],
  ["Rojo", "#bf0013", ROJO],
  ["Verde", "#4e6b52", VERDE],
  ["Amarillo", "#f3d05a", AMARILLO],
  ["Naranja", "#e5743a", ["orange", "naranja"]],
  ["Violeta", "#b9a8d0", VIOLETA],
  ["Dorado", "#e6d3b3", DORADO],
  ["Crema", "#efe6d6", ["cream", "crema", "beige"]],
  ["Titanio natural", "#c2bcb2", ["natural titanium", "titanio natural", "natural"]],
  ["Titanio desierto", "#bfa48f", ["desert titanium", "titanio desierto", "desert"]],
  ["Medianoche", "#2e3642", ["midnight", "medianoche"]],
  ["Burgundy", "#6b2433", ["burgundy", "bordo", "bordó", "borgoña"]],
];

const SIN_COLOR = new Set(["", "sin especificar", "n/a", "-", "varios", "surtido"]);

function limpio(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9() ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buscar(entradas: Entrada[], color: string): ColorOficial | null {
  const c = limpio(color);
  const hallada = entradas.find(
    ([nombre, , alias]) => limpio(nombre) === c || alias.some((a) => limpio(a) === c)
  );
  return hallada ? { nombre: hallada[0], hex: hallada[1] } : null;
}

/**
 * El color tal como se muestra, o `null` si no se sabe. Un color que no se
 * sabe no se muestra: una muestra gris de "Sin especificar" parece un color.
 */
export function colorOficial(
  modelo: string,
  color: string | null | undefined
): ColorOficial | null {
  if (!color || SIN_COLOR.has(limpio(color))) return null;
  const familia = FAMILIAS.find(([patron]) => patron.test(modelo.trim()))?.[1];
  const nombre = color.trim();
  return (
    (familia && buscar(familia, nombre)) ??
    buscar(GENERICOS, nombre) ?? {
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      hex: "#cccccc",
    }
  );
}

/** Parte "Silver/Burgundy" o "azul, plata y negro" en cada color. */
function partes(texto: string): string[] {
  return texto
    .split(/[/,·|]|\s+y\s+/i)
    .map((c) => c.trim())
    .filter(Boolean);
}

function sinRepetir(colores: ColorOficial[]): ColorOficial[] {
  const vistos = new Set<string>();
  return colores.filter((c) => !vistos.has(c.nombre) && vistos.add(c.nombre));
}

/**
 * Todos los colores que trae un texto. Una variante guarda los suyos juntos
 * ("Starlight/Sky Blue") porque es un solo equipo a un solo precio: el color se
 * elige, pero no cambia ni el SKU ni la oferta.
 */
export function coloresOficiales(
  modelo: string,
  texto: string | null | undefined
): ColorOficial[] {
  if (!texto) return [];
  return sinRepetir(
    partes(texto)
      .map((c) => colorOficial(modelo, c))
      .filter((c): c is ColorOficial => c !== null)
  );
}

/**
 * Los colores de una fila de lista: los del campo color y los que quedaron en
 * las notas ("Colores disponibles: azul / medianoche"). De las notas solo se
 * toma lo que es un color conocido: ahí también hay texto libre, y una palabra
 * cualquiera no puede convertirse en una muestra.
 */
export function coloresDeFila(
  modelo: string,
  color: string | null | undefined,
  notas: string | null | undefined
): ColorOficial[] {
  const nota = /colou?res?(?:\s+disponibles?)?\s*:\s*([^.;\n]+)/i.exec(notas ?? "")?.[1];
  const familia = FAMILIAS.find(([patron]) => patron.test(modelo.trim()))?.[1];
  const deNotas = partes(nota ?? "")
    .map((c) => (familia && buscar(familia, c)) ?? buscar(GENERICOS, c))
    .filter((c): c is ColorOficial => c !== null);
  return sinRepetir([...coloresOficiales(modelo, color), ...deNotas]);
}

/** Lo que se guarda en la base: los nombres juntos, y la muestra del primero. */
export function colorParaGuardar(colores: ColorOficial[]): {
  color: string;
  color_hex: string;
} {
  return {
    color: colores.map((c) => c.nombre).join("/") || "Sin especificar",
    color_hex: colores[0]?.hex ?? "#cccccc",
  };
}

/** Los colores de una variante; la semilla trae uno solo y sin la lista. */
export function coloresDe(variante: {
  color: string;
  colorHex: string;
  colores?: ColorOficial[];
}): ColorOficial[] {
  if (variante.colores) return variante.colores;
  return variante.color ? [{ nombre: variante.color, hex: variante.colorHex }] : [];
}

/** Para mostrar en una línea: "Starlight / Sky Blue". */
export function nombresDeColores(variante: {
  color: string;
  colorHex: string;
  colores?: ColorOficial[];
}): string {
  return coloresDe(variante)
    .map((c) => c.nombre)
    .join(" / ");
}
