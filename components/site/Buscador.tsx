"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type OpcionBuscador = {
  id: string;
  label: string;
  /** Línea secundaria: precio, capacidad, lo que ayude a distinguir. */
  detalle?: string;
};

/**
 * Buscador con lista desplegable.
 *
 * Reemplaza al `<select>` cuando hay muchas opciones. Con cincuenta equipos en
 * un desplegable nativo hay que recorrerlos a ojo; escribiendo "15 pro" se
 * llega en dos teclas.
 *
 * Filtra sin acentos y por palabras sueltas, así "iphone 15" y "15 iphone"
 * encuentran lo mismo, que es como la gente escribe cuando busca apurada.
 */
export function Buscador({
  opciones,
  valor,
  onChange,
  placeholder = "Buscar…",
  etiqueta,
  vacio = "No encontramos nada con eso.",
}: {
  opciones: OpcionBuscador[];
  valor: string;
  onChange: (id: string) => void;
  placeholder?: string;
  etiqueta: string;
  vacio?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [resaltado, setResaltado] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const listaId = useId();

  const elegida = opciones.find((o) => o.id === valor);

  const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filtradas = useMemo(() => {
    const terminos = normalizar(texto).split(/\s+/).filter(Boolean);
    if (terminos.length === 0) return opciones;
    return opciones.filter((o) => {
      const heno = normalizar(`${o.label} ${o.detalle ?? ""}`);
      return terminos.every((t) => heno.includes(t));
    });
  }, [opciones, texto]);

  // Un clic afuera cierra la lista. Sin esto queda abierta tapando el resto.
  useEffect(() => {
    if (!abierto) return;
    const alClickear = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", alClickear);
    return () => document.removeEventListener("mousedown", alClickear);
  }, [abierto]);

  const elegir = (id: string) => {
    onChange(id);
    setTexto("");
    setAbierto(false);
  };

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setAbierto(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setAbierto(true);
      setResaltado((i) => {
        const paso = e.key === "ArrowDown" ? 1 : -1;
        const n = filtradas.length;
        return n === 0 ? 0 : (i + paso + n) % n;
      });
    }
    if (e.key === "Enter" && abierto && filtradas[resaltado]) {
      e.preventDefault();
      elegir(filtradas[resaltado].id);
    }
  };

  return (
    <div ref={contenedor} className="relative">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listaId}
          aria-label={etiqueta}
          autoComplete="off"
          value={abierto ? texto : (elegida?.label ?? "")}
          placeholder={elegida ? elegida.label : placeholder}
          onFocus={() => {
            setAbierto(true);
            setResaltado(0);
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setResaltado(0);
          }}
          onKeyDown={alTeclear}
          className="border-line bg-surface text-foreground focus-visible:border-ink h-12 w-full rounded-xl border pr-11 pl-11 text-[15px] transition-colors outline-none"
        />

        {elegida && !abierto ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setTexto("");
            }}
            aria-label={`Quitar ${elegida.label}`}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 transition-colors"
          >
            <X className="size-4" />
          </button>
        ) : (
          <ChevronDown
            aria-hidden
            className={cn(
              "text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 transition-transform",
              abierto && "rotate-180"
            )}
          />
        )}
      </div>

      {abierto && (
        <ul
          id={listaId}
          role="listbox"
          className="border-line bg-surface absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border p-1.5 shadow-lg"
        >
          {filtradas.length === 0 && (
            <li className="text-muted-foreground px-3 py-3 text-sm">{vacio}</li>
          )}
          {filtradas.map((o, i) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={o.id === valor}
                onMouseEnter={() => setResaltado(i)}
                onClick={() => elegir(o.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  i === resaltado ? "bg-elevated" : "hover:bg-elevated"
                )}
              >
                <span className="min-w-0">
                  <span className="text-foreground block truncate font-medium">
                    {o.label}
                  </span>
                  {o.detalle && (
                    <span className="text-muted-foreground block text-xs">
                      {o.detalle}
                    </span>
                  )}
                </span>
                {o.id === valor && <Check className="text-foreground size-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
