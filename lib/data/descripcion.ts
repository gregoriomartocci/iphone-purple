import type { Line, Product } from "@/types";

/**
 * Descripción de venta de un equipo.
 *
 * Se arma desde la generación y la línea, igual que la ficha técnica, por el
 * mismo motivo: son 21 iPhone y escribir 21 textos a mano garantiza que alguno
 * termine describiendo a otro.
 *
 * Y por el mismo motivo que la ficha, acá tampoco se inventa. Cada frase
 * apunta a algo concreto que ese modelo trajo —el conector, el chip, la
 * pantalla, el botón— y no a adjetivos sueltos. Un texto entusiasta que no
 * dice nada no ayuda a decidir, y uno que promete de más se paga en el
 * mostrador.
 */
export type Descripcion = {
  /** Una línea que resume por qué mirar este equipo. */
  titular: string;
  /** El texto que explica qué lo distingue. */
  cuerpo: string;
  /** Tres o cuatro puntos concretos, para quien escanea en vez de leer. */
  destacados: string[];
};

type Linea = "base" | "pro" | "proMax";

function lineaDe(line: Line | null): Linea {
  if (line === "pro") return "pro";
  if (line === "pro-max") return "proMax";
  return "base";
}

/** Qué trajo cada generación respecto de la anterior. */
const GENERACION: Record<
  number,
  { base: Omit<Descripcion, "destacados">; pro: Omit<Descripcion, "destacados"> }
> = {
  17: {
    base: {
      titular: "La pantalla de los Pro, en el modelo de entrada",
      cuerpo:
        "Es la primera generación en la que el iPhone base trae ProMotion: la pantalla acompaña el dedo a 120 Hz, algo que hasta ahora quedaba reservado a la línea Pro. Sumado al chip A19 y a una pantalla de 6.3 pulgadas, es el salto más grande que dio el modelo de entrada en varios años.",
    },
    pro: {
      titular: "Rediseñado por dentro para sostener el rendimiento",
      cuerpo:
        "El A19 Pro va montado sobre un cuerpo de aluminio unibody con cámara de vapor, pensado para que el equipo no baje el ritmo cuando se lo exige de verdad: grabar mucho rato, jugar, editar. El sistema de cámaras es triple de 48 MP, así que cualquiera de los tres lentes entrega el mismo nivel de detalle.",
    },
  },
  16: {
    base: {
      titular: "El primero pensado para Apple Intelligence",
      cuerpo:
        "El A18 le da margen para las funciones de Apple Intelligence, y el nuevo Control de Cámara pone la cámara a un botón de distancia sin desbloquear nada. La principal de 48 MP permite recortar a 2× sin perder definición, así que en la práctica tenés dos distancias focales con dos lentes.",
    },
    pro: {
      titular: "Pantalla más grande y teleobjetivo 5× en los dos tamaños",
      cuerpo:
        "Apple agrandó los Pro a 6.3 y 6.9 pulgadas, y por primera vez el teleobjetivo de 5× llegó también al modelo más chico: hasta esta generación había que llevarse el Pro Max para tener ese alcance. Con el A18 Pro y el titanio, es el Pro más completo sin ir al último modelo.",
    },
  },
  15: {
    base: {
      titular: "USB-C y la Isla Dinámica llegan al modelo de entrada",
      cuerpo:
        "Esta generación cambió el conector Lightning por USB-C, así que carga con el mismo cable que una Mac, un iPad o casi cualquier cosa. Además hereda la Isla Dinámica y la cámara principal de 48 MP, dos cosas que el año anterior eran exclusivas del Pro.",
    },
    pro: {
      titular: "Titanio, botón de Acción y el chip que estrenó el juego pesado",
      cuerpo:
        "El marco pasó de acero a titanio grado 5: se siente notablemente más liviano en la mano para el mismo tamaño. El interruptor de silencio dejó lugar al botón de Acción, configurable, y el A17 Pro fue el primer chip de un teléfono capaz de correr títulos de consola. Sigue siendo el Pro con mejor relación entre lo que ofrece y lo que sale.",
    },
  },
  14: {
    base: {
      titular: "Batería que rinde y seguridad que no se ve hasta que hace falta",
      cuerpo:
        "Mantiene el diseño del 13 pero mejora en lo que se usa todos los días: más autonomía y mejor rendimiento con poca luz. Sumó Detección de Choques y SOS por satélite, dos funciones que no se notan nunca salvo el día que las necesitás.",
    },
    pro: {
      titular: "El que estrenó la Isla Dinámica y los 48 MP",
      cuerpo:
        "Dos cambios que marcaron todo lo que vino después: la muesca se convirtió en la Isla Dinámica, que muestra lo que está pasando en vez de solo ocupar lugar, y la cámara principal saltó a 48 MP. También trajo pantalla siempre activa y el chip A16. Hoy es de los usados más buscados justamente por eso.",
    },
  },
  13: {
    base: {
      titular: "El punto donde la autonomía dejó de ser un problema",
      cuerpo:
        "El A15 y una batería más grande hicieron que este modelo aguante el día entero sin cuidarlo. El sensor principal, más grande que el del 12, mejora bastante las fotos de noche. Es el iPhone que más recomendamos a quien quiere gastar poco y no volver a pensar en el teléfono por un par de años.",
    },
    pro: {
      titular: "La generación que estrenó los 120 Hz",
      cuerpo:
        "Acá apareció ProMotion: la pantalla pasa a 120 Hz y todo el sistema se siente más fluido, algo que cuesta apreciar en fotos pero se nota apenas se usa. Sumó modo macro para fotografiar de muy cerca y modo Cine para video. Es el Pro más accesible que todavía se siente moderno.",
    },
  },
  12: {
    base: {
      titular: "Bordes rectos, 5G y OLED por primera vez en el modelo base",
      cuerpo:
        "El rediseño de bordes planos que Apple sostiene hasta hoy arrancó acá, junto con el 5G, el Ceramic Shield en el frente y MagSafe para accesorios magnéticos. También fue el primer iPhone base con pantalla OLED: negros reales y mucho más contraste que el LCD del 11.",
    },
    pro: {
      titular: "El primer Pro con LiDAR y acero inoxidable",
      cuerpo:
        "Sumó el sensor LiDAR, que enfoca casi al instante con poca luz y habilita realidad aumentada más precisa. El marco de acero inoxidable le da un peso y una terminación distintos a los del modelo base. Con 5G y OLED, sigue siendo un teléfono muy vigente por lo que cuesta.",
    },
  },
  11: {
    base: {
      titular: "El usado más elegido para empezar en el ecosistema Apple",
      cuerpo:
        "Trajo la cámara ultra gran angular y el modo Noche, que fue el salto grande de Apple en fotografía nocturna. El A13 sigue moviendo todo con soltura años después. Si lo que buscás es entrar a iOS gastando lo menos posible sin llevarte algo que se sienta viejo, este es el punto de partida.",
    },
    pro: {
      titular: "Tres cámaras y OLED, al precio de un equipo de entrada",
      cuerpo:
        "Sumó el teleobjetivo al gran angular y al ultra gran angular, así que cubre desde un paisaje hasta un retrato sin moverte. La pantalla OLED Super Retina XDR y el marco de acero inoxidable lo mantienen a otro nivel de terminación. Es el que mejor relación calidad-precio tiene de todo el catálogo usado.",
    },
  },
};

/**
 * Puntos concretos por generación y línea, para quien escanea en vez de leer.
 *
 * Van de lo más distintivo a lo más común y se cortan en cuatro. La lista es
 * de virtudes, no de fichas: un equipo viejo no lleva "carga por Lightning"
 * como destacado —eso no es una ventaja, es un dato de la ficha— sino lo que
 * sí tiene a favor, que es por lo que alguien lo elige.
 */
function destacadosDe(generation: number, linea: Linea): string[] {
  const esPro = linea !== "base";
  const proMotion = esPro ? generation >= 13 : generation >= 17;
  const modernas = generation >= 15 || (esPro && generation >= 14);

  const candidatos: [boolean, string][] = [
    [esPro && generation >= 15, "Marco de titanio, más liviano que el acero"],
    [proMotion, "Pantalla ProMotion de 120 Hz"],
    [
      generation >= 16 || (esPro && generation === 15),
      "Compatible con Apple Intelligence",
    ],
    [modernas, "Cámara principal de 48 MP"],
    [modernas, "Isla Dinámica"],
    [generation >= 15, "Carga por USB-C, el mismo cable que tu Mac o iPad"],
    [
      esPro && generation >= 12 && generation <= 14,
      "Sensor LiDAR y marco de acero inoxidable",
    ],
    [esPro, "Triple cámara con teleobjetivo"],
    [generation >= 12, "5G y carga magnética MagSafe"],
    [generation >= 12 || esPro, "Pantalla OLED Super Retina XDR"],
    [true, "Modo Noche y cámara ultra gran angular"],
    [true, "Desbloqueo con Face ID y resistencia IP68"],
  ];

  return candidatos
    .filter(([aplica]) => aplica)
    .map(([, texto]) => texto)
    .slice(0, 4);
}

/**
 * Descripción del producto. Devuelve `null` para lo que no sea un iPhone
 * conocido: es preferible mostrar la descripción corta del catálogo antes que
 * un texto genérico que podría estar hablando de otro equipo.
 */
export function descripcionDe(product: Product): Descripcion | null {
  if (product.brand !== "Apple" || product.generation === null) return null;
  const datos = GENERACION[product.generation];
  if (!datos) return null;

  const linea = lineaDe(product.line);
  const base = linea === "base" ? datos.base : datos.pro;

  return { ...base, destacados: destacadosDe(product.generation, linea) };
}
