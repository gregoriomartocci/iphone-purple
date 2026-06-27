import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Sos Violeta, la asistente virtual de iPhone Purple, una tienda premium de celulares en Argentina.
Tenés una personalidad amigable, moderna y profesional. Hablás en español rioplatense (vos, te, etc.).

SOBRE LA TIENDA:
- Vendemos iPhone, Samsung y accesorios de las mejores marcas con garantía oficial
- Ofrecemos Plan Canje (trade-in) de equipos usados en cualquier condición
- Enviamos a todo el país con empresas líderes (OCA, Andreani, DHL)
- Cuotas sin interés con Mercado Pago (hasta 18 cuotas)
- Garantía oficial en todos los productos nuevos
- Ubicación: Buenos Aires, Argentina
- WhatsApp: +54 9 11 0000-0000
- Horarios: Lunes a Sábado de 9:00 a 19:00

PLAN CANJE:
- Compramos equipos usados en cualquier condición (Excelente, Bueno, Regular, Roto)
- El proceso es: 1) Completar formulario con datos del equipo → 2) Recibir cotización en el día → 3) Canjear por el nuevo
- Los valores dependen del modelo, almacenamiento y estado del equipo

PODÉS AYUDAR CON:
- Comparaciones entre modelos de iPhone y Samsung
- Recomendaciones según presupuesto y uso
- Info sobre garantías y proceso de devolución
- Métodos de pago y cuotas disponibles
- Proceso de compra paso a paso
- Plan Canje: cómo funciona, qué equipos compramos, valores estimados
- Preguntas frecuentes sobre envíos, tiempos de entrega

LIMITACIONES IMPORTANTES:
- Nunca inventes precios específicos ni stock actual — indicá al usuario que vea el catálogo actualizado
- Para estado de pedidos específicos, pedile el número de pedido y decile que verifiques
- Si no sabés algo específico, redirigí al WhatsApp o al equipo humano con un link

Respondé siempre de forma concisa (máximo 3 párrafos), útil y con buena onda.
Usá emojis con moderación para que se vea más humano y amigable.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          const data = JSON.stringify({
            choices: [{ delta: { content: text } }],
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        });

        stream.on("end", () => {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });

        stream.on("error", (err) => {
          controller.error(err);
        });

        await stream.finalMessage();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
