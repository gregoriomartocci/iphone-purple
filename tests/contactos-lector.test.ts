import { describe, expect, it } from "vitest";
import {
  jidParaConsultar,
  nombreDeContacto,
  registrarContacto,
} from "../scripts/whatsapp/contactos.mjs";

describe("contactos del lector", () => {
  it("encuentra el nombre por teléfono y por identificador interno", () => {
    const mapa = new Map();
    registrarContacto(mapa, {
      id: "5492211234567@s.whatsapp.net",
      lid: "153270672691321@lid",
      name: "Fany",
    });

    expect(nombreDeContacto(mapa, "153270672691321")).toBe("Fany");
    expect(nombreDeContacto(mapa, "5492211234567:12@s.whatsapp.net")).toBe("Fany");
  });

  it("una actualización parcial no pisa el nombre de la agenda", () => {
    const mapa = new Map();
    registrarContacto(mapa, { id: "111@lid", name: "Fran mayorista" });
    registrarContacto(mapa, { id: "111@lid", notify: "Francisco" });

    expect(nombreDeContacto(mapa, "111")).toBe("Fran mayorista");
  });

  it("usa el nombre propio si no está agendado", () => {
    const mapa = new Map();
    registrarContacto(mapa, { id: "222@lid", notify: "TechDog" });
    expect(nombreDeContacto(mapa, "222")).toBe("TechDog");
  });

  it("consulta perfiles con el jid que corresponde", () => {
    const mapa = new Map();
    registrarContacto(mapa, {
      id: "5492211234567@s.whatsapp.net",
      lid: "333@lid",
    });

    expect(jidParaConsultar(mapa, "333")).toBe("5492211234567@s.whatsapp.net");
    expect(jidParaConsultar(mapa, "444")).toBe("444@lid");
    expect(jidParaConsultar(mapa, "5492219999999")).toBe("5492219999999@s.whatsapp.net");
  });
});
