"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  describirMargen,
  desviado,
  gananciaUsd,
  margenReal,
  precioArs,
  precioUsd,
  resolverMargen,
  type Margen,
  type ReglasMargen,
  type TipoMargen,
} from "@/lib/margen";
import { formatARS, formatUSD } from "@/utils/format";
import { CATEGORY_LABELS, type Category, type Product } from "@/types";
import { cn } from "@/lib/utils";

/** Una fila de la tabla: una variante con su costo, su precio y su margen. */
type Fila = {
  slug: string;
  nombre: string;
  categoria: Category;
  variante: string;
  proveedor: string | null;
  costoUsd: number;
  precioPublicadoUsd: number;
  precioPublicadoArs: number;
};

const CATEGORIAS = Object.keys(CATEGORY_LABELS) as Category[];

/**
 * Margen y control de precios.
 *
 * Contesta tres preguntas de una: cuánto margen se está aplicando, de dónde
 * sale ese número, y qué equipos quedaron fuera de precio. Las tres juntas
 * porque por separado no sirven: saber que el margen general es 18 % no dice
 * nada si veinte equipos están publicados al 4 %.
 *
 * Todo se recalcula en el navegador mientras se mueven los controles. Es
 * deliberado: el valor de esta pantalla está en poder probar "¿y si subo dos
 * puntos?" y ver el resultado sobre el catálogo real antes de guardar nada.
 */
export function MargenesPanel({
  productos,
  proveedores,
  dollarRate,
  reglasIniciales,
}: {
  productos: Product[];
  proveedores: { id: string; name: string }[];
  dollarRate: number;
  reglasIniciales: ReglasMargen;
}) {
  const [reglas, setReglas] = useState<ReglasMargen>(reglasIniciales);
  const [soloDesviados, setSoloDesviados] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const filas: Fila[] = useMemo(
    () =>
      productos.flatMap((p) =>
        p.variants.map((v) => ({
          slug: p.slug,
          nombre: p.name,
          categoria: p.category,
          variante: `${v.storage} · ${v.color}`,
          proveedor: null,
          costoUsd: v.costUsd ?? 0,
          precioPublicadoUsd: v.priceUsd,
          precioPublicadoArs: v.priceArs,
        }))
      ),
    [productos]
  );

  const calculadas = useMemo(
    () =>
      filas.map((f) => {
        const margen = resolverMargen(reglas, {
          slug: f.slug,
          supplierId: f.proveedor,
          category: f.categoria,
        });
        const sugeridoUsd = precioUsd(f.costoUsd, margen);
        return {
          ...f,
          margen,
          sugeridoUsd,
          sugeridoArs: precioArs(sugeridoUsd, dollarRate),
          real: margenReal(f.costoUsd, f.precioPublicadoUsd),
          ganancia: gananciaUsd(f.costoUsd, f.precioPublicadoUsd),
          fueraDePrecio: desviado(f.costoUsd, f.precioPublicadoUsd, margen),
        };
      }),
    [filas, reglas, dollarRate]
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return calculadas.filter(
      (f) =>
        (!soloDesviados || f.fueraDePrecio) &&
        (!q || `${f.nombre} ${f.variante}`.toLowerCase().includes(q))
    );
  }, [calculadas, soloDesviados, busqueda]);

  const conCosto = calculadas.filter((f) => f.costoUsd > 0);
  const desviadas = calculadas.filter((f) => f.fueraDePrecio).length;
  const margenPromedio =
    conCosto.length > 0
      ? conCosto.reduce((a, f) => a + (f.real ?? 0), 0) / conCosto.length
      : 0;
  const gananciaTotal = conCosto.reduce((a, f) => a + f.ganancia, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Tarjeta
          titulo="Margen promedio publicado"
          valor={`${margenPromedio.toFixed(1)} %`}
        />
        <Tarjeta
          titulo="Ganancia si se vende todo"
          valor={formatUSD(Math.round(gananciaTotal))}
        />
        <Tarjeta
          titulo="Fuera de precio"
          valor={String(desviadas)}
          alerta={desviadas > 0}
          nota={
            desviadas > 0
              ? "se apartan más de 3 % del margen que les toca"
              : "todo en su precio"
          }
        />
      </div>

      <section className="border-line rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Reglas de margen</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gana siempre la más específica. Un margen puesto en un equipo puntual manda
          sobre el del proveedor, y el del proveedor sobre el de la categoría.
        </p>

        <div className="mt-5 space-y-5">
          <Regla
            etiqueta="General"
            nota="El piso: se aplica a todo lo que no tenga una regla propia."
            margen={reglas.general}
            onChange={(m) => setReglas((r) => ({ ...r, general: m }))}
          />

          <div>
            <p className="text-foreground mb-2 text-sm font-medium">Por categoría</p>
            <p className="text-muted-foreground mb-3 text-xs">
              Un accesorio aguanta mucho más margen que un iPhone. Vacío = usa el general.
            </p>
            <div className="space-y-2.5">
              {CATEGORIAS.map((c) => (
                <Regla
                  key={c}
                  etiqueta={CATEGORY_LABELS[c]}
                  compacta
                  hereda={reglas.general}
                  margen={reglas.porCategoria?.[c]}
                  onChange={(m) =>
                    setReglas((r) => ({
                      ...r,
                      porCategoria: { ...r.porCategoria, [c]: m },
                    }))
                  }
                  onQuitar={() =>
                    setReglas((r) => {
                      const next = { ...r.porCategoria };
                      delete next[c];
                      return { ...r, porCategoria: next };
                    })
                  }
                />
              ))}
            </div>
          </div>

          {proveedores.length > 0 && (
            <div>
              <p className="text-foreground mb-2 text-sm font-medium">Por proveedor</p>
              <div className="space-y-2.5">
                {proveedores.map((p) => (
                  <Regla
                    key={p.id}
                    etiqueta={p.name}
                    compacta
                    hereda={reglas.general}
                    margen={reglas.porProveedor?.[p.id]}
                    onChange={(m) =>
                      setReglas((r) => ({
                        ...r,
                        porProveedor: { ...r.porProveedor, [p.id]: m },
                      }))
                    }
                    onQuitar={() =>
                      setReglas((r) => {
                        const next = { ...r.porProveedor };
                        delete next[p.id];
                        return { ...r, porProveedor: next };
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Precios equipo por equipo</h2>
          <div className="flex items-center gap-3">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar equipo…"
              className="border-line bg-surface focus-visible:border-ink h-9 rounded-lg border px-3 text-sm outline-none"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={soloDesviados}
                onChange={(e) => setSoloDesviados(e.target.checked)}
              />
              Solo los fuera de precio
            </label>
          </div>
        </div>

        <div className="border-line overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-muted-foreground text-left text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Margen que le toca</th>
                <th className="px-4 py-3 font-medium">Debería salir</th>
                <th className="px-4 py-3 font-medium">Sale hoy</th>
                <th className="px-4 py-3 font-medium">Margen real</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {visibles.slice(0, 300).map((f, i) => (
                <tr
                  key={`${f.slug}-${i}`}
                  className={cn(f.fueraDePrecio && "bg-amber-50")}
                >
                  <td className="px-4 py-3">
                    <span className="text-foreground block font-medium">{f.nombre}</span>
                    <span className="text-muted-foreground text-xs">{f.variante}</span>
                  </td>
                  <td className="tnum text-muted-foreground px-4 py-3">
                    {f.costoUsd > 0 ? formatUSD(f.costoUsd) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-foreground">{describirMargen(f.margen)}</span>
                    <span className="text-muted-foreground block text-xs">
                      por {f.margen.origen}
                    </span>
                  </td>
                  <td className="tnum px-4 py-3">
                    {f.costoUsd > 0 ? (
                      <>
                        <span className="text-foreground block">
                          {formatUSD(f.sugeridoUsd)}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {formatARS(f.sugeridoArs)}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="tnum px-4 py-3">
                    <span className="text-foreground block">
                      {formatUSD(f.precioPublicadoUsd)}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {formatARS(f.precioPublicadoArs)}
                    </span>
                  </td>
                  <td className="tnum px-4 py-3">
                    {f.real === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={cn(
                          "font-medium",
                          f.real < 0 ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {f.real.toFixed(1)} %
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {f.costoUsd === 0 ? null : f.fueraDePrecio ? (
                      <AlertTriangle className="size-4 text-amber-600" />
                    ) : (
                      <Check className="size-4 text-emerald-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mt-3 text-xs">
          {visibles.length} variantes
          {visibles.length > 300 && " — se muestran las primeras 300"}. Los precios de
          esta tabla se calculan con la cotización de {formatARS(dollarRate)}.
        </p>
      </section>
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  nota,
  alerta,
}: {
  titulo: string;
  valor: string;
  nota?: string;
  alerta?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-line rounded-xl border p-5",
        alerta && "border-amber-300 bg-amber-50"
      )}
    >
      <p className="text-muted-foreground text-sm">{titulo}</p>
      <p className="tnum text-foreground mt-1 text-2xl font-semibold">{valor}</p>
      {nota && <p className="text-muted-foreground mt-1 text-xs">{nota}</p>}
    </div>
  );
}

/**
 * Una fila de regla.
 *
 * Sin regla propia no muestra un cero: mostraba "0 %" en todas las categorías y
 * se leía como si estuvieran vendiendo a precio de costo. Ahora dice de qué
 * regla está heredando y el campo queda apagado hasta que se lo toca, que es la
 * diferencia entre "no configurado" y "configurado en cero".
 */
function Regla({
  etiqueta,
  nota,
  margen,
  hereda,
  compacta,
  onChange,
  onQuitar,
}: {
  etiqueta: string;
  nota?: string;
  margen?: Margen;
  /** Qué se aplica hoy si esta regla no está puesta. */
  hereda?: Margen;
  compacta?: boolean;
  onChange: (m: Margen) => void;
  onQuitar?: () => void;
}) {
  const puesta = Boolean(margen);
  const activa = margen ?? hereda ?? { tipo: "porcentaje" as TipoMargen, valor: 0 };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        compacta && "border-line rounded-lg border px-3 py-2",
        compacta && !puesta && "bg-elevated/40"
      )}
    >
      <div className="min-w-[9rem] flex-1">
        <span
          className={cn(
            "text-sm font-medium",
            puesta ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {etiqueta}
        </span>
        {nota && <span className="text-muted-foreground block text-xs">{nota}</span>}
        {!puesta && hereda && (
          <span className="text-muted-foreground block text-xs">
            hereda {describirMargen(hereda)}
          </span>
        )}
      </div>

      <select
        value={activa.tipo}
        onChange={(e) => onChange({ ...activa, tipo: e.target.value as TipoMargen })}
        className={cn(
          "border-line bg-surface h-9 rounded-lg border px-2 text-sm outline-none",
          !puesta && "text-muted-foreground"
        )}
      >
        <option value="porcentaje">Porcentaje</option>
        <option value="fijo">Monto fijo</option>
      </select>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          // Vacío cuando no hay regla, con el heredado como pista: un cero
          // escrito se confunde con un margen puesto en cero a propósito.
          value={puesta ? activa.valor : ""}
          placeholder={hereda ? String(hereda.valor) : "—"}
          min={0}
          onChange={(e) => onChange({ ...activa, valor: Number(e.target.value) })}
          className={cn(
            "border-line bg-surface tnum h-9 w-24 rounded-lg border px-2 text-sm outline-none",
            "placeholder:text-muted-foreground/60"
          )}
        />
        <span className="text-muted-foreground text-sm">
          {activa.tipo === "fijo" ? "US$" : "%"}
        </span>
      </div>

      {onQuitar && (
        <button
          type="button"
          onClick={onQuitar}
          disabled={!puesta}
          className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2 disabled:opacity-0"
        >
          quitar
        </button>
      )}
    </div>
  );
}
