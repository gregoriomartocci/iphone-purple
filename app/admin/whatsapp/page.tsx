import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, QrCode } from "lucide-react";
import { ChatsDetectados } from "@/components/admin/ChatsDetectados";
import { autoresDetectados } from "@/lib/whatsapp/sincronizar";
import { pedirMensajes, pedirSalud, servidorConfigurado } from "@/lib/whatsapp/servidor";
import { getSuppliers } from "@/lib/data/admin";
import { isSupabaseConfigured } from "@/lib/data";

export const metadata: Metadata = { title: "WhatsApp" };

export const dynamic = "force-dynamic";

function Aviso({
  icono: Icono,
  titulo,
  children,
}: {
  icono: typeof AlertTriangle;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <p className="flex items-center gap-2 font-medium">
        <Icono className="size-4 shrink-0" />
        {titulo}
      </p>
      <div className="mt-2 space-y-2 text-sm">{children}</div>
    </div>
  );
}

export default async function AdminWhatsappPage() {
  const header = (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold">WhatsApp</h1>
      <p className="text-muted-foreground mt-1.5">
        Quién manda listas en los chats, y cuáles de ellos ya están cargados como
        proveedores.
      </p>
    </header>
  );

  if (!servidorConfigurado()) {
    return (
      <div className="max-w-3xl">
        {header}
        <Aviso
          icono={AlertTriangle}
          titulo="El lector de WhatsApp todavía no está conectado"
        >
          <p>
            Esta pantalla lee de un proceso aparte, que mantiene la sesión de WhatsApp
            abierta. No puede correr acá: el sitio arranca y muere con cada pedido, y la
            sesión se caería en cada uno.
          </p>
          <p>
            Falta desplegarlo y cargar <code>WHATSAPP_SERVIDOR_URL</code> y{" "}
            <code>WHATSAPP_SERVIDOR_TOKEN</code>. Los pasos están en{" "}
            <code>docs/puesta-en-marcha.md</code>, Parte 2.
          </p>
        </Aviso>
      </div>
    );
  }

  const [salud, mensajes, proveedores] = await Promise.all([
    pedirSalud(),
    pedirMensajes(3),
    getSuppliers(),
  ]);

  if (!mensajes.ok) {
    // La vinculación es el único caso que no se arregla con reintentar, así que
    // se distingue: hay que ir a escanear el QR en los logs del servicio.
    const faltaVincular = salud.ok && salud.datos.faltaVincular;

    return (
      <div className="max-w-3xl">
        {header}
        {faltaVincular ? (
          <Aviso icono={QrCode} titulo="Falta vincular la línea">
            <p>
              El lector está andando pero nadie escaneó el código. Abrí los logs del
              servicio, buscá el QR y escanealo desde WhatsApp → Dispositivos vinculados.
              Caduca rápido: si ya no está, reiniciá el servicio para que dibuje uno
              nuevo.
            </p>
          </Aviso>
        ) : (
          <Aviso icono={AlertTriangle} titulo="No se pudo leer del servidor">
            <p>{mensajes.detalle}</p>
            {mensajes.motivo === "sin-respuesta" && (
              <p>
                Railway duerme los servicios sin tráfico. Si es la primera visita del día,
                recargá en un minuto.
              </p>
            )}
            {mensajes.motivo === "no-autorizado" && (
              <p>
                El <code>WHATSAPP_SERVIDOR_TOKEN</code> de acá no coincide con el{" "}
                <code>TOKEN_WHATSAPP</code> del servicio.
              </p>
            )}
          </Aviso>
        )}
      </div>
    );
  }

  const autores = autoresDetectados(mensajes.datos.chats, proveedores);
  const sinCargar = autores.filter((a) => a.listas > 0 && !a.proveedor).length;

  return (
    <div className="max-w-3xl">
      {header}

      {!isSupabaseConfigured() && (
        <div className="mb-5">
          <Aviso icono={AlertTriangle} titulo="Sin base de datos no se puede cargar nada">
            <p>
              Las listas se ven, pero el botón de cargar proveedor está apagado hasta que
              estén las credenciales de Supabase.
            </p>
          </Aviso>
        </div>
      )}

      {sinCargar > 0 && (
        <p className="mb-5 text-sm">
          <span className="font-medium">{sinCargar}</span>{" "}
          {sinCargar === 1
            ? "persona manda listas y todavía no está cargada"
            : "personas mandan listas y todavía no están cargadas"}
          . Hasta que lo estén, sus precios no entran al catálogo.
        </p>
      )}

      <ChatsDetectados autores={autores} supabaseReady={isSupabaseConfigured()} />

      <p className="text-muted-foreground mt-4 text-xs">
        Ventana de {mensajes.datos.dias} días · {mensajes.datos.chats.length} chats ·
        leído {new Date(mensajes.datos.generado).toLocaleString("es-AR")} ·{" "}
        <Link href="/admin/proveedores" className="underline">
          editar proveedores
        </Link>
      </p>
    </div>
  );
}
