/**
 * Estado del local en este momento.
 *
 * Saber si está abierto ahora es de las cosas más útiles que puede decir una
 * página de contacto: cambia si la persona llama, escribe o se acerca. Se
 * calcula acá, en una función pura con la hora como parámetro, para poder
 * probarlo sin depender del reloj.
 *
 * El horario está fijo porque es el del local: lunes a sábado de 10 a 19, con
 * los sábados hasta las 14 y domingos cerrado.
 */
export type EstadoLocal =
  { abierto: true; cierraA: string } | { abierto: false; proximo: string };

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** Apertura y cierre por día de la semana. `null` es cerrado. */
function jornadaDe(dia: number): { abre: number; cierra: number } | null {
  if (dia === 0) return null;
  if (dia === 6) return { abre: 10, cierra: 14 };
  return { abre: 10, cierra: 19 };
}

export function estadoDelLocal(ahora: Date = new Date()): EstadoLocal {
  const hoy = jornadaDe(ahora.getDay());
  const hora = ahora.getHours() + ahora.getMinutes() / 60;

  if (hoy && hora >= hoy.abre && hora < hoy.cierra) {
    return { abierto: true, cierraA: `${hoy.cierra}` };
  }

  // Si todavía no abrió hoy, el próximo turno es hoy mismo.
  if (hoy && hora < hoy.abre) {
    return { abierto: false, proximo: `hoy a las ${hoy.abre}` };
  }

  // Si no, se busca el próximo día con jornada.
  for (let i = 1; i <= 7; i++) {
    const dia = (ahora.getDay() + i) % 7;
    const j = jornadaDe(dia);
    if (j) {
      const cuando = i === 1 ? "mañana" : DIAS[dia];
      return { abierto: false, proximo: `${cuando} a las ${j.abre}` };
    }
  }
  return { abierto: false, proximo: "pronto" };
}

/** Las jornadas de la semana, para listarlas. */
export function semana(): { dia: string; horario: string; indice: number }[] {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const j = jornadaDe(d);
    return {
      dia: DIAS[d],
      horario: j ? `${j.abre} a ${j.cierra} h` : "Cerrado",
      indice: d,
    };
  });
}
