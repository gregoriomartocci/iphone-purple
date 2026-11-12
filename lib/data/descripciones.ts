import type { Descripcion } from "./descripcion";

/**
 * Descripciones escritas producto por producto, por slug.
 *
 * Cada una sale de la página oficial del modelo exacto y guarda sus fuentes,
 * para que cualquiera pueda comprobar de dónde viene cada dato. Lo que no se
 * pudo confirmar no está: un producto sin descripción acá muestra la línea
 * corta del catálogo, nunca un texto inventado.
 */
export const DESCRIPCIONES: Record<string, Descripcion & { fuentes: string[] }> = {
  // AirPods (3ra generación)
  "airpods-3ra-generacion": {
    titular: "Audio espacial personalizado y hasta 30 horas con el estuche",
    cuerpo:
      "Son los AirPods de 2021, con tallo corto y sensor de presión para manejar música y llamadas. El chip H1 maneja el audio espacial personalizado con seguimiento de la cabeza y el ecualizador adaptativo, que ajusta el sonido según cómo te queden puestos. Duran hasta 6 horas por carga y hasta 30 horas con el estuche, y con 5 minutos en el estuche tenés alrededor de una hora de uso. Resisten sudor y agua con certificación IPX4. No tienen cancelación de ruido: son para quien quiere auriculares livianos para usar todos los días.",
    destacados: [
      "Hasta 6 horas por carga y 30 horas con el estuche",
      "Audio espacial personalizado con seguimiento de la cabeza",
      "Resistencia al sudor y al agua IPX4",
      "Sensor de presión en el tallo para música y llamadas",
    ],
    fuentes: ["https://www.apple.com/eg/airpods-3rd-generation/specs/"],
  },
  // AirPods 4
  "airpods-4": {
    titular: "Chip H2, aislamiento de voz y hasta 30 horas con el estuche",
    cuerpo:
      "Son los AirPods 4 en su versión sin cancelación de ruido, con chip H2 y sensor de presión en el tallo para controlar música y llamadas. El aislamiento de voz hace que se te escuche claro en las llamadas aunque haya ruido alrededor, y el audio espacial personalizado con seguimiento de la cabeza acompaña series y música. Duran hasta 5 horas por carga y hasta 30 con el estuche, que carga por USB-C; con 5 minutos en el estuche tenés cerca de una hora. Resisten polvo, sudor y agua (IP54). Son para quien quiere AirPods para todos los días y no necesita aislarse del ruido.",
    destacados: [
      "Hasta 5 horas por carga y 30 horas con el estuche",
      "Aislamiento de voz para llamadas más claras",
      "Resistencia al polvo, al sudor y al agua IP54",
      "Estuche con carga por USB-C",
    ],
    fuentes: ["https://support.apple.com/en-us/121203"],
  },
  // AirPods 4 con Cancelación Activa de Ruido
  "airpods-4-con-cancelacion-activa-de-ruido": {
    titular: "Cancelación de ruido y estuche con carga inalámbrica y parlante",
    cuerpo:
      "Son los AirPods 4 con cancelación activa de ruido: el chip H2 baja el ruido de afuera y el modo Ambiente te deja escuchar lo que pasa alrededor cuando hace falta. El audio adaptativo combina los dos según el entorno, y la detección de conversación baja el volumen cuando empezás a hablar con alguien. El estuche carga por USB-C, con cargadores Qi o con el del Apple Watch, y tiene parlante para encontrarlo con la app Encontrar. Duran hasta 4 horas con la cancelación activada y hasta 20 con el estuche. Son para quien viaja o trabaja en lugares ruidosos.",
    destacados: [
      "Cancelación activa de ruido y modo Ambiente",
      "Estuche con carga USB-C, Qi o cargador del Apple Watch",
      "Parlante en el estuche para encontrarlo con Encontrar",
      "Hasta 4 horas con cancelación y 20 horas con el estuche",
    ],
    fuentes: ["https://support.apple.com/en-us/121204"],
  },
  // AirPods 5
  "airpods-5": {
    titular: "Cancelación de ruido de serie, hasta 50% más que los AirPods 4",
    cuerpo:
      "Son la quinta generación de AirPods y traen cancelación activa de ruido de serie, con un diseño abierto que, según Apple, elimina hasta un 50% más de ruido que los AirPods 4 con cancelación. Llevan chip H2, audio adaptativo, detección de conversación y Traducción en vivo con un iPhone compatible con Apple Intelligence. Duran hasta 4 horas con la cancelación activada y hasta 20 con el estuche, que carga por USB-C. Tienen certificación IP57 contra polvo, sudor y agua. Son para quien prefiere el formato abierto de los AirPods y no quiere renunciar a la cancelación de ruido.",
    destacados: [
      "Cancelación activa de ruido, hasta 50% más que AirPods 4 con ANC",
      "Traducción en vivo con iPhone compatible con Apple Intelligence",
      "Hasta 4 horas con cancelación y 20 horas con el estuche",
      "Resistencia al polvo, al sudor y al agua IP57",
    ],
    fuentes: [
      "https://www.apple.com/airpods-5/specs/",
      "https://www.apple.com/sg/newsroom/2026/09/apple-introduces-airpods-5-with-best-in-class-open-ear-active-noise-cancellation/",
    ],
  },
  // AirPods Max (USB-C), 2024
  "airpods-max-1ra-generacion": {
    titular: "Vincha con cancelación de ruido y audio sin pérdida por USB-C",
    cuerpo:
      "Son los AirPods Max de diseño original, con vincha y almohadillas que cubren toda la oreja, en la versión de 2024 que carga por USB-C. Llevan un chip H1 en cada auricular, cancelación activa de ruido, modo Ambiente y audio espacial personalizado con seguimiento de la cabeza. Duran hasta 20 horas con la cancelación activada, y 5 minutos de carga dan alrededor de una hora y media. Conectados con un cable USB-C reproducen audio sin pérdida desde apps compatibles. La Digital Crown controla volumen, reproducción y llamadas, y el Smart Case los deja en modo de muy bajo consumo.",
    destacados: [
      "Cancelación activa de ruido y modo Ambiente",
      "Hasta 20 horas de batería con la cancelación activada",
      "Audio sin pérdida con conexión USB-C por cable",
      "Digital Crown para volumen, música y llamadas",
    ],
    fuentes: [
      "https://support.apple.com/en-us/121205",
      "https://support.apple.com/en-us/111858",
    ],
  },
  // AirPods Pro 3
  "airpods-pro-3": {
    titular: "Sensor de ritmo cardíaco y hasta 8 horas con cancelación de ruido",
    cuerpo:
      "Los AirPods Pro 3 suman un sensor de ritmo cardíaco en los auriculares, que registra tus entrenamientos en la app Fitness del iPhone. Con chip H2 tienen cancelación activa de ruido y duran hasta 8 horas por carga con la cancelación activada, hasta 24 con el estuche. El estuche carga con MagSafe, con cargadores Qi, con el del Apple Watch o por USB-C, y tiene parlante para encontrarlo con la app Encontrar. Vienen con cinco tamaños de almohadilla, de XXS a L, para que sellen bien en casi cualquier oído, y resisten polvo, sudor y agua con certificación IP57.",
    destacados: [
      "Sensor de ritmo cardíaco para entrenamientos",
      "Hasta 8 horas con cancelación y 24 horas con el estuche",
      "Estuche MagSafe con parlante para la app Encontrar",
      "Cinco tamaños de almohadillas y certificación IP57",
    ],
    fuentes: ["https://www.apple.com/airpods-pro/specs/"],
  },
  // Apple Pencil Pro
  "apple-pencil-pro": {
    titular: "Lo apretás y aparece la paleta de herramientas, sin tocar la pantalla",
    cuerpo:
      "Es el Apple Pencil más completo. Además de sensibilidad a la presión y a la inclinación, suma gestos nuevos: si lo apretás aparece una paleta con herramientas, grosores y colores, y un giroscopio detecta cuando lo girás para rotar pinceles y lapiceras con forma. Responde con una vibración leve al apretarlo o tocarlo dos veces, muestra dónde va a tocar antes de apoyarlo y se puede buscar con la app Encontrar. Se pega con imanes al costado del iPad, que lo empareja y lo carga. Funciona con iPad Pro (M4 y M5), iPad Air (M2, M3 y M4) y iPad mini (A17 Pro y A20 Pro).",
    destacados: [
      "Gesto de apretar para abrir la paleta de herramientas",
      "Giroscopio para rotar pinceles al girar el lápiz",
      "Respuesta háptica y búsqueda con la app Encontrar",
      "Se empareja y se carga pegado con imanes al iPad",
    ],
    fuentes: ["https://www.apple.com/apple-pencil/"],
  },
  // Apple Watch Series 11 (46mm)
  "apple-watch-series-11-46mm": {
    titular: "Hasta 24 horas de batería y ECG en una caja de 46 mm",
    cuerpo:
      "Es el Apple Watch Series 11 en su tamaño grande, de 46 mm, con chip S10 y pantalla Retina siempre activa de hasta 2000 nits, que se lee bien a pleno sol. La batería rinde hasta 24 horas de uso normal y hasta 38 en modo de bajo consumo, y con 15 minutos de carga sumás hasta 8 horas. Hace electrocardiogramas con la app ECG, mide oxígeno en sangre y temperatura, y avisa de posibles signos de apnea del sueño. Es resistente al agua hasta 50 metros, así que podés nadar con él. Necesita un iPhone 11 o posterior con iOS 26 o más nuevo.",
    destacados: [
      "Hasta 24 horas de batería, 38 en modo de bajo consumo",
      "Pantalla Retina siempre activa de hasta 2000 nits",
      "App ECG, oxígeno en sangre y avisos de apnea del sueño",
      "Resistente al agua hasta 50 metros, apto para nadar",
    ],
    fuentes: [
      "https://support.apple.com/en-us/125093",
      "https://www.apple.com/watchos/feature-availability/",
    ],
  },
  // Apple Watch Series 12 (46mm, GPS + Cellular, titanio)
  "apple-watch-series-12-46mm-gps-cellular": {
    titular: "Mide el pulso cada 5 segundos y carga 12 horas en 15 minutos",
    cuerpo:
      "Es el Apple Watch Series 12 de 46 mm con caja de titanio y conexión celular. Estrena el chip S11 y un nuevo sistema de sensores de salud con LEDs más grandes, que mide el ritmo cardíaco cada cinco segundos durante todo el día. Hace electrocardiogramas, mide oxígeno en sangre y temperatura, y es resistente al agua hasta 50 metros. La batería da hasta 24 horas de uso normal y hasta 10 horas de entrenamiento al aire libre, y con 15 minutos de carga sumás hasta 12 horas. Con un plan celular compatible podés llamar o recibir mensajes sin el iPhone cerca.",
    destacados: [
      "Chip S11 y ritmo cardíaco medido cada 5 segundos",
      "Caja de titanio con cristal de zafiro, 5G y LTE",
      "15 minutos de carga dan hasta 12 horas de uso",
      "Hasta 24 horas de batería y 10 de entrenamiento al aire libre",
    ],
    fuentes: [
      "https://www.apple.com/newsroom/2026/09/introducing-apple-watch-series-12-with-the-all-new-health-sensing-system/",
      "https://www.apple.com/apple-watch-series-12/specs/",
      "https://www.apple.com/watchos/feature-availability/",
    ],
  },
  // Adaptador de corriente USB-C de 20 W
  "cargador-apple-usb-c-20w": {
    titular: "Carga rápida para iPhone: hasta el 50% en unos 30 minutos",
    cuerpo:
      "Es el cargador de pared de Apple con salida USB-C de 20 W. Con un cable USB-C habilita la carga rápida del iPhone: según Apple, el iPhone 16e y el iPhone 17e llegan hasta el 50% en unos 30 minutos con un adaptador de 20 W o más. Sirve también para iPad, AirPods y cualquier equipo que cargue por USB-C. Para la carga más rápida del iPhone 18 Pro, Apple indica un adaptador de 60 W o más: con este carga igual, pero más lento. El cable se vende por separado.",
    destacados: [
      "Salida USB-C de 20 W",
      "Carga rápida: hasta 50% en unos 30 minutos en iPhone 16e y 17e",
      "Sirve para iPhone, iPad, AirPods y otros equipos USB-C",
      "No incluye cable",
    ],
    fuentes: [
      "https://www.apple.com/shop/product/MWVV3AM/A/20w-usb-c-power-adapter",
      "https://support.apple.com/en-us/122208",
      "https://www.apple.com/iphone-17e/specs/",
      "https://www.bestbuy.com/product/apple-20w-usb-c-power-adapter-white/JJ8ZHP6JCQ/sku/10354265",
    ],
  },
  // Dyson Supersonic r Professional (HD18)
  "dyson-hd18-hair-dryer-r-professional": {
    titular: "El secador profesional de Dyson, con accesorios que se ajustan solos",
    cuerpo:
      "Es la versión para estilistas del Supersonic r, el secador en forma de r de Dyson. Su motor Hyperdymium gira hasta 110.000 rpm y genera un chorro de aire controlado para secar rápido sin castigar el pelo. Dyson lo hizo un 30% más chico y un 20% más liviano que el Supersonic original, así que se maneja mejor en jornadas largas. Cada accesorio trae un chip RFID: al colocarlo, el secador ajusta solo el flujo de aire y la temperatura, y recuerda la última configuración usada. Conviene a peluqueros y a quien se seca y peina el pelo todos los días.",
    destacados: [
      "Motor Hyperdymium de hasta 110.000 rpm",
      "30% más chico y 20% más liviano que el Supersonic original",
      "Accesorios con chip RFID que ajustan aire y temperatura solos",
      "4 niveles de calor, 3 de velocidad y botón de aire frío",
    ],
    fuentes: [
      "https://www.dyson.com/commercial/hair-care/supersonic-r-professional",
      "https://www.dyson.co.uk/discover/innovation/new-machines/introducing-supersonic-r-for-professional-styling",
      "https://961souq.com/products/dyson-supersonic-r-professional-hair-dryer-hd18",
    ],
  },
  // Dyson PencilVac Fluffycones (SV50)
  "dyson-sv50-pencilvac-fluffycones": {
    titular: "La aspiradora más delgada de Dyson: 38 mm de diámetro y 1,8 kg",
    cuerpo:
      "La PencilVac es una aspiradora sin cable con forma de lápiz: todo el cuerpo mide 38 mm de diámetro porque el motor Hyperdymium, de 28 mm y hasta 140.000 rpm, va adentro del mango. Pesa alrededor de 1,8 kg, así que se usa con una mano y se guarda en cualquier rincón. El cabezal Fluffycones tiene cuatro rodillos cónicos que levantan el pelo sin que se enrede y limpian de borde a borde, con luces LED hacia adelante y hacia atrás. Rinde hasta 30 minutos y está diseñada solo para pisos duros: conviene para departamentos o para la pasada diaria rápida.",
    destacados: [
      "Cuerpo de 38 mm de diámetro y alrededor de 1,8 kg",
      "Motor Hyperdymium de 140.000 rpm dentro del mango",
      "Cuatro rodillos cónicos que no enredan el pelo",
      "Hasta 30 minutos de autonomía; diseñada solo para pisos duros",
    ],
    fuentes: [
      "https://www.dyson.com/vacuum-cleaners/cordless/pencilvac/fluffycones",
      "https://www.dysoncanada.ca/en/vacuum-cleaners/cordless/pencilvac/fluffycones",
      "https://www.jbhifi.com.au/products/dyson-pencilvac-fluffycones-cordless-vacuum",
    ],
  },
  // Dyson V15 Detect (versión con cabezal Fluffy)
  "dyson-v15-fluffy": {
    titular: "La aspiradora que ilumina el polvo y cuenta lo que levanta",
    cuerpo:
      "La V15 Detect es la aspiradora sin cable de Dyson pensada para ver lo que limpia. Su cabezal Fluffy proyecta una luz verde sobre los pisos duros y deja a la vista el polvo fino que a simple vista se pierde. Un sensor piezoeléctrico mide las partículas que aspira y la pantalla LCD muestra en tiempo real el conteo, el modo de potencia y la autonomía restante. Rinde hasta 60 minutos en modo Eco y llega a 240 AW de succión en modo máximo. Es para quien quiere una aspiradora principal sin cable que sirva tanto para pisos como para el resto de la casa.",
    destacados: [
      "Cabezal Fluffy con luz verde que revela el polvo en pisos duros",
      "Sensor que mide las partículas aspiradas y las muestra en pantalla",
      "Hasta 60 minutos de autonomía en modo Eco",
      "Hasta 240 AW de succión en modo máximo",
    ],
    fuentes: [
      "https://www.dyson.co.uk/vacuum-cleaners/cordless/v15/detect-yellow-iron",
      "https://www.dyson.ie/vacuum-cleaners/cordless/v15/detect-total-clean",
      "https://support.dyson.ph/vacuums/cordless/dyson-v15.aspx",
    ],
  },
  // Dyson V16 Piston Animal
  "dyson-v16-piston-animal-ds60": {
    titular: "La aspiradora sin cable más potente de Dyson, con cabezal antienredos",
    cuerpo:
      "La V16 Piston Animal es la aspiradora sin cable más potente de Dyson: 315 AW de succión y hasta 70 minutos de autonomía. Su cabezal All Floor Cones Sense ajusta solo la potencia y la velocidad del rodillo según el piso, y sus conos desenredan el pelo largo y el de mascotas. Un sensor piezoeléctrico mide el polvo fino y la pantalla LCD a color muestra el conteo de partículas, el modo de potencia y la autonomía restante. El depósito CleanCompaktor comprime la suciedad mientras limpiás, para vaciarlo menos seguido. Es para casas grandes, con alfombras o con mascotas.",
    destacados: [
      "315 AW de succión, la más alta de las aspiradoras sin cable de Dyson",
      "Hasta 70 minutos de autonomía",
      "Cabezal All Floor Cones Sense que ajusta la potencia según el piso",
      "Depósito CleanCompaktor que comprime el polvo mientras aspirás",
    ],
    fuentes: [
      "https://www.dyson.com/vacuum-cleaners/cordless/v16-piston/black-copper",
      "https://www.dyson.ie/vacuum-cleaners/cordless/v16-piston-animal/black-copper",
      "https://www.jbhifi.com.au/products/dyson-v16-piston-animal-cordless-stick-vacuum",
    ],
  },
  // Garmin Approach S70 42 mm
  "garmin-approach-s70-42mm": {
    titular: "Reloj de golf con AMOLED y más de 43.000 canchas cargadas",
    cuerpo:
      "El Approach S70 es el reloj de golf de Garmin, en su tamaño de 42 mm con pantalla táctil AMOLED de 1,2 pulgadas y bisel de cerámica. Viene con más de 43.000 canchas del mundo precargadas: te muestra la distancia al green, los obstáculos y, con PlaysLike, ajusta la distancia según el terreno. El caddie virtual sugiere palo, AutoShot detecta los golpes y la tarjeta digital registra putts, greens y fairways. Fuera de la cancha mide frecuencia cardíaca, sueño, estrés y Body Battery. La batería rinde hasta 10 días en modo reloj y 15 horas con GPS, alcanza para dos vueltas de 18 hoyos.",
    destacados: [
      'Pantalla AMOLED táctil de 1,2" con bisel de cerámica',
      "Más de 43.000 canchas de golf precargadas",
      "Caddie virtual, distancias PlaysLike y detección automática de golpes",
      "Hasta 10 días en modo reloj y 15 horas con GPS",
    ],
    fuentes: [
      "https://www.gpscentral.ca/product/garmin-approach-s70-42mm-02746-00",
      "https://www.abt.com/Garmin-Approach-S70-Gray-Silicone-Band-Smartwatch-42mm-0100274601/p/193300.html",
      "https://www.notebookcheck.net/Garmin-Approach-S70-arrives-with-new-functionality-and-AMOLED-displays.719586.0.html",
    ],
  },
  // Garmin epix Pro (Gen 2) Sapphire Edition 51 mm
  "garmin-epix-pro-gen-2-51mm-sapphire": {
    titular: 'AMOLED de 1,4", linterna LED y hasta 31 días de batería',
    cuerpo:
      "El epix Pro de 51 mm es el reloj multideporte de Garmin con pantalla AMOLED: 1,4 pulgadas a 454 × 454, protegida por un cristal de zafiro y con bisel de titanio en esta edición Sapphire. Trae GPS multibanda con SatIQ y mapas topográficos TopoActive precargados en sus 32 GB, así que te guía en la montaña sin depender del teléfono. La linterna LED integrada tiene intensidad variable, luz roja y modo estroboscópico. La batería rinde hasta 31 días en modo reloj y hasta 82 horas con GPS. Es para quien corre, pedalea o hace trekking en serio.",
    destacados: [
      'Pantalla AMOLED de 1,4" con cristal de zafiro y bisel de titanio',
      "Hasta 31 días en modo reloj y 82 horas con GPS",
      "GPS multibanda y mapas TopoActive precargados (32 GB)",
      "Linterna LED integrada y resistencia al agua 10 ATM",
    ],
    fuentes: [
      "https://the5krunner.com/specs/garmin/epix-pro/",
      "https://www.rei.com/product/227458/garmin-epix-pro-gen-2-sapphire-edition",
      "https://www.adorama.com/gpepsp51cg.html",
    ],
  },
  // iPad (A16)
  "ipad-a16": {
    titular: "Pantalla Liquid Retina de 11 pulgadas y chip A16 para el día a día",
    cuerpo:
      "Es el iPad base, con chip A16 y pantalla Liquid Retina de 11 pulgadas con True Tone. La cámara frontal de 12 MP está en el borde horizontal, así que en videollamadas con el iPad apoyado de costado quedás centrado, y Center Stage te acompaña si te movés. Se desbloquea con Touch ID en el botón superior y carga por USB-C. Rinde hasta 10 horas navegando o mirando video y funciona con el Apple Pencil (USB-C). Es para estudiar, leer, ver series o tomar notas; no es compatible con Apple Intelligence.",
    destacados: [
      "Chip A16 y pantalla Liquid Retina de 11 pulgadas",
      "Cámara frontal horizontal de 12 MP con Center Stage",
      "Hasta 10 horas navegando o mirando video",
      "Touch ID en el botón superior y carga por USB-C",
    ],
    fuentes: [
      "https://support.apple.com/en-us/122240",
      "https://www.techradar.com/tablets/ipad/apples-new-entry-level-ipad-doubles-the-storage-and-ups-the-performance-but-doesnt-raise-the-price",
    ],
  },
  // iPad Air 11-inch (M4)
  "ipad-air-11-m4": {
    titular: "Chip M4 y 12 GB de memoria en un iPad de 11 pulgadas",
    cuerpo:
      "Es el iPad Air de 11 pulgadas con chip M4: CPU de 8 núcleos, GPU de 9 núcleos con ray tracing y 12 GB de memoria unificada, un 50% más que la generación anterior. Según Apple es hasta 30% más rápido que el iPad Air con M3. La pantalla Liquid Retina funciona con el Apple Pencil Pro para dibujar o tomar apuntes, y con el Magic Keyboard para iPad Air sirve para trabajar. La cámara frontal de 12 MP está en el borde horizontal, así que en videollamadas quedás centrado. Da hasta 10 horas de uso con Wi-Fi y conviene a quien estudia o dibuja en movimiento.",
    destacados: [
      "Chip M4 con CPU de 8 núcleos y 12 GB de memoria unificada",
      'Pantalla Liquid Retina de 11" con 500 nits',
      "Compatible con Apple Pencil Pro y Magic Keyboard para iPad Air",
      "Hasta 10 horas de uso con Wi-Fi, Wi-Fi 7 y Touch ID",
    ],
    fuentes: [
      "https://www.apple.com/ipad-air/specs/",
      "https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-ipad-air-powered-by-m4/",
    ],
  },
  // iPad Air 13-inch (M4)
  "ipad-air-13-m4": {
    titular: 'Pantalla de 13" con 600 nits, chip M4 y 12 GB de memoria',
    cuerpo:
      "Es el iPad Air de 13 pulgadas con chip M4: CPU de 8 núcleos, GPU de 9 núcleos con ray tracing y 12 GB de memoria unificada, un 50% más que la generación anterior. Según Apple es hasta 30% más rápido que el iPad Air con M3. La pantalla Liquid Retina de 13 pulgadas llega a 600 nits y deja espacio para dos apps lado a lado, una partitura o un plano completo. Funciona con el Apple Pencil Pro y el Magic Keyboard para iPad Air, y la cámara frontal de 12 MP va en el borde horizontal. Pesa 616 g y da hasta 10 horas de uso con Wi-Fi.",
    destacados: [
      'Pantalla Liquid Retina de 13" con 600 nits',
      "Chip M4 con CPU de 8 núcleos y 12 GB de memoria unificada",
      "Compatible con Apple Pencil Pro y Magic Keyboard para iPad Air",
      "Hasta 10 horas de uso con Wi-Fi, Wi-Fi 7 y Touch ID",
    ],
    fuentes: [
      "https://www.apple.com/ipad-air/specs/",
      "https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-ipad-air-powered-by-m4/",
    ],
  },
  // iPhone 16e
  "iphone-16e": {
    titular: "Chip A18 y Apple Intelligence en el iPhone de entrada",
    cuerpo:
      "Es el modelo de entrada de la generación 16 y lleva el chip A18, con margen para las funciones de Apple Intelligence. La pantalla OLED de 6,1 pulgadas, Face ID y el botón de Acción configurable lo ponen al día con el resto de la línea. La cámara Fusion de 48 MP permite recortar a 2× con calidad óptica, así que en la práctica tenés dos distancias focales con un solo lente. Suma el módem C1 de Apple, certificación IP68 y hasta 26 horas de video. Conviene a quien quiere un iPhone actual para muchos años y no necesita más de una cámara trasera.",
    destacados: [
      "Chip A18, compatible con Apple Intelligence",
      "Pantalla OLED Super Retina XDR de 6,1 pulgadas",
      "Cámara Fusion de 48 MP con zoom 2× de calidad óptica",
      "Hasta 26 horas de reproducción de video",
    ],
    fuentes: ["https://support.apple.com/en-us/122208"],
  },
  // iPhone 17e
  "iphone-17e": {
    titular: "Chip A19 y carga MagSafe en el iPhone de entrada de la línea 17",
    cuerpo:
      "Es el modelo de entrada de la generación 17 y suma lo que al 16e le faltaba: carga inalámbrica MagSafe y Qi2 de hasta 15 W, así que se pega a cargadores y accesorios magnéticos. Lleva el chip A19 y el módem C1X de Apple, pantalla OLED de 6,1 pulgadas, Face ID y botón de Acción. La cámara Fusion de 48 MP permite un 2× de calidad óptica y graba en 4K Dolby Vision a 60 cuadros por segundo. Con certificación IP68 y hasta 26 horas de video, es para quien quiere un iPhone actual y completo para el día a día.",
    destacados: [
      "Chip A19 y módem Apple C1X",
      "Carga inalámbrica MagSafe y Qi2 de hasta 15 W",
      "Cámara Fusion de 48 MP con 2× de calidad óptica",
      "Hasta 26 horas de reproducción de video",
    ],
    fuentes: [
      "https://www.apple.com/iphone-17e/specs/",
      "https://support.apple.com/en-us/122208",
    ],
  },
  // iPhone Duo
  "iphone-18-duo": {
    titular: "El primer iPhone plegable: se abre en una pantalla de 7,6 pulgadas",
    cuerpo:
      "Es el primer iPhone plegable. Cerrado, lo usás como un teléfono normal con la pantalla exterior de 5,4 pulgadas; abierto, tenés una pantalla interior de 7,6 pulgadas, la más grande de un iPhone, con dos apps lado a lado en Split View. Las dos pantallas son ProMotion a 120 Hz. Lleva el chip A20 Pro, marco y cubierta de bisagra de titanio grado 5, Touch ID en el botón lateral y dos cámaras traseras Fusion de 48 MP. Funciona solo con eSIM, sin ranura para chip físico. Es para quien quiere leer, trabajar o mirar video en algo cercano a una tablet sin llevar otro equipo.",
    destacados: [
      "Pantalla plegable de 7,6 pulgadas y exterior de 5,4, ambas a 120 Hz",
      "Chip A20 Pro y marco de titanio grado 5",
      "Touch ID en el botón lateral, abierto o cerrado",
      "Hasta 44 horas de video usando la pantalla exterior",
    ],
    fuentes: [
      "https://www.apple.com/iphone-duo/",
      "https://www.apple.com/iphone-duo/specs/",
    ],
  },
  // iPhone 18 Pro
  "iphone-18-pro": {
    titular: "Zoom de 0,5× a 8× con calidad óptica y chip A20 Pro",
    cuerpo:
      "El iPhone 18 Pro lleva el chip A20 Pro y el módem C2 de Apple en un cuerpo de aluminio unibody, con pantalla ProMotion de 6,3 pulgadas a 120 Hz. La cámara principal Fusion de 48 MP tiene apertura variable, y junto al ultra gran angular y al teleobjetivo 4×, ambos de 48 MP, cubre de 0,5× a 8× con calidad óptica. Graba en 4K Dolby Vision hasta 120 cuadros por segundo y llega al 50% de carga en unos 15 minutos con un cargador de 60 W o más. Es para quien usa mucho la cámara y prefiere el tamaño más manejable de la línea Pro.",
    destacados: [
      "Cámara principal Fusion de 48 MP con apertura variable",
      "Zoom de calidad óptica hasta 8× con teleobjetivo de 48 MP",
      "Pantalla ProMotion de 6,3 pulgadas a 120 Hz",
      "Hasta 36 horas de reproducción de video",
    ],
    fuentes: ["https://www.apple.com/iphone-18-pro/specs/"],
  },
  // iPhone 18 Pro Max
  "iphone-18-pro-max": {
    titular: "Pantalla de 6,9 pulgadas y hasta 45 horas de video con el A20 Pro",
    cuerpo:
      "Tiene el mismo chip A20 Pro y el mismo sistema de cámaras que el iPhone 18 Pro, pero con pantalla ProMotion de 6,9 pulgadas y más batería: hasta 45 horas de reproducción de video, contra 36 del modelo de 6,3. La principal Fusion de 48 MP con apertura variable, el ultra gran angular y el teleobjetivo 4×, también de 48 MP, cubren de 0,5× a 8× con calidad óptica. Suma el módem C2 de Apple, carga MagSafe y Qi2 de hasta 25 W y certificación IP68. Conviene a quien mira mucho video, juega o edita en el teléfono y prioriza la autonomía.",
    destacados: [
      "Pantalla ProMotion de 6,9 pulgadas a 120 Hz",
      "Hasta 45 horas de reproducción de video",
      "Tres cámaras traseras de 48 MP, con zoom de calidad óptica hasta 8×",
      "Carga inalámbrica MagSafe y Qi2 de hasta 25 W",
    ],
    fuentes: ["https://www.apple.com/iphone-18-pro/specs/"],
  },
  // Logitech G203 LIGHTSYNC
  "logitech-g203-lightsync": {
    titular: "Mouse gamer de 8.000 DPI con 6 botones e iluminación RGB",
    cuerpo:
      "El G203 LIGHTSYNC es el mouse gamer con cable de entrada de Logitech G. Su sensor se ajusta entre 200 y 8.000 DPI, y responde a 1.000 Hz, es decir, reporta cada 1 ms, así que el puntero sigue la mano sin demora. Tiene 6 botones programables y pesa 85 g. La iluminación LIGHTSYNC RGB se divide en tres zonas que configurás desde el software G HUB, donde también podés guardar hasta 5 perfiles. Funciona con Windows 7 o posterior y con macOS 10.13 o posterior. Conviene a quien empieza a jugar en PC o quiere un mouse preciso para todos los días.",
    destacados: [
      "Sensor ajustable de 200 a 8.000 DPI",
      "Tasa de respuesta de 1.000 Hz (1 ms)",
      "6 botones programables y 85 g de peso",
      "Iluminación RGB en tres zonas configurables con G HUB",
    ],
    fuentes: [
      "https://www.logitechg.com/en-us/shop/p/g203-lightsync-rgb-gaming-mouse",
      "https://ir.logitech.com/press-releases/press-release-details/2020/New-Logitech-G203-LIGHTSYNC-Gaming-Mouse-Delivers-Gaming-Grade-Performance-at-an-Affordable-Price/default.aspx",
    ],
  },
  // Logitech G29 Driving Force
  "logitech-g29-driving-force-racing-wheel-and-pedals": {
    titular: "Volante con force feedback de dos motores y giro de 900°",
    cuerpo:
      "El G29 Driving Force es el volante con pedalera de Logitech para PlayStation 5, PlayStation 4 y PC. Su force feedback de dos motores con engranajes helicoidales te transmite en las manos el agarre de los neumáticos y los golpes del piano. Gira 900° de tope a tope, como un auto real, y el aro está forrado en cuero cosido a mano, con levas de cambio de acero inoxidable. La pedalera trae tres pedales; el de freno es no lineal, para dosificar la frenada como en un sistema sensible a la presión. Es para quien juega Gran Turismo, F1 o simuladores en PC y quiere dejar el joystick.",
    destacados: [
      "Compatible con PS5, PS4 y PC",
      "Force feedback de dos motores con engranajes helicoidales",
      "Rotación de 900° y aro forrado en cuero cosido a mano",
      "Pedalera de tres pedales con freno no lineal",
    ],
    fuentes: [
      "https://www.logitechg.com/en-us/products/driving/driving-force-racing-wheel.html",
      "https://logitechg.com/en-us/products/refurbished/driving-force-racing-wheel-refurb.html",
    ],
  },
  // Mac mini (2024) con chip M4 Pro
  "mac-mini-m4-pro": {
    titular: "Chip M4 Pro y tres puertos Thunderbolt 5 en 12,7 cm de lado",
    cuerpo:
      "Es la Mac mini de 2024 en su versión M4 Pro: mide 12,7 por 12,7 centímetros y 5 de alto, y en la configuración base trae CPU de 12 núcleos, GPU de 16 núcleos y 24 GB de memoria unificada. Atrás tiene tres puertos Thunderbolt 5 de hasta 120 Gb/s, HDMI y Ethernet; adelante, dos USB-C y salida para auriculares. Maneja hasta tres pantallas externas de hasta 6K a 60 Hz. Se conecta a tu monitor, teclado y mouse, y conviene a quien edita video, programa o trabaja con varios monitores y quiere potencia de escritorio en muy poco espacio.",
    destacados: [
      "Tres puertos Thunderbolt 5 de hasta 120 Gb/s",
      "Hasta tres pantallas externas de hasta 6K a 60 Hz",
      "Dos USB-C y salida de auriculares en el frente",
      "Wi‑Fi 6E y Bluetooth 5.3",
    ],
    fuentes: ["https://support.apple.com/en-us/121555"],
  },
  // Mac mini con chip M6
  "mac-mini-m6": {
    titular: "Chip M6, Wi‑Fi 7 y hasta tres pantallas en una caja de 12,7 cm",
    cuerpo:
      "La Mac mini con chip M6 trae CPU de 12 núcleos, GPU de 12 núcleos y 16 GB de memoria unificada en su configuración de 256 GB, en un cuerpo de 12,7 por 12,7 centímetros y 5 de alto. Atrás tiene tres puertos Thunderbolt 4, HDMI y Ethernet de 2,5 Gb; adelante, dos USB-C y salida de auriculares. Conecta hasta tres pantallas externas y suma Wi‑Fi 7 y Bluetooth 6 con el chip N1 de Apple. La enchufás a tu monitor, teclado y mouse y tenés una Mac completa para trabajo de oficina, estudio o edición liviana, ocupando muy poco lugar en el escritorio.",
    destacados: [
      "CPU y GPU de 12 núcleos, con 16 GB de memoria unificada",
      "Hasta tres pantallas externas",
      "Tres Thunderbolt 4, HDMI y dos USB-C frontales",
      "Wi‑Fi 7 y Bluetooth 6",
    ],
    fuentes: [
      "https://www.apple.com/mac-mini/specs/",
      "https://futurefive.co.nz/story/apple-unveils-m6-mac-mini-with-faster-ai-performance",
    ],
  },
  // MacBook Air (13-inch, M5)
  "macbook-air-13-m5": {
    titular: "Chip M5 en 1,23 kg, sin ventilador y con hasta 18 horas de batería",
    cuerpo:
      "Es la MacBook Air de 13,6 pulgadas con chip M5: CPU de 10 núcleos y GPU con un Neural Accelerator en cada núcleo, que según Apple hace tareas de IA hasta 4 veces más rápido que la MacBook Air con M4. No tiene ventilador, así que trabaja en silencio total, y pesa 1,23 kg con 1,13 cm de espesor. La batería da hasta 18 horas de video, suficiente para una jornada de facultad u oficina sin cargador. Suma Wi-Fi 7, dos Thunderbolt 4, MagSafe y soporte para dos monitores externos. Conviene a quien quiere una notebook liviana para estudiar, trabajar y llevar todos los días.",
    destacados: [
      "Chip M5 con CPU de 10 núcleos, diseño sin ventilador",
      'Pantalla Liquid Retina de 13,6" con 500 nits',
      "Hasta 18 horas de reproducción de video",
      "1,23 kg, Wi-Fi 7 y soporte para dos monitores externos",
    ],
    fuentes: [
      "https://www.apple.com/macbook-air/specs/",
      "https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/",
    ],
  },
  // MacBook Air (15-inch, M5)
  "macbook-air-15-m5": {
    titular: 'Pantalla de 15,3" y seis parlantes en una Air de 1,51 kg sin ventilador',
    cuerpo:
      "Es la MacBook Air de 15,3 pulgadas con chip M5: CPU de 10 núcleos y GPU de 10 núcleos con un Neural Accelerator en cada uno, que según Apple hace tareas de IA hasta 4 veces más rápido que la MacBook Air con M4. La pantalla más grande deja trabajar con dos ventanas lado a lado, y los seis parlantes con woofers mejoran el sonido para series y videollamadas. No tiene ventilador, pesa 1,51 kg y da hasta 18 horas de video. Suma Wi-Fi 7, dos Thunderbolt 4 y MagSafe. Conviene a quien quiere pantalla grande sin cargar con una notebook pesada.",
    destacados: [
      "Chip M5 con CPU de 10 núcleos y GPU de 10 núcleos",
      'Pantalla Liquid Retina de 15,3" con 500 nits',
      "Seis parlantes con woofers de cancelación de fuerza",
      "Hasta 18 horas de video, sin ventilador y 1,51 kg",
    ],
    fuentes: [
      "https://www.apple.com/macbook-air/specs/",
      "https://www.apple.com/newsroom/2026/03/apple-introduces-the-new-macbook-air-with-m5/",
    ],
  },
  // MacBook Pro (14-inch, M5)
  "macbook-pro-14-m5": {
    titular: "Chip M5, pantalla XDR a 120 Hz y hasta 24 horas de batería",
    cuerpo:
      "Es la MacBook Pro de 14 pulgadas con chip M5: CPU de 10 núcleos y una GPU de 10 núcleos con un Neural Accelerator en cada uno, que según Apple rinde hasta 3,5 veces más que el M4 en tareas de IA. La pantalla Liquid Retina XDR de 14,2 pulgadas llega a 1600 nits en HDR y va a 120 Hz con ProMotion. Trae HDMI, lector de tarjetas SDXC y tres Thunderbolt 4, así que conectás monitor, cámara o disco sin adaptadores. Con hasta 24 horas de video, conviene a quien edita foto o video, programa o corre modelos de IA en la máquina.",
    destacados: [
      "Chip M5 con CPU de 10 núcleos y GPU de 10 núcleos",
      'Pantalla Liquid Retina XDR de 14,2" con ProMotion hasta 120 Hz',
      "Hasta 24 horas de reproducción de video",
      "Tres Thunderbolt 4, HDMI, ranura SDXC y MagSafe 3",
    ],
    fuentes: [
      "https://support.apple.com/en-us/125405",
      "https://www.apple.com/newsroom/2025/10/apple-unveils-new-14-inch-macbook-pro-powered-by-the-m5-chip/",
    ],
  },
  // MSI Cyborg 15 B2RW (Intel Core 5 210H, GeForce RTX 5060)
  "msi-cyborg-gaming-156-i5-210h-rtx-5060": {
    titular: "Notebook gamer con RTX 5060 y pantalla de 144 Hz",
    cuerpo:
      "La Cyborg 15 es la notebook gamer de MSI con chasis negro translúcido. Combina un Intel Core 5 210H de 8 núcleos y 12 hilos, hasta 4,8 GHz, con una GeForce RTX 5060 de 8 GB GDDR7, que te deja jugar títulos actuales en Full HD y usar DLSS. La pantalla de 15,6 pulgadas es Full HD a 144 Hz, para que los juegos rápidos se vean fluidos. Trae 16 GB de RAM DDR5, Wi-Fi 6E, HDMI 2.1 y USB-C con DisplayPort, y pesa alrededor de 2,1 kg. Es para quien quiere jugar y estudiar o trabajar en la misma máquina.",
    destacados: [
      "GeForce RTX 5060 con 8 GB GDDR7",
      "Intel Core 5 210H de 8 núcleos y hasta 4,8 GHz",
      'Pantalla de 15,6" Full HD a 144 Hz',
      "16 GB DDR5, Wi-Fi 6E y HDMI 2.1",
    ],
    fuentes: [
      "https://us.msi.com/Laptop/Cyborg-15-B2RWX/Specification",
      "https://villman.com/Product-Detail/msi-gaming_cyborg-15-b2rwfkg-035ph--156in-fhd-144hz--intel-core-5-210h--16gb-ddr5--512gb-ssd--rtx-5060-8gb--win11",
    ],
  },
  // MSI PRO MP225V
  "msi-pro-mp22v-monitor-22-100hz": {
    titular: 'Monitor Full HD de 21,45" a 100 Hz con cuidado de la vista',
    cuerpo:
      "El PRO MP225V es un monitor de oficina de MSI con panel VA de 21,45 pulgadas, resolución Full HD y 100 Hz por HDMI: el cursor y el scroll se ven más fluidos que en uno de 60 Hz. Ofrece 300 nits de brillo, contraste de 4000:1, ángulos de visión de 178° y superficie antirreflejo. Para jornadas largas suma tecnología Anti-Flicker, modo de menos luz azul y el recordatorio Eye-Q Check para descansar la vista. Tiene entradas HDMI y VGA, inclinación de -5° a 20° y montaje VESA de 100 × 100 mm. Es para casa, estudio u oficina.",
    destacados: [
      'Panel VA de 21,45" Full HD a 100 Hz por HDMI',
      "300 nits, contraste 4000:1 y superficie antirreflejo",
      "Anti-Flicker, menos luz azul y recordatorio Eye-Q Check",
      "Entradas HDMI y VGA, montaje VESA 100 × 100",
    ],
    fuentes: [
      "https://www.msi.com/Business-Productivity-Monitor/PRO-MP225V/Specification",
      "https://storage-asset.msi.com/datasheet/pro-monitors/uk/PRO-MP225V.pdf",
      "https://www.adorama.com/MSIPROMP225V.html",
    ],
  },
};
