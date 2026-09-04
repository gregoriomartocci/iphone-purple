/**
 * En qué moneda se lee el precio.
 *
 * No es un modo que oculta una de las dos: los dos números están siempre en
 * pantalla y esto decide cuál va grande. La diferencia importa. En Argentina
 * el signo `$` es pesos, así que un sitio que muestra solo "US$ 950" porque
 * quedó en dólares invita a leer novecientos cincuenta pesos —o novecientos
 * cincuenta mil— sobre un equipo de un millón y medio. Con los dos a la vista
 * no hay nada que malinterpretar.
 *
 * La preferencia vive en el navegador de cada persona y se aplica con un
 * atributo en <html> antes del primer pintado, así no hay parpadeo ni
 * diferencia entre lo que arma el servidor y lo que muestra el cliente.
 */
export type Moneda = "ars" | "usd";

/** Pesos por defecto: es lo que se paga en el mostrador. */
export const MONEDA_POR_DEFECTO: Moneda = "ars";

export const CLAVE_MONEDA = "iphone-purple:moneda";

/**
 * La moneda también viaja en la dirección: /catalogo?moneda=usd
 *
 * Es lo que hace que el enlace se pueda mandar. Quien lo recibe abre la página
 * ya en dólares aunque nunca haya tocado el selector, y sin esperar a que
 * cargue nada: el parámetro se lee antes del primer pintado.
 *
 * Cuando está en la dirección manda sobre lo guardado, porque es una elección
 * más reciente y más explícita que la preferencia vieja del navegador.
 */
export const PARAM_MONEDA = "moneda";

/** El atributo que lee el CSS para decidir qué precio va grande. */
export const ATRIBUTO_MONEDA = "data-moneda";

export function esMoneda(valor: unknown): valor is Moneda {
  return valor === "ars" || valor === "usd";
}

/**
 * Lee la preferencia guardada.
 *
 * Devuelve pesos ante cualquier duda: sin navegador, con el almacenamiento
 * bloqueado —una ventana privada, o el navegador configurado para no guardar
 * nada— o con un valor que no reconocemos. Leer localStorage puede lanzar, no
 * solo devolver null, así que va dentro de un try.
 */
export function leerMoneda(): Moneda {
  if (typeof window === "undefined") return MONEDA_POR_DEFECTO;

  const enLaUrl = new URLSearchParams(window.location.search).get(PARAM_MONEDA);
  if (esMoneda(enLaUrl)) return enLaUrl;

  try {
    const guardada = window.localStorage.getItem(CLAVE_MONEDA);
    return esMoneda(guardada) ? guardada : MONEDA_POR_DEFECTO;
  } catch {
    return MONEDA_POR_DEFECTO;
  }
}

/** Guarda la preferencia. Si el navegador no deja, la sesión sigue igual. */
export function guardarMoneda(moneda: Moneda): void {
  try {
    window.localStorage.setItem(CLAVE_MONEDA, moneda);
  } catch {
    // Sin persistencia la elección vale mientras dure la página, que es
    // preferible a romper el clic.
  }
}

/**
 * El script que corre antes de pintar, para que la página aparezca ya en la
 * moneda elegida.
 *
 * Va como texto y no como componente porque tiene que ejecutarse antes de que
 * React tome el control: si esperáramos al montaje, quien eligió dólares vería
 * los precios en pesos durante un cuadro y saltarían solos.
 */
export const SCRIPT_MONEDA = `(function(){try{
var u=new URLSearchParams(location.search).get(${JSON.stringify(PARAM_MONEDA)});
var m=u==="usd"||u==="ars"?u:localStorage.getItem(${JSON.stringify(CLAVE_MONEDA)});
if(m==="usd")document.documentElement.setAttribute(${JSON.stringify(ATRIBUTO_MONEDA)},"usd");
if(u==="usd"||u==="ars")localStorage.setItem(${JSON.stringify(CLAVE_MONEDA)},u);
}catch(e){}})()`;

/**
 * Hace cuánto se actualizó la cotización, en palabras.
 *
 * Se muestra al lado del precio porque un dólar de hace tres semanas es peor
 * que no mostrar ninguno: el número parece firme y no lo es. Diciendo cuándo
 * se tocó, quien mira decide cuánto confiar.
 */
export function antiguedadCotizacion(fechaIso: string, ahora = new Date()): string {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "";

  const dias = Math.floor((ahora.getTime() - fecha.getTime()) / 86_400_000);
  if (dias <= 0) return "actualizada hoy";
  if (dias === 1) return "actualizada ayer";
  if (dias < 7) return `actualizada hace ${dias} días`;
  if (dias < 14) return "actualizada hace una semana";
  if (dias < 31) return `actualizada hace ${Math.floor(dias / 7)} semanas`;
  return "actualizada hace más de un mes";
}
