import { describe, expect, it } from "vitest";
import { esTelefonoReal, mensajeDeStock } from "@/lib/whatsapp/consulta-stock";
import { armarMercado, type ListaDeProveedor } from "@/lib/whatsapp/mercado";
import { proveedorDelMensaje, ultimasListasVistas } from "@/lib/whatsapp/sincronizar";
import type { ParsedRow, Supplier } from "@/types";

function fila(p: Partial<ParsedRow> = {}): ParsedRow {
  return {
    brand: "Apple",
    model: "iPhone 16",
    category: "celular",
    authenticity: "original",
    storage: "128GB",
    color: null,
    grade: "sellado",
    batteryHealth: null,
    currency: "USD",
    cost: 825,
    quantity: 1,
    notes: null,
    ...p,
  } as ParsedRow;
}

function lista(
  id: string,
  filas: ParsedRow[],
  phone: string | null = null
): ListaDeProveedor {
  const proveedor: Supplier = {
    id,
    name: id,
    phone,
    defaultMarginPct: 5,
    isActive: true,
  };
  return { proveedor, fecha: "2026-11-04T12:00:00Z", filas };
}

describe("armarMercado", () => {
  it("junta las ofertas de un equipo y ordena de más barata a más cara", () => {
    const [equipo, ...resto] = armarMercado(
      [lista("Fany", [fila({ cost: 850 })]), lista("TechDog", [fila({ cost: 825 })])],
      1662.49
    );

    expect(resto).toHaveLength(0);
    expect(equipo.ofertas.map((o) => o.proveedor)).toEqual(["TechDog", "Fany"]);
    expect(equipo.precioUsd).toBe(867);
  });

  it("compara monedas distintas en dólares", () => {
    const [equipo] = armarMercado(
      [
        lista("Dolar", [fila({ cost: 900 })]),
        lista("Pesos", [fila({ cost: 1_000_000, currency: "ARS" })]),
      ],
      1250
    );
    expect(equipo.ofertas[0].proveedor).toBe("Pesos");
  });

  it("no mezcla un sellado con un usado ni una réplica con un original", () => {
    const equipos = armarMercado(
      [lista("A", [fila(), fila({ grade: "a" }), fila({ authenticity: "replica" })])],
      1500
    );
    expect(equipos).toHaveLength(3);
  });
});

describe("consulta de stock", () => {
  it("no toma un identificador interno por un teléfono", () => {
    expect(esTelefonoReal("5492214941732")).toBe(true);
    expect(esTelefonoReal("153270672691321")).toBe(false);
    expect(esTelefonoReal("40102763970655")).toBe(false);
    expect(esTelefonoReal("54123")).toBe(false);
    expect(esTelefonoReal(null)).toBe(false);
  });

  it("arma el mensaje con el equipo y el costo de esa oferta", () => {
    const [equipo] = armarMercado([lista("Fany", [fila()])], 1500);
    expect(mensajeDeStock(equipo, equipo.ofertas[0])).toBe(
      "Hola! ¿Tenés stock de iPhone 16 128GB sellado a USD 825? Gracias!"
    );
  });
});

describe("listas en comunidades", () => {
  const prov = (name: string, phone: string | null = null): Supplier => ({
    id: name,
    name,
    phone,
    defaultMarginPct: 5,
    isActive: true,
  });
  const lista = "iPhone 15 128 USD 680\niPhone 16 128 USD 785\niPhone 17 256 USD 950";
  const chat = (nombre: string, soloAdmins: boolean, fecha = "2026-11-04T18:43:00Z") => ({
    jid: "1@g.us",
    nombre,
    telefono: "1",
    grupo: true,
    soloAdmins,
    avisos: soloAdmins,
    mensajes: [{ fecha, mio: false, texto: lista, autor: "153270672691321" }],
  });

  it("reconoce al proveedor por el nombre de su grupo de avisos", () => {
    const c = chat("Mundo Wholesale 🔥 - Mayorista", true);
    expect(proveedorDelMensaje(c, c.mensajes[0], [prov("Mundo Wholesale")])?.name).toBe(
      "Mundo Wholesale"
    );
    const o = chat("Onpres.ar", true);
    expect(proveedorDelMensaje(o, o.mensajes[0], [prov("Onpres.ar")])?.name).toBe(
      "Onpres.ar"
    );
  });

  it("no atribuye por nombre en un grupo donde escribe cualquiera", () => {
    const c = chat("Mundo Wholesale charla", false);
    expect(proveedorDelMensaje(c, c.mensajes[0], [prov("Mundo Wholesale")])).toBeNull();
  });

  it("el teléfono del autor gana sobre el nombre del grupo", () => {
    const c = chat("Mundo Wholesale", true);
    const autor = prov("Otro", "153270672691321");
    expect(
      proveedorDelMensaje(c, c.mensajes[0], [prov("Mundo Wholesale"), autor])?.name
    ).toBe("Otro");
  });

  it("dice dónde está su última lista", () => {
    const c = chat("Onpres.ar", true);
    expect(ultimasListasVistas([c], [prov("Onpres.ar")])["Onpres.ar"]).toEqual({
      fecha: "2026-11-04T18:43:00Z",
      chat: "Avisos de Onpres.ar",
      comunidad: true,
    });
  });
});

it("marca lo que todavía no llegó", () => {
  const [equipo] = armarMercado([lista("Onpres", [fila({ quantity: 0 })])], 1500);
  expect(equipo.ofertas[0].ingresando).toBe(true);
});
