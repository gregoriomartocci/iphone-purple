import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AUTHENTICITY_LABELS, CATEGORIES, GRADES } from "@/types";

/**
 * Que los CHECK del esquema acepten exactamente lo que el código produce.
 *
 * Los dos se escriben por separado y se desincronizan sin que nada avise: el
 * typecheck no lee SQL, los tests corren con la semilla en memoria y el build
 * tampoco toca la base. El desajuste aparece recién al insertar, en
 * producción, con un error de Postgres.
 *
 * Ya había pasado. El catálogo arrancó siendo solo Apple y las categorías
 * eran 'iphone', 'ipad', 'mac', 'watch'. Cuando entraron Xiaomi, Motorola y
 * las notebooks, el tipo de TypeScript pasó a 'celular', 'tablet',
 * 'notebook', 'reloj' y el esquema quedó como estaba. De las 73 filas de
 * `seed.sql` —que se genera desde ese mismo tipo— 65 habrían sido rechazadas
 * al cargarlas. Lo mismo con el grado: el código usa 'a-minus' y el CHECK
 * pedía 'b'.
 */

const schema = readFileSync(
  path.join(process.cwd(), "lib", "supabase", "schema.sql"),
  "utf8"
);

/** Los valores de un `CHECK (<columna> IN (...))`, tal como los lee Postgres. */
function valoresDelCheck(columna: string): string[][] {
  const re = new RegExp(`CHECK \\(${columna} IN \\(([^)]*)\\)\\)`, "g");
  return [...schema.matchAll(re)].map((m) =>
    m[1].split(",").map((v) => v.trim().replace(/^'|'$/g, ""))
  );
}

describe("el esquema acepta lo que el código produce", () => {
  it("las categorías del CHECK son las del tipo Category", () => {
    const enElSchema = valoresDelCheck("category");
    expect(enElSchema).toHaveLength(1);
    expect([...enElSchema[0]].sort()).toEqual([...CATEGORIES].sort());
  });

  /**
   * El grado aparece en dos tablas —variantes y cotización del canje— y las
   * dos tienen que aceptar lo mismo: un equipo que se cotiza no se podría
   * cargar después.
   */
  it("los grados del CHECK son los del tipo Grade, en las dos tablas", () => {
    const enElSchema = valoresDelCheck("grade");
    expect(enElSchema.length).toBeGreaterThanOrEqual(2);
    for (const valores of enElSchema) {
      expect([...valores].sort()).toEqual([...GRADES].sort());
    }
  });

  it("la autenticidad del CHECK es la del tipo Authenticity", () => {
    const enElSchema = valoresDelCheck("authenticity");
    expect(enElSchema).toHaveLength(1);
    expect([...enElSchema[0]].sort()).toEqual(Object.keys(AUTHENTICITY_LABELS).sort());
  });
});

/**
 * Que el valor por defecto de una columna pase su propio CHECK.
 *
 * Suena imposible y no lo es: al corregir las categorías quedó
 * `category TEXT NOT NULL DEFAULT 'iphone'` con un CHECK que ya no aceptaba
 * 'iphone'. Postgres acepta el CREATE TABLE sin chistar —no valida el default
 * contra el check al crear— y falla recién al insertar una fila que no traiga
 * la columna. Se encontró a mano, un minuto antes de correr el esquema.
 */
describe("los valores por defecto pasan su propio CHECK", () => {
  const defaults = [
    ...schema.matchAll(
      /(\w+)\s+TEXT(?:\s+NOT NULL)?\s+DEFAULT\s+'([^']+)'\s*(?:\n\s*)?CHECK \(\1 IN \(([^)]*)\)\)/g
    ),
  ];

  it("encuentra columnas para revisar", () => {
    expect(defaults.length).toBeGreaterThanOrEqual(6);
  });

  it.each(defaults.map((m) => [m[1], m[2], m[3]]))(
    "%s por defecto es '%s', y el CHECK lo acepta",
    (_columna, pordefecto, lista) => {
      const permitidos = lista.split(",").map((v) => v.trim().replace(/^'|'$/g, ""));
      expect(permitidos).toContain(pordefecto);
    }
  );
});

describe("la semilla entra en el esquema", () => {
  const seed = readFileSync(
    path.join(process.cwd(), "lib", "supabase", "seed.sql"),
    "utf8"
  );

  /**
   * `seed.sql` se genera desde la semilla de TypeScript con `npm run seed:sql`
   * y es lo primero que se carga en una base nueva. Si una sola fila viola un
   * CHECK, el archivo entero se corta a la mitad.
   */
  it("no usa ninguna categoría que el CHECK rechace", () => {
    const permitidas = new Set<string>(CATEGORIES);
    const usadas = new Set(
      [
        ...seed.matchAll(
          /'(celular|tablet|notebook|reloj|audio|consola|hogar|accesorio|iphone|ipad|mac|watch)'/g
        ),
      ].map((m) => m[1])
    );
    const rechazadas = [...usadas].filter((c) => !permitidas.has(c as never));
    expect(rechazadas).toEqual([]);
  });

  it("no usa ningún grado que el CHECK rechace", () => {
    const permitidos = new Set<string>(GRADES);
    const usados = new Set(
      [...seed.matchAll(/'(sellado|a-plus|a-minus|b)'/g)].map((m) => m[1])
    );
    const rechazados = [...usados].filter((g) => !permitidos.has(g as never));
    expect(rechazados).toEqual([]);
  });
});
