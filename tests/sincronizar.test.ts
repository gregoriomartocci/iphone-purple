import { describe, expect, it } from "vitest";
import {
  claveEquipo,
  equiposSinStock,
  listaPendiente,
  mejorPorEquipo,
  pareceLista,
  proveedorDelChat,
  revisarAntesDePublicar,
  telefonoComparable,
  type ChatWhatsapp,
} from "@/lib/whatsapp/sincronizar";
import type { ParsedRow, Supplier } from "@/types";

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
    name: "Mayorista Centro",
    phone: "2211234567",
    defaultMarginPct: 18,
    isActive: true,
    ...p,
  };
}

function chat(p: Partial<ChatWhatsapp> = {}): ChatWhatsapp {
  return {
    jid: "5492211234567@s.whatsapp.net",
    nombre: "Mayorista Centro",
    telefono: "5492211234567",
    grupo: false,
    mensajes: [],
    ...p,
  };
}

describe("telefonoComparable", () => {
  /**
   * El caso que motiva la función: el mismo número anotado de cinco formas
   * distintas tiene que emparejar igual.
   */
  it("iguala el mismo número escrito de cualquier forma", () => {
    const formas = [
      "5492211234567", // como lo entrega WhatsApp
      "+54 9 221 123-4567", // internacional prolijo
      "0221 15 1234567", // el formato viejo, con el 15 en el medio
      "221 1234567", // como lo dicta el proveedor
    ];
    const normalizados = new Set(formas.map(telefonoComparable));
    expect(normalizados.size).toBe(1);
  });

  /**
   * El mismo abonado existe en muchas ciudades: emparejar sin área sería
   * mandarle la lista de un proveedor a otro.
   */
  it("un número sin código de área no empareja con nadie", () => {
    expect(telefonoComparable("1234567")).toBe("");
  });

  it("no se cae con vacío ni con null", () => {
    expect(telefonoComparable(null)).toBe("");
    expect(telefonoComparable("sin números")).toBe("");
  });

  it("distingue dos números realmente distintos", () => {
    expect(telefonoComparable("2211234567")).not.toBe(telefonoComparable("2217654321"));
  });
});

describe("proveedorDelChat", () => {
  it("empareja aunque el teléfono esté guardado con otro formato", () => {
    const encontrado = proveedorDelChat(chat(), [
      proveedor({ phone: "+54 9 221 123-4567" }),
    ]);
    expect(encontrado?.id).toBe("prov-1");
  });

  it("ignora los grupos: una lista reenviada no es nuestra lista", () => {
    const grupo = chat({ grupo: true });
    expect(proveedorDelChat(grupo, [proveedor()])).toBeNull();
  });

  it("ignora a los proveedores dados de baja", () => {
    expect(proveedorDelChat(chat(), [proveedor({ isActive: false })])).toBeNull();
  });

  it("devuelve null si el número no es de ningún proveedor", () => {
    expect(
      proveedorDelChat(chat({ telefono: "5491199998888" }), [proveedor()])
    ).toBeNull();
  });
});

describe("pareceLista", () => {
  it("reconoce una lista de precios", () => {
    const texto = [
      "iPhone 15 Pro 256 sellado 1080",
      "iPhone 15 Pro Max 256 1250",
      "iPhone 14 128 usado 720",
    ].join("\n");
    expect(pareceLista(texto)).toBe(true);
  });

  it("descarta una charla, que es lo que ahorra la llamada a la API", () => {
    expect(pareceLista("buen día! mañana te paso la lista")).toBe(false);
    expect(pareceLista("hola, cómo andás?")).toBe(false);
  });

  it("descarta un mensaje con un solo precio suelto", () => {
    expect(pareceLista("el 15 pro te lo dejo en 1080")).toBe(false);
  });
});

describe("listaPendiente", () => {
  const vieja = {
    fecha: "2026-10-28T10:00:00Z",
    mio: false,
    texto: "a 111\nb 222\nc 333",
  };
  const nueva = {
    fecha: "2026-10-29T10:00:00Z",
    mio: false,
    texto: "a 115\nb 225\nc 335",
  };

  it("toma la más reciente cuando hay varias sin importar", () => {
    expect(listaPendiente([vieja, nueva], null)?.fecha).toBe(nueva.fecha);
  });

  it("ignora las anteriores a la última importación", () => {
    expect(listaPendiente([vieja, nueva], "2026-10-28T12:00:00Z")?.fecha).toBe(
      nueva.fecha
    );
  });

  it("devuelve null si ya importamos todo", () => {
    expect(listaPendiente([vieja, nueva], "2026-10-30T00:00:00Z")).toBeNull();
  });

  it("nunca toma un mensaje nuestro como lista del proveedor", () => {
    const mio = {
      fecha: "2026-10-30T10:00:00Z",
      mio: true,
      texto: "a 111\nb 222\nc 333",
    };
    expect(listaPendiente([vieja, mio], null)?.fecha).toBe(vieja.fecha);
  });
});

describe("mejorPorEquipo", () => {
  it("se queda con el costo más bajo del mismo equipo", () => {
    const elegidas = mejorPorEquipo([fila({ cost: 900 }), fila({ cost: 870 })]);
    expect(elegidas).toHaveLength(1);
    expect(elegidas[0].cost).toBe(870);
  });

  it("no compara entre monedas distintas", () => {
    const elegidas = mejorPorEquipo([
      fila({ cost: 900, currency: "USD" }),
      fila({ cost: 1_200_000, currency: "ARS" }),
    ]);
    expect(elegidas).toHaveLength(2);
  });

  it("el color no parte el mismo equipo en dos", () => {
    const elegidas = mejorPorEquipo([
      fila({ color: "negro", cost: 900 }),
      fila({ color: "midnight", cost: 880 }),
    ]);
    expect(elegidas).toHaveLength(1);
    expect(elegidas[0].cost).toBe(880);
  });

  it("el grado sí los distingue: un sellado no compite con un usado", () => {
    const elegidas = mejorPorEquipo([
      fila({ grade: "sellado", cost: 1000 }),
      fila({ grade: "a", cost: 800 }),
    ]);
    expect(elegidas).toHaveLength(2);
  });
});

describe("revisarAntesDePublicar", () => {
  const anteriores = Array.from({ length: 20 }, (_, i) =>
    fila({ model: `iPhone ${i}`, cost: 900 })
  );

  it("una lista completa se publica sin avisos", () => {
    const nuevas = anteriores.map((f) => ({ ...f, cost: 920 }));
    expect(revisarAntesDePublicar(nuevas, anteriores)).toEqual([]);
  });

  it("frena la lista que se encogió a la mitad", () => {
    const nuevas = anteriores.slice(0, 5);
    const avisos = revisarAntesDePublicar(nuevas, anteriores);
    expect(avisos.map((a) => a.motivo)).toContain("lista-corta");
  });

  it("frena el precio que se desplomó: casi siempre es un dígito de menos", () => {
    const nuevas = anteriores.map((f, i) => (i === 0 ? { ...f, cost: 90 } : f));
    const avisos = revisarAntesDePublicar(nuevas, anteriores);
    expect(avisos.map((a) => a.motivo)).toContain("salto-de-precio");
    expect(avisos[0].detalle).toContain("iPhone 0");
  });

  it("deja pasar una suba normal", () => {
    const nuevas = anteriores.map((f) => ({ ...f, cost: 990 }));
    expect(revisarAntesDePublicar(nuevas, anteriores)).toEqual([]);
  });

  /**
   * Con pocas filas previas la proporción no significa nada: un proveedor
   * nuevo que mandó tres equipos y ahora manda uno no tiene por qué frenarse.
   */
  it("no aplica la proporción cuando casi no hay con qué comparar", () => {
    const pocas = [fila({ model: "A" }), fila({ model: "B" })];
    expect(revisarAntesDePublicar([fila({ model: "A" })], pocas)).toEqual([]);
  });

  it("un equipo nuevo no dispara salto de precio", () => {
    const nuevas = [...anteriores, fila({ model: "iPhone 17 Pro", cost: 1400 })];
    expect(revisarAntesDePublicar(nuevas, anteriores)).toEqual([]);
  });
});

describe("equiposSinStock", () => {
  it("marca los que dejaron de estar en la lista", () => {
    const antes = [fila({ model: "iPhone 14" }), fila({ model: "iPhone 15" })];
    const ahora = [fila({ model: "iPhone 15" })];
    const fuera = equiposSinStock(ahora, antes);
    expect(fuera).toEqual([claveEquipo(fila({ model: "iPhone 14" }))]);
  });

  it("no marca nada si la lista trae todo", () => {
    const antes = [fila({ model: "iPhone 14" })];
    expect(equiposSinStock(antes, antes)).toEqual([]);
  });

  it("el que vuelve a aparecer deja de estar sin stock", () => {
    const antes = [fila({ model: "iPhone 14" })];
    const vuelve = [fila({ model: "iPhone 14" }), fila({ model: "iPhone 15" })];
    expect(equiposSinStock(vuelve, antes)).toEqual([]);
  });
});
