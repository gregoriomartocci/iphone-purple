import { describe, expect, it } from "vitest";
import {
  autoresDetectados,
  claveEquipo,
  equiposSinStock,
  listaPendiente,
  mejorPorEquipo,
  pareceLista,
  proveedorDelMensaje,
  revisarAntesDePublicar,
  telefonoComparable,
  type ChatWhatsapp,
  type MensajeWhatsapp,
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

function mensaje(p: Partial<MensajeWhatsapp> = {}): MensajeWhatsapp {
  return {
    fecha: "2026-10-30T10:00:00Z",
    mio: false,
    texto: "a 111\nb 222\nc 333",
    autor: "5492211234567",
    ...p,
  };
}

describe("proveedorDelMensaje", () => {
  it("empareja aunque el teléfono esté guardado con otro formato", () => {
    const encontrado = proveedorDelMensaje(chat(), mensaje(), [
      proveedor({ phone: "+54 9 221 123-4567" }),
    ]);
    expect(encontrado?.id).toBe("prov-1");
  });

  /**
   * El caso que motivó rehacer esto: la mitad de los proveedores publican en
   * grupos de revendedores. Mirar el chat los haría a todos "el grupo".
   */
  it("en un grupo mira quién escribió, no el grupo", () => {
    const grupo = chat({ jid: "120363@g.us", telefono: "120363", grupo: true });
    const encontrado = proveedorDelMensaje(grupo, mensaje(), [proveedor()]);
    expect(encontrado?.id).toBe("prov-1");
  });

  it("dos proveedores del mismo grupo no se confunden entre sí", () => {
    const grupo = chat({ jid: "120363@g.us", telefono: "120363", grupo: true });
    const proveedores = [
      proveedor({ id: "prov-1", phone: "2211234567" }),
      proveedor({ id: "prov-2", name: "AppTech USA", phone: "1159998888" }),
    ];
    expect(
      proveedorDelMensaje(grupo, mensaje({ autor: "5492211234567" }), proveedores)?.id
    ).toBe("prov-1");
    expect(
      proveedorDelMensaje(grupo, mensaje({ autor: "5491159998888" }), proveedores)?.id
    ).toBe("prov-2");
  });

  it("en un grupo, alguien que no es proveedor no entra", () => {
    const grupo = chat({ jid: "120363@g.us", telefono: "120363", grupo: true });
    expect(
      proveedorDelMensaje(grupo, mensaje({ autor: "5491133334444" }), [proveedor()])
    ).toBeNull();
  });

  it("ignora a los proveedores dados de baja", () => {
    expect(
      proveedorDelMensaje(chat(), mensaje(), [proveedor({ isActive: false })])
    ).toBeNull();
  });

  it("devuelve null si el número no es de ningún proveedor", () => {
    expect(
      proveedorDelMensaje(chat(), mensaje({ autor: "5491199998888" }), [proveedor()])
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
  const vieja = mensaje({ fecha: "2026-10-28T10:00:00Z" });
  const nueva = mensaje({
    fecha: "2026-10-29T10:00:00Z",
    texto: "a 115\nb 225\nc 335",
  });

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
    const mio = mensaje({ fecha: "2026-10-30T10:00:00Z", mio: true, autor: null });
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

describe("autoresDetectados", () => {
  /**
   * El caso que justifica toda la pantalla: en un grupo de revendedores
   * publican varios proveedores. Agrupar por chat los mostraría como una sola
   * fila y no habría forma de mapear a cada uno por separado.
   */
  it("separa a los distintos proveedores que publican en el mismo grupo", () => {
    const grupo = chat({
      jid: "12036-99@g.us",
      nombre: "comunidad iCell Oeste",
      telefono: "12036-99",
      grupo: true,
      mensajes: [
        mensaje({ autor: "5492211234567", autorNombre: "Fran" }),
        mensaje({ autor: "5491176543210", autorNombre: "Dami" }),
        mensaje({ autor: "5491176543210", autorNombre: "Dami" }),
      ],
    });

    const autores = autoresDetectados([grupo], []);

    expect(autores).toHaveLength(2);
    expect(new Set(autores.map((a) => a.nombre))).toEqual(new Set(["Fran", "Dami"]));
  });

  /**
   * El proveedor que manda la lista al grupo y después por privado es uno
   * solo. Contarlo dos veces haría que el dueño cargue dos proveedores con el
   * mismo teléfono y márgenes que pueden no coincidir.
   */
  it("une al mismo autor aunque escriba en el grupo y por privado", () => {
    const grupo = chat({
      jid: "12036-99@g.us",
      nombre: "comunidad iCell Oeste",
      grupo: true,
      mensajes: [mensaje({ autor: "5492211234567" })],
    });
    const privado = chat({
      nombre: "Fran mayorista",
      mensajes: [mensaje({ autor: "5492211234567" })],
    });

    const autores = autoresDetectados([grupo, privado], []);

    expect(autores).toHaveLength(1);
    expect(autores[0].mensajes).toBe(2);
    expect(autores[0].chats).toEqual(["comunidad iCell Oeste", "Fran mayorista"]);
  });

  it("marca con qué proveedor empareja, aunque el teléfono esté en otro formato", () => {
    const autores = autoresDetectados(
      [chat({ mensajes: [mensaje()] })],
      [proveedor({ phone: "0221 15 1234567" })]
    );

    expect(autores[0].proveedor?.id).toBe("prov-1");
  });

  it("deja en null al autor que todavía no está cargado como proveedor", () => {
    const autores = autoresDetectados(
      [chat({ mensajes: [mensaje({ autor: "5491176543210" })] })],
      [proveedor()]
    );

    expect(autores[0].proveedor).toBeNull();
  });

  /**
   * El orden es el del trabajo pendiente: quien manda listas y no está
   * cargado va arriba, porque es la única fila que pide una acción.
   */
  it("pone primero a quien manda listas y todavía no está mapeado", () => {
    const mapeado = chat({
      nombre: "Ya cargado",
      mensajes: [mensaje(), mensaje(), mensaje()],
    });
    const sinMapear = chat({
      jid: "5491176543210@s.whatsapp.net",
      nombre: "Sin cargar",
      telefono: "5491176543210",
      mensajes: [mensaje({ autor: "5491176543210" })],
    });

    const autores = autoresDetectados([mapeado, sinMapear], [proveedor()]);

    expect(autores[0].nombre ?? autores[0].chats[0]).toBe("Sin cargar");
    expect(autores[0].listas).toBe(1);
  });

  /**
   * Un proveedor desactivado ya está cargado: marcarlo como faltante haría que
   * se cargue de nuevo y queden dos con el mismo teléfono.
   */
  it("distingue al proveedor desactivado del que nunca se cargó", () => {
    const autores = autoresDetectados(
      [chat({ mensajes: [mensaje()] })],
      [proveedor({ isActive: false })]
    );

    expect(autores[0].proveedor).toBeNull();
    expect(autores[0].proveedorInactivo).toBe(true);
  });

  it("no marca como inactivo a quien no está cargado de ninguna forma", () => {
    const autores = autoresDetectados([chat({ mensajes: [mensaje()] })], []);

    expect(autores[0].proveedor).toBeNull();
    expect(autores[0].proveedorInactivo).toBe(false);
  });

  it("no cuenta como lista un mensaje que es pura charla", () => {
    const autores = autoresDetectados(
      [chat({ mensajes: [mensaje({ texto: "buen día, mañana te paso la lista" })] })],
      []
    );

    expect(autores[0].mensajes).toBe(1);
    expect(autores[0].listas).toBe(0);
    expect(autores[0].ultimaLista).toBeNull();
  });

  it("ignora los mensajes propios: nunca son listas de proveedor", () => {
    const autores = autoresDetectados([chat({ mensajes: [mensaje({ mio: true })] })], []);

    expect(autores).toHaveLength(0);
  });

  /**
   * Un número sin código de área no se puede emparejar sin arriesgar
   * confundir a dos proveedores de ciudades distintas, así que tampoco se
   * ofrece para mapear.
   */
  it("descarta al autor cuyo teléfono no alcanza para emparejar", () => {
    const autores = autoresDetectados(
      [chat({ mensajes: [mensaje({ autor: "1234567" })] })],
      []
    );

    expect(autores).toHaveLength(0);
  });

  it("se queda con la fecha de la última lista, no la del último mensaje", () => {
    const autores = autoresDetectados(
      [
        chat({
          mensajes: [
            mensaje({ fecha: "2026-10-28T10:00:00Z" }),
            mensaje({ fecha: "2026-10-30T10:00:00Z" }),
            mensaje({ fecha: "2026-10-31T10:00:00Z", texto: "gracias!" }),
          ],
        }),
      ],
      []
    );

    expect(autores[0].ultimaLista).toBe("2026-10-30T10:00:00Z");
  });
});
