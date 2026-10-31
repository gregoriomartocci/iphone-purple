import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pedirMensajes, pedirSalud, servidorConfigurado } from "@/lib/whatsapp/servidor";

/**
 * El cliente se prueba contra un servidor HTTP de verdad y no contra un mock
 * de `fetch`, porque lo que puede fallar es el contrato: el token en el header
 * que el otro proceso espera, el 401, y una URL que devuelve HTML. Un mock
 * solo confirmaría que el código llama a lo que yo creo que llama.
 */

let servidor: Server | null = null;

function levantar(manejador: Parameters<typeof createServer>[1]): Promise<string> {
  return new Promise((resolve) => {
    servidor = createServer(manejador);
    servidor.listen(0, "127.0.0.1", () => {
      const dir = servidor!.address();
      resolve(`http://127.0.0.1:${typeof dir === "object" && dir ? dir.port : 0}`);
    });
  });
}

afterEach(() => {
  servidor?.close();
  servidor = null;
  vi.unstubAllEnvs();
});

/** La misma forma que devuelve `instantanea()` en scripts/whatsapp/servidor.mjs. */
const INSTANTANEA = {
  dias: 3,
  generado: "2026-10-30T12:00:00.000Z",
  chats: [
    {
      jid: "12036-99@g.us",
      nombre: "comunidad iCell Oeste",
      telefono: "12036-99",
      grupo: true,
      mensajes: [
        {
          fecha: "2026-10-30T10:00:00.000Z",
          mio: false,
          texto: "iPhone 15 Pro 256 900\niPhone 14 128 650\niPad Air 480",
          autor: "5492211234567",
          autorNombre: "Fran",
        },
      ],
    },
  ],
};

describe("cliente del servidor de WhatsApp", () => {
  it("no intenta nada si faltan las variables", async () => {
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", "");
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "");

    expect(servidorConfigurado()).toBe(false);
    const r = await pedirMensajes();
    expect(r).toEqual({
      ok: false,
      motivo: "sin-configurar",
      detalle: expect.any(String),
    });
  });

  it("manda el token como Bearer, que es lo que el servidor exige", async () => {
    let recibido: string | undefined;
    const base = await levantar((req, res) => {
      recibido = req.headers.authorization;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(INSTANTANEA));
    });
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", base);
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "secreto");

    const r = await pedirMensajes(3);

    expect(recibido).toBe("Bearer secreto");
    expect(r.ok && r.datos.chats[0].mensajes[0].autor).toBe("5492211234567");
  });

  it("pide los días por query, como los lee el servidor", async () => {
    let url: string | undefined;
    const base = await levantar((req, res) => {
      url = req.url;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(INSTANTANEA));
    });
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", base);
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "secreto");

    await pedirMensajes(7);

    expect(url).toBe("/mensajes?dias=7");
  });

  it("no manda token a /salud, que es el endpoint abierto", async () => {
    let recibido: string | undefined = "todavía no";
    const base = await levantar((req, res) => {
      recibido = req.headers.authorization;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ vinculado: true, faltaVincular: false, chats: 11 }));
    });
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", base);
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "secreto");

    const r = await pedirSalud();

    expect(recibido).toBeUndefined();
    expect(r.ok && r.datos.chats).toBe(11);
  });

  it("distingue el token equivocado de una caída", async () => {
    const base = await levantar((_req, res) => {
      res.writeHead(401, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "No autorizado" }));
    });
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", base);
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "el-que-no-va");

    const r = await pedirMensajes();

    expect(r.ok).toBe(false);
    expect(!r.ok && r.motivo).toBe("no-autorizado");
  });

  /**
   * El error que más probable es cometer al configurar: apuntar la URL al
   * propio sitio en vez de al lector. Devuelve 200 con HTML, y sin este caso
   * el panel mostraría una pantalla en blanco en lugar de decir qué pasa.
   */
  it("avisa cuando la URL apunta a algo que no es el lector", async () => {
    const base = await levantar((_req, res) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<!doctype html><title>iPhone Purple</title>");
    });
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", base);
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "secreto");

    const r = await pedirMensajes();

    expect(!r.ok && r.motivo).toBe("respuesta-rara");
    expect(!r.ok && r.detalle).toContain("URL");
  });

  it("no se cae cuando el servidor no está", async () => {
    // Puerto cerrado: es lo que pasa mientras Railway despierta el servicio.
    vi.stubEnv("WHATSAPP_SERVIDOR_URL", "http://127.0.0.1:1");
    vi.stubEnv("WHATSAPP_SERVIDOR_TOKEN", "secreto");

    const r = await pedirMensajes();

    expect(!r.ok && r.motivo).toBe("sin-respuesta");
  });
});
