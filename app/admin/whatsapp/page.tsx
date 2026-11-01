import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ChatsDetectados } from "@/components/admin/ChatsDetectados";
import { PlanWhatsapp } from "@/components/admin/PlanWhatsapp";
import { VincularWhatsapp } from "@/components/admin/VincularWhatsapp";
import { PrenderLector } from "@/components/admin/PrenderLector";
import { autoresDetectados, telefonoComparable } from "@/lib/whatsapp/sincronizar";
import { pedirMensajes, pedirSalud, servidorConfigurado } from "@/lib/whatsapp/servidor";
import { getSuppliers } from "@/lib/data/admin";
import { getSettings, isSupabaseConfigured } from "@/lib/data";

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
    <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-5 text-amber-100">
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
            Falta cargar <code>WHATSAPP_SERVIDOR_URL</code> y{" "}
            <code>WHATSAPP_SERVIDOR_TOKEN</code>. Para probarlo en tu máquina alcanza con{" "}
            <code>node scripts/whatsapp/servidor.mjs</code>; para que quede prendido
            siempre, los pasos de Railway están en <code>docs/puesta-en-marcha.md</code>,
            Parte 2. El QR se escanea desde esta misma pantalla.
          </p>
        </Aviso>
      </div>
    );
  }

  const [salud, mensajes, proveedores, settings] = await Promise.all([
    pedirSalud(),
    pedirMensajes(3),
    getSuppliers(),
    getSettings(),
  ]);

  /*
   * Que el lector conteste no quiere decir que haya una línea vinculada.
   *
   * `/mensajes` responde igual sin vincular —devuelve cero chats— así que
   * mirar solo si la petición salió bien llevaba a la pantalla normal con el
   * cartel "conectado pero todavía no juntó mensajes". Alguien esperando
   * vincular veía eso y no tenía dónde ir: ni código, ni QR, ni explicación.
   * El estado real está en `vinculado`, no en que el HTTP conteste.
   */
  const sinVincular = salud.ok && !salud.datos.vinculado;

  if (!mensajes.ok || sinVincular) {
    const faltaVincular = sinVincular || (salud.ok && salud.datos.faltaVincular);

    return (
      <div className="max-w-3xl">
        {header}
        {faltaVincular ? (
          /* El QR se muestra acá en vez de mandar a nadie a los logs del
             servicio, que es donde estaba antes y donde es más incómodo
             justamente en producción. */
          <VincularWhatsapp numero={settings.whatsappDisplay} />
        ) : (
          /*
           * Un cartel por causa, con lo que hay que hacer en cada una.
           *
           * Antes había uno solo que imprimía el mensaje crudo del error, y
           * con el lector apagado decía "fetch failed": ni qué pasó, ni qué
           * hacer. Las causas son distintas y las soluciones también —prender
           * el proceso, corregir la URL, esperar, revisar el token— así que
           * cada una se dice con su nombre.
           */
          <Aviso
            icono={AlertTriangle}
            titulo={
              !mensajes.ok && mensajes.motivo === "apagado"
                ? "El lector está apagado"
                : !mensajes.ok && mensajes.motivo === "no-existe"
                  ? "No se encuentra el lector"
                  : !mensajes.ok && mensajes.motivo === "no-autorizado"
                    ? "El lector rechazó la contraseña"
                    : "El lector no contestó"
            }
          >
            <p>{!mensajes.ok && mensajes.detalle}</p>

            {!mensajes.ok && mensajes.motivo === "apagado" && !process.env.VERCEL && (
              <PrenderLector />
            )}

            {!mensajes.ok && mensajes.motivo === "apagado" && process.env.VERCEL && (
              <p>
                En producción el lector corre en su propio servicio. Revisá que esté
                arriba y que <code>WHATSAPP_SERVIDOR_URL</code> apunte ahí.
              </p>
            )}

            {!mensajes.ok && mensajes.motivo === "no-existe" && (
              <p>
                La dirección de <code>WHATSAPP_SERVIDOR_URL</code> no resuelve. Si el
                servicio cambió de nombre o se borró, hay que actualizarla.
              </p>
            )}

            {!mensajes.ok && mensajes.motivo === "sin-respuesta" && (
              <p>
                Railway duerme los servicios sin tráfico. Si es la primera visita del día,
                recargá en un minuto; si se repite, mirá los logs del servicio.
              </p>
            )}

            {!mensajes.ok && mensajes.motivo === "no-autorizado" && (
              <p>
                El <code>WHATSAPP_SERVIDOR_TOKEN</code> de acá no coincide con el{" "}
                <code>TOKEN_WHATSAPP</code> del servicio. Tienen que ser idénticos.
              </p>
            )}
          </Aviso>
        )}
      </div>
    );
  }

  /*
   * Segunda barrera de identidad, además de la del lector.
   *
   * El lector ya se niega si lo vincularon con otra línea, pero esto no
   * depende de eso: si por un error quedara leyendo la cuenta personal de
   * alguien, acá no se muestra ni un mensaje. Es el chequeo que protege de un
   * bug del otro chequeo, y vale la duplicación porque lo que está en juego
   * son conversaciones privadas.
   */
  const vinculada = salud.ok ? salud.datos.numero : null;
  const esperada = settings.whatsappNumber;
  const lineaEquivocada =
    Boolean(vinculada) &&
    Boolean(esperada) &&
    telefonoComparable(vinculada) !== telefonoComparable(esperada);

  if (lineaEquivocada) {
    return (
      <div className="max-w-3xl">
        {header}
        <Aviso icono={AlertTriangle} titulo="Esta no es la línea del negocio">
          <p>
            El lector está vinculado a <strong>{vinculada}</strong> y el número del
            negocio es <strong>{esperada}</strong>. No se muestra ningún mensaje: si
            escaneaste con tu WhatsApp personal, lo que hay del otro lado son
            conversaciones privadas.
          </p>
          <p>
            Apagá el lector, borrá la carpeta <code>.whatsapp-auth</code> y volvé a
            vincular con la línea correcta. Si el número equivocado es el de la
            configuración, corregilo en{" "}
            <Link href="/admin/configuracion" className="underline">
              Configuración
            </Link>
            .
          </p>
        </Aviso>
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

      {/* Primero importar, que es lo que se hace todos los días; mapear
          proveedores es de las primeras veces y después casi nunca. */}
      {isSupabaseConfigured() && (
        <div className="mb-6">
          <PlanWhatsapp hayProveedores={proveedores.some((p) => p.isActive)} />
        </div>
      )}

      <ChatsDetectados autores={autores} supabaseReady={isSupabaseConfigured()} />

      <p className="mt-4 text-xs text-white/35">
        {vinculada && (
          <>
            Línea <strong className="font-medium text-white/60">{vinculada}</strong>
            {salud.ok && !salud.datos.verificaNumero && (
              <span className="text-amber-300/70">
                {" "}
                (el lector no está verificando el número)
              </span>
            )}{" "}
            ·{" "}
          </>
        )}
        Ventana de {mensajes.datos.dias} días · {mensajes.datos.chats.length} chats ·
        leído {new Date(mensajes.datos.generado).toLocaleString("es-AR")} ·{" "}
        <Link href="/admin/proveedores" className="underline">
          editar proveedores
        </Link>
      </p>
    </div>
  );
}
