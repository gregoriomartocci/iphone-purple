import { isSupabaseConfigured } from "@/lib/data";

/**
 * Aviso de que lo que se ve no es stock real.
 *
 * Mientras no haya base conectada, el sitio sirve `lib/data/seed.ts`: un
 * catálogo de demostración con precios y stock inventados, y hasta con
 * modelos que no existen. Sin este cartel no hay nada que lo diga —se buscó y
 * no había—, así que un visitante ve precios que parecen de verdad y pide un
 * equipo que el local no tiene, o lo pide al precio equivocado.
 *
 * Se apaga solo: en cuanto `isSupabaseConfigured()` da verdadero, deja de
 * renderizarse sin que nadie tenga que acordarse de sacarlo. Esa es la razón
 * de que la condición mire la configuración y no una variable aparte —una
 * bandera que hay que apagar a mano es una bandera que queda prendida—.
 */
export function AvisoCatalogoDemo() {
  if (isSupabaseConfigured()) return null;

  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <p className="shell py-2.5 text-center text-sm leading-snug">
        <strong className="font-semibold">Catálogo de demostración.</strong> Los precios y
        el stock de esta página son de prueba y no corresponden a equipos reales.{" "}
        <span className="whitespace-nowrap">Escribinos para consultar.</span>
      </p>
    </div>
  );
}
