import { describe, expect, it } from "vitest";
import { listasParaImportar, planificarPublicacion } from "@/lib/whatsapp/plan";
import type { ChatWhatsapp, MensajeWhatsapp } from "@/lib/whatsapp/sincronizar";
import type { ParsedRow, Supplier } from "@/types";

const LISTA = "iPhone 15 Pro 256 900\niPhone 14 128 650\niPad Air 480";
const DOLAR = 1200;

function fila(p: Partial<ParsedRow> = {}): ParsedRow {
  return {
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: "256GB",
    color: null,
    category: "celular",
    grade: "sellado",
    authenticity: "original",
    batteryHealth: null,
    currency: "USD",
    cost: 900,
    quantity: 1,
    notes: null,
    ...p,
  };
}

function proveedor(p: Partial<Supplier> = {}): Supplier {
  return {
    id: "prov-1",
    name: "Apple Touch mayorista",
    phone: "5492211234567",
    defaultMarginPct: 10,
    isActive: true,
    ...p,
  };
}

function mensaje(p: Partial<MensajeWhatsapp> = {}): MensajeWhatsapp {
  return {
    fecha: "2026-10-30T10:00:00Z",
    mio: false,
    texto: LISTA,
    autor: "5492211234567",
    ...p,
  };
}

function chat(p: Partial<ChatWhatsapp> = {}): ChatWhatsapp {
  return {
    jid: "5492211234567@s.whatsapp.net",
    nombre: "Apple Touch",
    telefono: "5492211234567",
    grupo: false,
    mensajes: [],
    ...p,
  };
}

const nunca = () => null;

describe("listasParaImportar", () => {
  it("devuelve una sola lista por proveedor, la más nueva", () => {
    const listas = listasParaImportar(
      [
        chat({
          mensajes: [
            mensaje({ fecha: "2026-10-28T10:00:00Z" }),
            mensaje({ fecha: "2026-10-30T10:00:00Z" }),
          ],
        }),
      ],
      [proveedor()],
      nunca
    );

    expect(listas).toHaveLength(1);
    expect(listas[0].mensaje.fecha).toBe("2026-10-30T10:00:00Z");
  });

  /**
   * El caso que justifica juntar por proveedor antes de elegir: mandó la lista
   * al grupo y la corrigió por privado. Mirando cada chat por separado se
   * importarían las dos, y competirían entre sí con datos de la misma persona.
   */
  it("unifica al proveedor que escribió en el grupo y después por privado", () => {
    const listas = listasParaImportar(
      [
        chat({
          jid: "12036-99@g.us",
          nombre: "comunidad iCell Oeste",
          grupo: true,
          mensajes: [mensaje({ fecha: "2026-10-30T10:00:00Z" })],
        }),
        chat({
          nombre: "Fran privado",
          mensajes: [mensaje({ fecha: "2026-10-30T11:00:00Z" })],
        }),
      ],
      [proveedor()],
      nunca
    );

    expect(listas).toHaveLength(1);
    expect(listas[0].mensaje.fecha).toBe("2026-10-30T11:00:00Z");
    expect(listas[0].chat).toBe("Fran privado");
  });

  it("no vuelve a pagar por una lista ya importada", () => {
    const listas = listasParaImportar(
      [chat({ mensajes: [mensaje({ fecha: "2026-10-30T10:00:00Z" })] })],
      [proveedor()],
      () => "2026-10-30T12:00:00Z"
    );

    expect(listas).toEqual([]);
  });

  it("ignora a quien no está cargado como proveedor", () => {
    const listas = listasParaImportar(
      [chat({ mensajes: [mensaje({ autor: "5491199999999" })] })],
      [proveedor()],
      nunca
    );

    expect(listas).toEqual([]);
  });

  it("ignora la charla que no tiene forma de lista", () => {
    const listas = listasParaImportar(
      [chat({ mensajes: [mensaje({ texto: "buen día, después te paso" })] })],
      [proveedor()],
      nunca
    );

    expect(listas).toEqual([]);
  });
});

describe("planificarPublicacion", () => {
  it("aplica el margen del proveedor sobre su costo", () => {
    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor({ defaultMarginPct: 10 }),
          filas: [fila({ cost: 900 })],
          filasAnteriores: [],
        },
      ],
      DOLAR
    );

    expect(plan.publicar).toHaveLength(1);
    expect(plan.publicar[0].precioUsd).toBe(990);
    expect(plan.frenadas).toEqual([]);
  });

  /**
   * Lo central del cruce: gana el costo más bajo, pero el margen que se aplica
   * es el del proveedor que ganó. Tomar el del otro publicaría un precio que
   * nadie decidió.
   */
  it("elige el costo más bajo y le aplica el margen de ese proveedor", () => {
    const barato = proveedor({
      id: "prov-2",
      name: "Mundo Wholesale",
      phone: "5491176543210",
      defaultMarginPct: 30,
    });

    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor({ defaultMarginPct: 10 }),
          filas: [fila({ cost: 900 })],
          filasAnteriores: [],
        },
        { proveedor: barato, filas: [fila({ cost: 800 })], filasAnteriores: [] },
      ],
      DOLAR
    );

    expect(plan.publicar).toHaveLength(1);
    expect(plan.publicar[0].proveedor.id).toBe("prov-2");
    expect(plan.publicar[0].precioUsd).toBe(1040); // 800 * 1.30, no 800 * 1.10
  });

  /**
   * El caso más peligroso de todos. Un costo con un dígito de menos es el más
   * barato, así que ganaría la comparación justamente por estar mal, y el
   * equipo se publicaría regalado con el aviso colgado al costado.
   */
  it("una lista con avisos no compite por el mejor precio", () => {
    const anteriores = Array.from({ length: 10 }, (_, i) =>
      fila({ model: `iPhone ${i}`, cost: 900 })
    );

    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor({ id: "prov-sospechoso", phone: "5491176543210" }),
          // 90 en vez de 900: un dígito de menos.
          filas: [fila({ cost: 90 })],
          filasAnteriores: anteriores,
        },
        {
          proveedor: proveedor({ defaultMarginPct: 10 }),
          filas: [fila({ cost: 900 })],
          filasAnteriores: [],
        },
      ],
      DOLAR
    );

    expect(plan.frenadas.map((f) => f.proveedor.id)).toEqual(["prov-sospechoso"]);
    expect(plan.publicar).toHaveLength(1);
    expect(plan.publicar[0].proveedor.id).toBe("prov-1");
    expect(plan.publicar[0].fila.cost).toBe(900);
  });

  it("informa los dos motivos juntos cuando la lista es corta y además tiene un salto", () => {
    const anteriores = Array.from({ length: 20 }, (_, i) =>
      fila({ model: `iPhone ${i}`, cost: 900 })
    );

    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor(),
          filas: [fila({ model: "iPhone 0", cost: 90 })],
          filasAnteriores: anteriores,
        },
      ],
      DOLAR
    );

    const motivos = plan.frenadas[0].revisiones.map((r) => r.motivo);
    expect(motivos).toContain("lista-corta");
    expect(motivos).toContain("salto-de-precio");
  });

  it("pone en cero lo que el proveedor dejó de ofrecer", () => {
    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor(),
          filas: [fila({ model: "iPhone 15 Pro" })],
          filasAnteriores: [
            fila({ model: "iPhone 15 Pro" }),
            fila({ model: "iPhone 13" }),
          ],
        },
      ],
      DOLAR
    );

    expect(plan.sinStock).toHaveLength(1);
    expect(plan.sinStock[0]).toContain("iphone 13");
  });

  /**
   * Una lista frenada no dice nada sobre qué dejó de estar. Tratarla como si
   * lo dijera pondría en cero todo el catálogo de ese proveedor por un precio
   * raro en un solo renglón.
   */
  it("no pone nada en cero por culpa de una lista frenada", () => {
    const anteriores = Array.from({ length: 10 }, (_, i) =>
      fila({ model: `iPhone ${i}`, cost: 900 })
    );

    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor(),
          filas: [fila({ model: "iPhone 0", cost: 90 })],
          filasAnteriores: anteriores,
        },
      ],
      DOLAR
    );

    expect(plan.frenadas).toHaveLength(1);
    expect(plan.sinStock).toEqual([]);
  });

  /**
   * Sin convertir, el mismo equipo ofrecido en dólares y en pesos se publicaría
   * dos veces con dos precios distintos, porque la comparación de costos no
   * cruza monedas. Acá hay cotización, así que se compara en dólares.
   */
  it("no publica dos veces el mismo equipo ofrecido en monedas distintas", () => {
    const enPesos = proveedor({
      id: "prov-pesos",
      phone: "5491176543210",
      defaultMarginPct: 10,
    });

    const plan = planificarPublicacion(
      [
        {
          proveedor: proveedor(),
          filas: [fila({ cost: 900, currency: "USD" })],
          filasAnteriores: [],
        },
        // 1.020.000 / 1200 = 850 dólares: más barato que los 900 del otro.
        {
          proveedor: enPesos,
          filas: [fila({ cost: 1_020_000, currency: "ARS" })],
          filasAnteriores: [],
        },
      ],
      DOLAR
    );

    expect(plan.publicar).toHaveLength(1);
    expect(plan.publicar[0].proveedor.id).toBe("prov-pesos");
    // El costo que se marca es el que el proveedor escribió, en su moneda.
    expect(plan.publicar[0].fila.currency).toBe("ARS");
    expect(plan.publicar[0].fila.cost).toBe(1_020_000);
    expect(plan.publicar[0].precioUsd).toBe(935); // 850 * 1.10
  });

  it("con las manos vacías no inventa nada", () => {
    expect(planificarPublicacion([], DOLAR)).toEqual({
      publicar: [],
      frenadas: [],
      sinStock: [],
    });
  });
});
