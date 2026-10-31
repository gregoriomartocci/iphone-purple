/**
 * Normaliza un teléfono argentino a la forma mínima que permite compararlo.
 *
 * Vive en su propio archivo, y no suelto dentro del lector, por una razón: es
 * una copia de `telefonoComparable` en `lib/whatsapp/sincronizar.ts`, y las dos
 * tienen que dar siempre lo mismo. Si se separan, la línea correcta se
 * rechazaría por una diferencia de formato —o, peor, una equivocada pasaría—.
 * Separado se puede importar desde un test y comprobar que siguen de acuerdo.
 *
 * No se importa el de `lib/` directamente porque el lector corre como proceso
 * aparte, con sus propias dependencias y sin TypeScript.
 */
export function comparable(valor) {
  let d = String(valor ?? "").replace(/\D/g, "");

  if (d.startsWith("54")) {
    d = d.slice(2);
    if (d.startsWith("9")) d = d.slice(1);
  }
  if (d.startsWith("0")) d = d.slice(1);

  // Área (2 a 4 dígitos) + 15 + abonado (6 a 8). Solo se saca cuando lo que
  // queda a los costados tiene forma de número, para no mutilar uno que
  // casualmente contenga un 15.
  d = d.replace(/^(\d{2,4})15(\d{6,8})$/, "$1$2");

  // Sin área no hay con qué desambiguar.
  if (d.length < 9) return "";

  return d.slice(-8);
}
