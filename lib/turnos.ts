/**
 * Turnos para retirar en el local.
 *
 * Todo lo de acá es cálculo puro sobre fechas: no toca el DOM ni la red, así
 * que se puede probar. Las reglas del negocio están en un solo lugar y no
 * repartidas por el componente.
 */

/** Desde cuántos días se puede reservar. Antes de eso el equipo puede no estar listo. */
export const DIAS_DE_ANTICIPACION = 4;

/** Cuántos días hacia adelante se ofrecen para elegir. */
export const DIAS_OFRECIDOS = 21;

/** Horario de atención: de 10 a 19, con el último turno a las 18. */
export const PRIMER_TURNO = 10;
export const ULTIMO_TURNO = 18;

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Fecha en formato `AAAA-MM-DD`, que es como viaja y se guarda. */
export type Fecha = string;

function aFecha(d: Date): Fecha {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Interpreta `AAAA-MM-DD` en horario local, sin correrse de día por zona horaria. */
export function desdeFecha(f: Fecha): Date {
  const [a, m, d] = f.split("-").map(Number);
  return new Date(a, m - 1, d);
}

/**
 * Días que se pueden reservar.
 *
 * Arranca a los cuatro días para dar margen a preparar el equipo, y salta los
 * domingos porque el local no abre. `hoy` se pasa como parámetro en vez de
 * leer el reloj adentro: así la función es determinista y se puede testear.
 */
export function diasDisponibles(hoy: Date = new Date()): Fecha[] {
  const dias: Fecha[] = [];
  const cursor = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  cursor.setDate(cursor.getDate() + DIAS_DE_ANTICIPACION);

  for (let i = 0; i < DIAS_OFRECIDOS; i++) {
    if (cursor.getDay() !== 0) dias.push(aFecha(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

/**
 * Horarios de un día.
 *
 * Los sábados se corta antes: es media jornada, y ofrecer un turno a las 18 un
 * sábado termina en alguien golpeando una puerta cerrada.
 */
export function horariosDe(fecha: Fecha): string[] {
  const dia = desdeFecha(fecha).getDay();
  const ultimo = dia === 6 ? 13 : ULTIMO_TURNO;
  const horas: string[] = [];
  for (let h = PRIMER_TURNO; h <= ultimo; h++)
    horas.push(`${String(h).padStart(2, "0")}:00`);
  return horas;
}

/** "jueves 12 de septiembre", para mostrar. */
export function fechaLarga(f: Fecha): string {
  const d = desdeFecha(f);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** "jue 12", para las fichas del calendario. */
export function fechaCorta(f: Fecha): { dia: string; numero: number; mes: string } {
  const d = desdeFecha(f);
  return {
    dia: DIAS[d.getDay()].slice(0, 3),
    numero: d.getDate(),
    mes: MESES[d.getMonth()].slice(0, 3),
  };
}

/** Si un turno es válido según las reglas del local. */
export function turnoValido(fecha: Fecha, hora: string, hoy: Date = new Date()): boolean {
  return diasDisponibles(hoy).includes(fecha) && horariosDe(fecha).includes(hora);
}
