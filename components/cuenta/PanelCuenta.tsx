"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Info, MapPin, Package, Plus, Trash2, User } from "lucide-react";
import { useCuenta } from "./CuentaProvider";
import { formatARS } from "@/utils/format";
import { fechaLarga } from "@/lib/turnos";
import { cn } from "@/lib/utils";

type Pestania = "pedidos" | "favoritos" | "direcciones" | "perfil";

const PESTANIAS: { id: Pestania; label: string; icono: typeof User }[] = [
  { id: "pedidos", label: "Mis pedidos", icono: Package },
  { id: "favoritos", label: "Favoritos", icono: Heart },
  { id: "direcciones", label: "Direcciones", icono: MapPin },
  { id: "perfil", label: "Mis datos", icono: User },
];

/**
 * Panel de la persona que compra.
 *
 * Todo lo que muestra vive en este navegador, y eso se dice en pantalla en vez
 * de disimularlo: alguien que entra desde el teléfono y no ve los favoritos
 * que marcó en la computadora tiene que entender por qué, y no pensar que el
 * sitio los perdió.
 */
export function PanelCuenta() {
  const [pestania, setPestania] = useState<Pestania>("pedidos");
  const cuenta = useCuenta();

  if (!cuenta.listo) {
    return <div className="border-line bg-surface h-64 rounded-2xl border shadow-sm" />;
  }

  const conteo: Record<Pestania, number> = {
    pedidos: cuenta.pedidos.length,
    favoritos: cuenta.favoritos.length,
    direcciones: cuenta.direcciones.length,
    perfil: 0,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <nav className="border-line bg-surface h-fit rounded-2xl border p-2 shadow-sm">
        {PESTANIAS.map(({ id, label, icono: Icono }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPestania(id)}
            aria-current={pestania === id}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[15px] transition-colors",
              pestania === id
                ? "bg-elevated text-foreground font-medium"
                : "text-muted-foreground hover:bg-elevated/60 hover:text-foreground"
            )}
          >
            <Icono className="size-[18px] shrink-0" />
            <span className="flex-1">{label}</span>
            {conteo[id] > 0 && (
              <span className="tnum text-muted-foreground text-xs">{conteo[id]}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="min-w-0">
        {pestania === "pedidos" && <Pedidos />}
        {pestania === "favoritos" && <Favoritos />}
        {pestania === "direcciones" && <Direcciones />}
        {pestania === "perfil" && <Perfil />}

        <p className="text-muted-foreground mt-6 flex items-start gap-2 text-sm leading-relaxed">
          <Info className="mt-0.5 size-4 shrink-0" />
          Esto se guarda en este navegador, así que no lo vas a ver desde otro
          dispositivo. Estamos preparando las cuentas para que te siga a donde entres.
        </p>
      </div>
    </div>
  );
}

function Vacio({
  icono: Icono,
  titulo,
  texto,
  accion,
}: {
  icono: typeof User;
  titulo: string;
  texto: string;
  accion?: { href: string; label: string };
}) {
  return (
    <div className="border-line bg-surface rounded-2xl border px-6 py-16 text-center shadow-sm">
      <span className="border-line mx-auto flex size-14 items-center justify-center rounded-2xl border">
        <Icono className="text-muted-foreground size-6" />
      </span>
      <p className="text-foreground mt-5 text-lg font-medium">{titulo}</p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm leading-relaxed">
        {texto}
      </p>
      {accion && (
        <Link
          href={accion.href}
          className="bg-ink hover:bg-ink/85 mt-6 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-medium text-white transition-colors"
        >
          {accion.label}
        </Link>
      )}
    </div>
  );
}

const ESTADOS = {
  pendiente: { label: "Pendiente de confirmar", clase: "bg-amber-100 text-amber-900" },
  confirmado: { label: "Confirmado", clase: "bg-sky-100 text-sky-900" },
  entregado: { label: "Entregado", clase: "bg-emerald-100 text-emerald-900" },
} as const;

function Pedidos() {
  const { pedidos } = useCuenta();

  if (pedidos.length === 0) {
    return (
      <Vacio
        icono={Package}
        titulo="Todavía no hiciste ningún pedido"
        texto="Cuando confirmes uno lo vas a ver acá, con su número y su estado."
        accion={{ href: "/catalogo", label: "Ver catálogo" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {pedidos.map((p) => (
        <article
          key={p.referencia}
          className="border-line bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div className="border-line bg-elevated flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
            <div>
              <p className="text-foreground font-medium">Pedido {p.referencia}</p>
              <p className="text-muted-foreground text-sm">
                {new Date(p.fecha).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                ESTADOS[p.estado].clase
              )}
            >
              {ESTADOS[p.estado].label}
            </span>
          </div>

          <div className="px-5 py-4">
            <ul className="text-muted-foreground space-y-1 text-sm">
              {p.items.map((i, n) => (
                <li key={n}>
                  {i.cantidad}× {i.nombre}{" "}
                  <span className="text-muted-foreground/70">{i.variante}</span>
                </li>
              ))}
            </ul>

            <div className="border-line mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-muted-foreground text-sm">
                {p.entrega === "retiro"
                  ? p.turno
                    ? `Retirás el ${fechaLarga(p.turno.fecha)} a las ${p.turno.hora}`
                    : "Retiro en el local"
                  : "Envío a domicilio"}
              </p>
              <p className="tnum text-foreground font-semibold">
                {formatARS(p.totalArs)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Favoritos() {
  const { favoritos, alternarFavorito } = useCuenta();

  if (favoritos.length === 0) {
    return (
      <Vacio
        icono={Heart}
        titulo="No guardaste ningún equipo"
        texto="Tocá el corazón en cualquier equipo del catálogo y lo vas a encontrar acá."
        accion={{ href: "/catalogo", label: "Ver catálogo" }}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {favoritos.map((f) => (
        <div
          key={f.slug}
          className="border-line bg-surface flex gap-4 rounded-2xl border p-4 shadow-sm"
        >
          <Link
            href={`/catalogo/${f.slug}`}
            className="bg-elevated relative size-20 shrink-0 overflow-hidden rounded-xl"
          >
            {f.imagen && (
              <Image src={f.imagen} alt="" fill sizes="80px" className="object-cover" />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/catalogo/${f.slug}`}
              className="text-foreground block font-medium transition-colors"
            >
              {f.nombre}
            </Link>
            <p className="tnum text-muted-foreground mt-1 text-sm">
              {formatARS(f.precioArs)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => alternarFavorito(f)}
            aria-label={`Quitar ${f.nombre} de favoritos`}
            className="text-muted-foreground hover:text-destructive h-fit p-1 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

const campo =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-foreground outline-none transition-colors focus-visible:border-ink";

function Direcciones() {
  const { direcciones, agregarDireccion, quitarDireccion } = useCuenta();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({
    etiqueta: "",
    calle: "",
    localidad: "",
    codigoPostal: "",
  });

  const completa = form.calle.trim().length > 4 && form.localidad.trim().length > 2;

  return (
    <div className="space-y-4">
      {direcciones.map((d) => (
        <div
          key={d.id}
          className="border-line bg-surface flex items-start justify-between gap-4 rounded-2xl border p-5 shadow-sm"
        >
          <div>
            {d.etiqueta && (
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                {d.etiqueta}
              </p>
            )}
            <p className="text-foreground mt-1">{d.calle}</p>
            <p className="text-muted-foreground text-sm">
              {d.localidad}
              {d.codigoPostal && ` · CP ${d.codigoPostal}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => quitarDireccion(d.id)}
            aria-label="Quitar dirección"
            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {abierto ? (
        <div className="border-line bg-surface space-y-3 rounded-2xl border p-5 shadow-sm">
          <input
            value={form.etiqueta}
            onChange={(e) => setForm({ ...form, etiqueta: e.target.value })}
            placeholder="Casa, trabajo…"
            className={campo}
          />
          <input
            value={form.calle}
            onChange={(e) => setForm({ ...form, calle: e.target.value })}
            placeholder="Calle, número, piso y departamento"
            className={campo}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.localidad}
              onChange={(e) => setForm({ ...form, localidad: e.target.value })}
              placeholder="Localidad"
              className={campo}
            />
            <input
              value={form.codigoPostal}
              onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
              placeholder="Código postal"
              className={campo}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!completa}
              onClick={() => {
                agregarDireccion(form);
                setForm({ etiqueta: "", calle: "", localidad: "", codigoPostal: "" });
                setAbierto(false);
              }}
              className="bg-ink hover:bg-ink/85 h-11 rounded-full px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="border-line text-foreground hover:border-foreground/35 h-11 rounded-full border px-6 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-6 text-[15px] transition-colors"
        >
          <Plus className="size-4" />
          Agregar una dirección
        </button>
      )}
    </div>
  );
}

function Perfil() {
  const { perfil, guardarPerfil } = useCuenta();

  return (
    <div className="border-line bg-surface space-y-4 rounded-2xl border p-6 shadow-sm">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Con esto cargado, el checkout se completa solo y no tenés que escribirlo cada vez.
      </p>
      <label className="block">
        <span className="text-muted-foreground mb-1.5 block text-sm">Nombre</span>
        <input
          value={perfil.nombre}
          onChange={(e) => guardarPerfil({ nombre: e.target.value })}
          autoComplete="name"
          className={campo}
        />
      </label>
      <label className="block">
        <span className="text-muted-foreground mb-1.5 block text-sm">Correo</span>
        <input
          value={perfil.email}
          onChange={(e) => guardarPerfil({ email: e.target.value })}
          type="email"
          autoComplete="email"
          className={campo}
        />
      </label>
      <label className="block">
        <span className="text-muted-foreground mb-1.5 block text-sm">Teléfono</span>
        <input
          value={perfil.telefono}
          onChange={(e) => guardarPerfil({ telefono: e.target.value })}
          type="tel"
          autoComplete="tel"
          className={campo}
        />
      </label>
    </div>
  );
}
