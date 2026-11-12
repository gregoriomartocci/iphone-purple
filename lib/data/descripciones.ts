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
  // DJI Avata 2 Fly Smart Combo
  "dji-avata-2-fly-smart-combo": {
    titular: "Dron FPV con antiparras y control por movimiento, listo para volar",
    cuerpo:
      "El Avata 2 es el dron de vuelo en primera persona de DJI: con las antiparras puestas ves lo que ve la cámara. Pesa unos 377 g, tiene sensor de 1/1,3 pulgadas y graba en 4K hasta 100 cuadros con 155° de campo visual y color D-Log M. La transmisión O4 llega hasta 10 km en norma CE y vuela unos 23 minutos por batería, con 46 GB de memoria interna. El Fly Smart Combo trae el dron, las antiparras DJI Goggles N3 y el control por movimiento RC Motion 3, que se maneja inclinando la mano.",
    destacados: [
      'Sensor de 1/1,3" y video 4K hasta 100 cuadros',
      "Transmisión O4 de hasta 10 km (CE) y 46 GB internos",
      "Unos 23 minutos de vuelo por batería",
      "Incluye antiparras DJI Goggles N3 y control RC Motion 3",
    ],
    fuentes: [
      "https://www.dji.com/avata-2/specs",
      "https://store.dji.com/nl/product/dji-avata-2-fly-smart-combo-single-battery",
      "https://store.dji.com/product/dji-avata-2-fly-smart-combo-three-battery",
    ],
  },
  // DJI Avata 360 Fly More Combo (DJI RC 2)
  "dji-avata-360-fly-more-combo-rc2": {
    titular: "Dron con cámara 360° en 8K a 60 cuadros y LiDAR frontal",
    cuerpo:
      "El Avata 360 es un dron con cámara 360°: dos sensores de 1/1,1 pulgadas graban la escena completa en 8K hasta 60 cuadros, y después elegís el encuadre al editar. También puede usar un solo lente y grabar en 4K a 60 como una cámara común. Detecta obstáculos en todas las direcciones con LiDAR frontal, pesa unos 455 g y vuela unos 23 minutos. La transmisión O4+ llega hasta 10 km en norma CE y trae 42 GB internos. Esta versión se maneja con el control DJI RC 2, y el Fly More Combo suma dos baterías extra, hub de carga y bolso.",
    destacados: [
      'Video 360° en 8K a 60 cuadros con dos sensores de 1/1,1"',
      "Modo de un lente en 4K a 60 cuadros",
      "Detección de obstáculos omnidireccional con LiDAR frontal",
      "Combo con control DJI RC 2, tres baterías y hub de carga",
    ],
    fuentes: [
      "https://www.dji.com/avata-360/specs",
      "https://www.adorama.com/DJIAVATA360F.html",
      "https://photogear.co.nz/dji/dji-avata-360-fly-more-combo-dji-rc-2/",
    ],
  },
  // DJI Goggles Integra
  "dji-goggles-integra": {
    titular: "Antiparras FPV con pantallas micro-OLED y batería en la vincha",
    cuerpo:
      "Las Goggles Integra son las antiparras de vuelo en primera persona de DJI con la batería integrada en la vincha: no hay cable colgando ni batería suelta en el bolsillo. Tienen dos pantallas micro-OLED de 0,49 pulgadas con resolución 1080p y hasta 100 Hz. La batería de 2450 mAh rinde unas 2 horas por carga y se carga por USB-C; el conjunto pesa unos 410 g. Graban lo que ves en una tarjeta microSD de hasta 512 GB. Son para quien vuela un DJI Avata o drones con DJI O3 Air Unit.",
    destacados: [
      "Dos pantallas micro-OLED 1080p de hasta 100 Hz",
      "Batería de 2450 mAh integrada en la vincha: unas 2 horas",
      "Peso de unos 410 g con batería incluida",
      "Grabación en microSD de hasta 512 GB",
    ],
    fuentes: [
      "https://dji.com/goggles-integra/specs",
      "https://oscarliang.com/dji-goggles-integra",
      "https://www.adorama.com/djiintegra.html",
    ],
  },
  // DJI Mic Mini
  "dji-mic-mini": {
    titular: "Micrófono inalámbrico de 10 g que se conecta directo a tu cámara DJI",
    cuerpo:
      "El DJI Mic Mini es un micrófono inalámbrico tan chico que casi no se ve en cámara: cada transmisor pesa unos 10 g sin el clip magnético. Llega hasta 400 m en campo abierto y rinde unas 11,5 horas por carga; con el estuche cargador, el conjunto suma hasta 48 horas. Tiene cancelación de ruido en dos niveles, básico para interiores y fuerte para la calle, y limitador automático que evita que el audio sature. Se conecta sin receptor a la Osmo Pocket 3, Action 5 Pro y Action 4, y por Bluetooth directo al celular. Ideal para entrevistas, vlogs y clases grabadas.",
    destacados: [
      "Transmisor de unos 10 g sin el clip magnético",
      "Hasta 400 m de alcance y 11,5 horas por carga",
      "Hasta 48 horas de uso con el estuche cargador",
      "Cancelación de ruido en dos niveles y limitador automático",
    ],
    fuentes: [
      "https://www.dji.com/mic-mini/specs",
      "https://www.dji.com/mic-mini/faq",
      "https://www.dji.com/media-center/announcements/dji-release-mic-mini-en",
    ],
  },
  // DJI Neo 2 Fly More Combo
  "dji-neo-2-fly-more-combo": {
    titular: "Dron de 151 g que despega de la palma y te sigue solo",
    cuerpo:
      "El Neo 2 es el dron más compacto de DJI: pesa 151 g, trae protectores de hélices y despega y aterriza en la palma de tu mano. Te sigue con ActiveTrack sin necesidad de control, responde a gestos y detecta obstáculos en todas las direcciones, con un LiDAR frontal. Su cámara con sensor de 1/2 pulgada graba en 4K a 60 cuadros y en vertical 2,7K para redes; guarda todo en 49 GB de memoria interna. Vuela unos 19 minutos por batería y resiste viento de nivel 5. El Fly More Combo suma el control RC-N3, tres baterías y un hub de carga para tres a la vez.",
    destacados: [
      "151 g, con protectores de hélices y despegue desde la palma",
      "Detección de obstáculos omnidireccional con LiDAR frontal",
      "Video 4K a 60 cuadros y 49 GB de memoria interna",
      "Combo con control RC-N3, tres baterías y hub de carga",
    ],
    fuentes: [
      "https://www.dji.com/neo-2/specs",
      "https://www.dji.com/neo-2",
      "https://store.dji.com/si/product/dji-neo-2-fly-more-combo-refurbished-unit?set_region=SI&from=site-nav",
    ],
  },
  // DJI Osmo Action 6 Standard Combo
  "dji-osmo-action-6-standard-combo": {
    titular: "La primera cámara de acción de DJI con apertura variable f/2.0 a f/4.0",
    cuerpo:
      "La Osmo Action 6 estrena la apertura variable, de f/2.0 a f/4.0: abierta junta más luz al atardecer y cerrada controla la luz a pleno sol. El sensor cuadrado de 1/1,1 pulgadas graba hasta 8K a 30 cuadros y 4K a 120, con estabilización RockSteady 3.0 y HorizonSteady. Se sumerge a 20 metros sin carcasa, funciona hasta -20 °C y su batería de 1950 mAh rinde hasta 240 minutos en condiciones de prueba. Trae pantallas delantera y trasera. El Standard Combo trae batería Extreme Plus, soporte de liberación rápida, base adhesiva curva y cable USB-C.",
    destacados: [
      'Apertura variable f/2.0 a f/4.0 y sensor cuadrado de 1/1,1"',
      "Video hasta 8K a 30 cuadros y 4K a 120",
      "Sumergible a 20 m sin carcasa y apta hasta -20 °C",
      "Batería de 1950 mAh con hasta 240 minutos de grabación",
    ],
    fuentes: [
      "https://www.dji.com/osmo-action-6/specs",
      "https://www.dji.com/media-center/announcements/dji-release-osmo-action-6",
      "https://store.dji.com/nl/product/osmo-action-6",
    ],
  },
  // DJI Osmo Nano
  "dji-osmo-nano": {
    titular: "Cámara de acción de unos 52 g que se pega con imán donde quieras",
    cuerpo:
      "La Osmo Nano es la cámara de acción más chica de DJI: el módulo de cámara pesa unos 52 g y se sujeta con imán a la ropa, la gorra o el casco, así grabás en primera persona sin cargar nada. Tiene un sensor de 1/1,3 pulgadas, graba en 4K a 60 cuadros, cámara lenta en 4K a 120 y color en 10 bits D-Log M para editar. La cámara se sumerge hasta 10 metros sin carcasa. Al encastrarla en la base Vision Dock, que tiene pantalla OLED de 2 pulgadas y ranura microSD, la recargás y encuadrás mejor. Ideal para viajes, ciclismo y vlogs.",
    destacados: [
      "Módulo de cámara de unos 52 g con montaje magnético",
      'Sensor de 1/1,3", 4K a 60 cuadros y cámara lenta 4K a 120',
      "Sumergible hasta 10 m sin carcasa (la base no es sumergible)",
      'Base Vision Dock con pantalla OLED de 2" y ranura microSD',
    ],
    fuentes: [
      "https://www.dji.com/my/support/product/nano",
      "https://www.newsshooter.com/2025/09/23/dji-osmo-nano/",
      "https://www.heliguy.com/blogs/posts/dji-osmo-nano-ultra-light-wearable-camera-for-every-adventure/",
    ],
  },
  // DJI Osmo Pocket 4 Creator Combo
  "dji-osmo-pocket-4-creator-combo": {
    titular: 'Cámara con gimbal de bolsillo, sensor de 1" y micrófono DJI Mic 3 incluido',
    cuerpo:
      'La Osmo Pocket 4 es una cámara con estabilizador de 3 ejes que entra en el bolsillo: pesa 190,5 g y tiene sensor de 1 pulgada con apertura f/2.0. Graba en 4K a 60 cuadros, cámara lenta en 4K a 240, en 10 bits D-Log y con 14 pasos de rango dinámico. Trae 107 GB de memoria interna y su batería de 1545 mAh carga al 80% en 18 minutos con un cargador rápido. El Creator Combo suma un transmisor DJI Mic 3, luz de relleno, lente gran angular, mango con rosca de 1/4", minitrípode y bolso.',
    destacados: [
      'Sensor de 1" con estabilización mecánica de 3 ejes',
      "4K a 60 cuadros y cámara lenta 4K a 240 en 10 bits",
      '107 GB de memoria interna y pantalla táctil giratoria de 2"',
      "Incluye transmisor DJI Mic 3, luz de relleno y lente gran angular",
    ],
    fuentes: [
      "https://www.dji.com/osmo-pocket-4/specs",
      "https://store.dji.com/au/product/osmo-pocket-4-creator-combo?set_region=AU",
    ],
  },
  // DJI Osmo Pocket 4P Standard Combo
  "dji-osmo-pocket-4p-standard-combo": {
    titular: 'Pocket con dos cámaras: gran angular de 1" y tele de 60 mm',
    cuerpo:
      'La Osmo Pocket 4P es la versión con dos cámaras de la Pocket 4: un gran angular de 20 mm f/2.0 con sensor de 1 pulgada y un medio tele de 60 mm f/1.8 con sensor de 1/1,28 pulgadas, para retratos y planos cerrados. Graba hasta 4K a 240 cuadros con el gran angular y 4K a 200 con el tele, con hasta 17 pasos de rango dinámico en D-Log 2. Trae 103 GB de memoria, pantalla OLED de 2 pulgadas y 210 minutos de autonomía; pesa 230 g. El Standard Combo incluye luz de relleno, mango con rosca de 1/4", correa de muñeca, funda y cable USB-C.',
    destacados: [
      'Dos cámaras: gran angular de 1" (20 mm) y medio tele de 60 mm f/1.8',
      "Hasta 4K a 240 cuadros y 17 pasos de rango dinámico",
      '103 GB de memoria interna y pantalla OLED de 2"',
      "Hasta 210 minutos de autonomía; 80% de carga en 18 minutos",
    ],
    fuentes: [
      "https://store.dji.com/uk/product/osmo-pocket-4p?set_region=GB",
      "https://dronexl.co/2026/06/15/dji-osmo-pocket-4p-specs-dual-camera-us-ban/",
      "https://camerajabber.com/photography-news/dji-osmo-pocket-4p-price-specifications-and-availability-announced/",
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
  // Fujifilm instax WIDE film, Twin Pack (20 fotos)
  "fujifilm-instax-film-wide-x20": {
    titular: "Película instantánea instax WIDE: 20 fotos de 99 × 62 mm",
    cuerpo:
      "Este pack doble trae película instax WIDE para 20 fotos: no es una cámara, es el repuesto para las cámaras e impresoras de formato WIDE de Fujifilm. Cada foto mide 86 × 108 mm con el marco blanco, y la imagen ocupa 99 × 62 mm, el doble de ancho que una instax mini: entran grupos y paisajes sin apretarse. La foto sale de la cámara y se revela sola en unos 90 segundos. Funciona con las cámaras instax WIDE 300, WIDE 400 y WIDE Evo, y con la impresora instax Link WIDE, que imprime las fotos del celular. Rinde mejor entre 5 °C y 40 °C.",
    destacados: [
      "20 fotos (dos cartuchos de 10)",
      "Imagen de 99 × 62 mm en una foto de 86 × 108 mm",
      "Se revela sola en unos 90 segundos",
      "Para instax WIDE 300, WIDE 400, WIDE Evo y la impresora Link WIDE",
    ],
    fuentes: [
      "https://www.instaxus.com/film/wide-white-film/",
      "https://www.fujifilm.com/us/en/consumer/instax/cameras/wide400/specifications",
      "https://www.fujifilm.com/sg/en/consumer/instax/cameras/wide_evo/films",
      "https://fujifilm.com/sg/en/consumer/instax/cameras/wide300/films",
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
  // Google Pixel 10 Pro
  "google-pixel-10-pro": {
    titular: "Teleobjetivo 5× de 48 MP y siete años de actualizaciones",
    cuerpo:
      "El Pixel 10 Pro lleva el chip Google Tensor G5 y 16 GB de RAM en un tamaño de 6,3 pulgadas, con pantalla Super Actua LTPO que va de 1 a 120 Hz y llega a 3300 nits. Atrás tiene tres cámaras: principal de 50 MP, ultra gran angular de 48 MP y teleobjetivo de 48 MP con zoom óptico 5×, que con Pro Zoom llega hasta 100×. La frontal es de 42 MP. Google le asegura siete años de actualizaciones de sistema y seguridad, y tiene certificación IP68. Es para quien quiere un Android de tamaño manejable, con cámara completa y actualizaciones por muchos años.",
    destacados: [
      "Chip Google Tensor G5 con 16 GB de RAM",
      "Teleobjetivo de 48 MP con zoom óptico 5×",
      "Pantalla Super Actua de 6,3 pulgadas, de 1 a 120 Hz",
      "7 años de actualizaciones de sistema y seguridad",
    ],
    fuentes: ["https://support.google.com/pixelphone/answer/7158570?hl=en"],
  },
  // Google Pixel 10 Pro XL
  "google-pixel-10-pro-xl": {
    titular: "Pantalla de 6,8 pulgadas y carga inalámbrica Qi2 de hasta 25 W",
    cuerpo:
      "Es la versión grande del Pixel 10 Pro: mismo chip Google Tensor G5, 16 GB de RAM y las mismas cámaras, con pantalla Super Actua LTPO de 6,8 pulgadas que va de 1 a 120 Hz. La diferencia está en la batería y la carga: 5200 mAh, contra 4870 del Pro, carga con cable aprovechando cargadores de 45 W y carga inalámbrica Qi2 de hasta 25 W. Atrás tiene principal de 50 MP, ultra gran angular de 48 MP y teleobjetivo de 48 MP con zoom óptico 5×. Suma certificación IP68 y siete años de actualizaciones. Conviene a quien quiere más pantalla y más batería.",
    destacados: [
      "Pantalla Super Actua de 6,8 pulgadas, de 1 a 120 Hz",
      "Batería de 5200 mAh y carga inalámbrica Qi2 de hasta 25 W",
      "Teleobjetivo de 48 MP con zoom óptico 5×",
      "7 años de actualizaciones de sistema y seguridad",
    ],
    fuentes: ["https://support.google.com/pixelphone/answer/7158570?hl=en"],
  },
  // Insta360 Ace Pro 2
  "insta360-ace-pro-2-8k": {
    titular: 'Cámara de acción 8K con lente Leica y pantalla rebatible de 2,5"',
    cuerpo:
      "La Ace Pro 2 es la cámara de acción insignia de Insta360: sensor de 1/1,3 pulgadas, lente Leica SUMMARIT y video hasta 8K a 30 cuadros, con 4K a 60 en Active HDR y cámara lenta en 4K a 120. Usa dos chips, uno de imagen y otro de IA de 5 nm, para limpiar el ruido en escenas con poca luz. La pantalla táctil de 2,5 pulgadas se rebate hacia adelante. Se sumerge a 12 metros sin carcasa y su batería de 1800 mAh rinde unos 180 minutos en modo Endurance. Trae protector antiviento.",
    destacados: [
      "Video hasta 8K a 30 cuadros y 4K a 60 con Active HDR",
      'Sensor de 1/1,3" con lente Leica SUMMARIT',
      'Pantalla táctil rebatible de 2,5"',
      "Sumergible a 12 m sin carcasa; batería de 1800 mAh",
    ],
    fuentes: [
      "https://www.insta360.com/product/insta360-ace-pro2",
      "https://onlinemanual.insta360.com/acepro2/en-us/specs/hardware",
      "https://www.insta360.com/blog/news/insta360-ace-pro-2-announcement-ai-action-camera.html",
    ],
  },
  // Insta360 Luna Ultra
  "insta360-luna-ultra-8k": {
    titular: "Cámara con gimbal y dos lentes Leica, con pantalla que se desprende",
    cuerpo:
      "La Luna Ultra es la primera cámara de bolsillo con gimbal de Insta360, pensada para competir con la Osmo Pocket. Tiene dos cámaras con lentes Leica Summicron: una principal de 1 pulgada (20 mm f/1,8) y un tele de 1/1,3 pulgadas (60 mm f/2,0) para retratos y planos cerrados. Graba hasta 8K a 30 cuadros con Dolby Vision y cámara lenta en 4K a 120, estabilizada por un gimbal de 3 ejes. Su pantalla OLED de 2 pulgadas se desprende y funciona como monitor y control remoto inalámbrico. Trae 47 GB internos y ranura microSD, y rinde hasta 240 minutos en condiciones de prueba.",
    destacados: [
      'Dos cámaras Leica Summicron: 1" (20 mm) y tele 1/1,3" (60 mm)',
      "Video hasta 8K a 30 cuadros y cámara lenta 4K a 120",
      'Pantalla OLED de 2" desmontable que funciona como control remoto',
      "Gimbal de 3 ejes, 47 GB internos y ranura microSD",
    ],
    fuentes: [
      "https://onlinemanual.insta360.com/lunaultra/en-us/specs/specs",
      "https://technode.com/2026/06/11/insta360-launches-first-handheld-gimbal-camera-luna-ultra-with-8k-recording-and-leica-dual-lens-system/",
      "https://www.cined.com/insta360-luna-ultra-launched-dual-lens-8k-leica-summicron-optics-detachable-oled-screen/",
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
  // JBL Tune Flex
  "jbl-tune-flex-wireless-nc": {
    titular: "Auriculares con cancelación de ruido que usás abiertos o sellados",
    cuerpo:
      "Los Tune Flex son auriculares inalámbricos de JBL con diseño de palito que se adaptan a cómo te gusta usarlos: con la almohadilla abierta, livianos y sin presión en el oído, o con las almohadillas de sellado (vienen en tres tamaños) para aislar más. Tienen cancelación activa de ruido, modo Ambient Aware para escuchar el entorno y TalkThru para charlar sin sacártelos. Con drivers de 12 mm, rinden 8 horas sin cancelación y 6 con ella, hasta 32 horas en total con el estuche; 10 minutos de carga dan 2 horas. Cuatro micrófonos para llamadas y resistencia IPX4 al sudor.",
    destacados: [
      "Cancelación activa de ruido, Ambient Aware y TalkThru",
      "Almohadilla abierta y almohadillas de sellado en tres tamaños",
      "Hasta 32 horas con el estuche; 10 minutos de carga dan 2 horas",
      "Drivers de 12 mm, 4 micrófonos y resistencia IPX4",
    ],
    fuentes: [
      "https://th.jbl.com/en/in-ear-headphones/TUNE-FLEX.html",
      "https://ar.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw365279b5/pdfs/JBL_Tune Flex_Spec Sheet_EN.pdf",
    ],
  },
  // Control inalámbrico DualSense para PS5
  "joystick-playstation-5-dualsense": {
    titular: "Respuesta háptica y gatillos adaptativos que cambian según el juego",
    cuerpo:
      "Es el control oficial de PlayStation 5. En lugar de los motores de vibración de siempre usa actuadores dobles, que reproducen sensaciones distintas según lo que pasa en pantalla, y sus gatillos adaptativos cambian la resistencia, por ejemplo al tensar un arco o frenar un auto, en los juegos que lo aprovechan. Tiene micrófono incorporado con botón para silenciarlo, conector de 3,5 mm para auriculares y botón Create para capturar y compartir partidas. Se conecta a la PS5 sin cable o por USB-C, y también funciona con PC, Mac y celulares por Bluetooth o cable.",
    destacados: [
      "Respuesta háptica con actuadores dobles",
      "Gatillos adaptativos en juegos compatibles",
      "Micrófono incorporado, botón de silencio y jack de 3,5 mm",
      "Conexión por USB-C o Bluetooth con PS5, PC, Mac y celulares",
    ],
    fuentes: [
      "https://www.playstation.com/es-ar/accessories/dualsense-wireless-controller/",
      "https://www.tomshardware.com/news/ps5-dualsense-controller-revealed-with-built-in-mics-create-button",
      "https://www.gamespot.com/articles/ps5-dualsense-controller-still-includes-headset-ja/1100-6475792",
    ],
  },
  // Control inalámbrico DualSense para PS5 (revisión CFI-ZCT2)
  "joystick-playstation-5-dualsense-v2": {
    titular: "Respuesta háptica y gatillos adaptativos que cambian según el juego",
    cuerpo:
      "Es el control oficial de PlayStation 5. En lugar de los motores de vibración de siempre usa actuadores dobles, que reproducen sensaciones distintas según lo que pasa en pantalla, y sus gatillos adaptativos cambian la resistencia, por ejemplo al tensar un arco o frenar un auto, en los juegos que lo aprovechan. Tiene micrófono incorporado con botón para silenciarlo, conector de 3,5 mm para auriculares y botón Create para capturar y compartir partidas. Se conecta a la PS5 sin cable o por USB-C, y también funciona con PC, Mac y celulares por Bluetooth o cable.",
    destacados: [
      "Respuesta háptica con actuadores dobles",
      "Gatillos adaptativos en juegos compatibles",
      "Micrófono incorporado, botón de silencio y jack de 3,5 mm",
      "Conexión por USB-C o Bluetooth con PS5, PC, Mac y celulares",
    ],
    fuentes: [
      "https://www.playstation.com/es-ar/accessories/dualsense-wireless-controller/",
      "https://www.psu.com/news/dualsense-cfi-zct2w-revision-reportedly-improves-battery-life-is-packaged-with-new-ps5-slim-cfi-2116/",
      "https://www.tomshardware.com/news/ps5-dualsense-controller-revealed-with-built-in-mics-create-button",
    ],
  },
  // Kieslect AI Earbuds Adjustable
  "kieslect-adjustable-earbuds": {
    titular: "Auriculares que usás dentro del oído o semiabiertos, con traducción IA",
    cuerpo:
      "Los Adjustable Earbuds de Kieslect se adaptan a cómo te gusta escuchar: con las almohadillas de silicona puestas quedan dentro del oído y activan la cancelación activa de ruido; sin ellas, quedan semiabiertos y más livianos. Usan drivers de 13 mm y Bluetooth 6.0. Desde la app ofrecen traducción en 164 idiomas, conversación con ChatGPT y grabación de reuniones con IA. Cada auricular pesa 4,3 g y rinde 7 horas, hasta 23 horas con el estuche, y 10 minutos de carga rápida dan 2 horas de música. Resisten salpicaduras y sudor con IPX4.",
    destacados: [
      "Dos modos: dentro del oído con cancelación de ruido o semiabiertos",
      "Traducción en 164 idiomas y ChatGPT desde la app",
      "7 horas por carga y hasta 23 horas con el estuche",
      "Drivers de 13 mm, Bluetooth 6.0 y resistencia IPX4",
    ],
    fuentes: [
      "https://us.kieslect.com/products/kieslect-adjustable-earbuds",
      "https://www.kieslect.com/product/kieslect-adjustable-earbuds/",
    ],
  },
  // Kieslect AI Smartwatch Elite2
  "kieslect-ai-watch-elite-2": {
    titular: "Reloj con asistente ChatGPT, GPS de doble banda y hasta 14 días",
    cuerpo:
      "El Elite2 es el reloj más completo de Kieslect: trae un asistente basado en ChatGPT al que le hablás en 25 idiomas para consultas o para agendar recordatorios. La pantalla AMOLED LTPO de 1,46 pulgadas ajusta el brillo sola y tiene modo siempre encendida, con bisel de cerámica y marco de aluminio. Su GPS de doble banda funciona sin el teléfono y te guía con rutas. Mide frecuencia cardíaca, oxígeno en sangre, variabilidad cardíaca, estrés y respiración, atiende llamadas y tiene función SOS. La batería de 510 mAh rinde unos 14 días de uso típico y resiste el agua hasta 5 ATM.",
    destacados: [
      "Asistente de voz con ChatGPT en 25 idiomas",
      'Pantalla AMOLED LTPO de 1,46" con modo siempre encendida',
      "GPS de doble banda independiente del teléfono",
      "Batería de 510 mAh: unos 14 días de uso típico, 5 ATM",
    ],
    fuentes: ["https://www.kieslect.com/product/kieslect-ai-smartwatch-elite2/"],
  },
  // Kieslect Kr Ultra 3
  "kieslect-calling-watch-kr-ultra-3": {
    titular: 'Reloj con llamadas, GPS de doble banda y AMOLED de 1,5"',
    cuerpo:
      "El Kr Ultra 3 es un reloj inteligente de Kieslect con parlante y micrófono para atender llamadas desde la muñeca por Bluetooth 5.3. Su pantalla AMOLED de 1,5 pulgadas tiene 466 × 466 de resolución, 1000 nits y modo siempre encendida, en una caja de 46,7 mm con bisel y botón de acero inoxidable que pesa 40 g. El GPS de doble banda se suma a más de 178 modos deportivos y medición de frecuencia cardíaca, oxígeno en sangre, sueño y estrés. Con la función AI Dial creás esferas con texto o voz. La batería de 500 mAh rinde hasta 13 días de uso típico.",
    destacados: [
      "Llamadas por Bluetooth 5.3 con parlante y micrófono",
      'Pantalla AMOLED de 1,5" a 466 × 466 y 1000 nits',
      "GPS de doble banda y más de 178 modos deportivos",
      "Batería de 500 mAh: hasta 13 días de uso típico",
    ],
    fuentes: [
      "https://us.kieslect.com/products/kieslect-kr-ultra-3-smartwatch",
      "https://www.applegadgetsbd.com/product/kieslect-kr-ultra-3-smart-watch",
      "https://www.kieslect.com/kieslect-calling-watch-kr3-with-gps-fashion-smart-watch/",
    ],
  },
  // Kieslect Calling Watch Kr3
  "kieslect-calling-watch-kr3": {
    titular: 'Reloj con llamadas, GPS integrado y pantalla AMOLED de 1,5"',
    cuerpo:
      "El Kr3 es un reloj inteligente de Kieslect con parlante y micrófono: atendés y hacés llamadas desde la muñeca por Bluetooth 5.3, con el teléfono en el bolsillo. La pantalla AMOLED de 1,5 pulgadas tiene 466 × 466 de resolución, 1000 nits y modo siempre encendida. Trae GPS propio para registrar tus recorridos, más de 178 modos deportivos y medición de frecuencia cardíaca, oxígeno en sangre, sueño y estrés. Su batería de 500 mAh rinde unos 13 días de uso típico y resiste el agua hasta 5 ATM. Funciona con iPhone (iOS 15 o posterior) y Android 8.0 o posterior.",
    destacados: [
      "Llamadas por Bluetooth 5.3 con parlante y micrófono",
      'Pantalla AMOLED de 1,5" a 466 × 466 y 1000 nits',
      "GPS integrado y más de 178 modos deportivos",
      "Batería de 500 mAh: unos 13 días de uso típico",
    ],
    fuentes: [
      "https://www.kieslect.com/kieslect-calling-watch-kr3-with-gps-fashion-smart-watch/",
    ],
  },
  // Kieslect Elfin
  "kieslect-lady-watch-elfin": {
    titular: "Reloj para mujer de 6,7 mm de espesor con llamadas y AMOLED",
    cuerpo:
      "El Elfin es el reloj de la línea Lady de Kieslect, pensado para muñecas chicas: mide 6,7 mm de espesor y el cuerpo de aleación de zinc y aluminio pesa 28,1 g sin la malla. Su pantalla AMOLED de 1,32 pulgadas tiene 466 × 466 de resolución, 850 nits y modo siempre encendida. Atiende llamadas por Bluetooth 5.3 y mide frecuencia cardíaca, oxígeno en sangre, sueño y estrés, además de seguir el ciclo menstrual con recordatorios. Tiene 178 modos deportivos y la batería rinde hasta 10 días de uso típico. Resiste el agua hasta 2 ATM.",
    destacados: [
      "Cuerpo de 6,7 mm de espesor y 28,1 g sin malla",
      'Pantalla AMOLED de 1,32" a 466 × 466',
      "Llamadas por Bluetooth 5.3 y seguimiento del ciclo menstrual",
      "Hasta 10 días de batería en uso típico",
    ],
    fuentes: [
      "https://www.kieslect.com/product/kieslect-elfin-worlds-thinnest-womens-smartwatch/",
    ],
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
  // motorola edge 60 fusion
  "motorola-edge-60-fusion": {
    titular: "Pantalla curva en los cuatro bordes y resistencia IP68/IP69",
    cuerpo:
      "El edge 60 fusion tiene una pantalla pOLED de 6,67 pulgadas curva en los cuatro lados, con resolución 1.5K, 120 Hz y hasta 4500 nits de pico en HDR, protegida por Gorilla Glass 7i. La cámara principal de 50 MP usa un sensor Sony LYTIA 700C con estabilización óptica, acompañada por un ultra gran angular de 13 MP con modo macro; la frontal es de 32 MP. Resiste agua y polvo con IP68 e IP69 y cumple la norma militar MIL-STD-810H. Trae 256 GB ampliables con microSD de hasta 1 TB y carga a 68 W con TurboPower. Es para quien quiere diseño y resistencia en la gama media.",
    destacados: [
      "Pantalla pOLED curva de 6,67 pulgadas a 120 Hz",
      "Cámara de 50 MP con sensor Sony LYTIA 700C y estabilización óptica",
      "Resistencia IP68/IP69 y norma militar MIL-STD-810H",
      "Memoria ampliable con microSD de hasta 1 TB",
    ],
    fuentes: [
      "https://es-ar.support.motorola.com/app/answers/detail/a_id/187360/~/specifications---motorola-edge-60-fusion",
      "https://www.geektopia.es/es/technology/2025/04/02/noticias/motorola-anuncia-el-edge-60-fusion.html",
      "https://www.xataka.com/moviles/motorola-edge-60-fusion-caracteristicas-precio-ficha-tecnica",
    ],
  },
  // motorola edge 70 fusion
  "motorola-edge-70-fusion": {
    titular: "Pantalla AMOLED de 6,78 pulgadas a 144 Hz y certificación IP69",
    cuerpo:
      "El edge 70 fusion combina una pantalla Extreme AMOLED de 6,78 pulgadas, con resolución Super HD, hasta 144 Hz y 5200 nits de brillo máximo, con un procesador Snapdragon 7s Gen 3. La cámara principal de 50 MP usa un sensor Sony LYTIA 710 con estabilización óptica, y se complementa con un ultra gran angular de 13 MP que también hace macro; la frontal es de 32 MP. Resiste agua y polvo con IP68 e IP69 y cumple la norma militar MIL-STD-810H. Carga a 68 W con TurboPower y tiene parlantes estéreo con Dolby Atmos. Es para quien quiere buena pantalla y un equipo resistente.",
    destacados: [
      "Pantalla Extreme AMOLED de 6,78 pulgadas a 144 Hz",
      "Cámara de 50 MP con sensor Sony LYTIA 710 y estabilización óptica",
      "Resistencia IP68/IP69 y norma militar MIL-STD-810H",
      "Carga TurboPower de 68 W",
    ],
    fuentes: [
      "https://es-ar.support.motorola.com/app/answers/detail/a_id/191408/~/especificaciones---motorola-edge-70-fusion",
      "https://www.yankodesign.com/?p=611891",
    ],
  },
  // moto g17
  "motorola-moto-g17-dual-sim": {
    titular: "Batería de 5200 mAh y cámara Sony LYTIA de 50 MP, con IP64",
    cuerpo:
      "El moto g17 es un celular de entrada pensado para aguantar el día: batería de 5200 mAh con carga TurboPower de 18 W y procesador MediaTek Helio G81 Extreme. La pantalla LCD de 6,72 pulgadas tiene resolución Full HD+ y protección Gorilla Glass 3. Atrás lleva una cámara principal de 50 MP con sensor Sony LYTIA 600 y un ultra gran angular de 5 MP; la frontal es de 32 MP. Tiene parlantes estéreo con Dolby Atmos, entrada de auriculares de 3,5 mm, microSD de hasta 1 TB y protección IP64 contra polvo y salpicaduras. Es para quien busca un teléfono simple, con buena autonomía.",
    destacados: [
      "Batería de 5200 mAh con carga TurboPower de 18 W",
      "Cámara de 50 MP con sensor Sony LYTIA 600",
      "Parlantes estéreo con Dolby Atmos y entrada de auriculares",
      "Protección IP64 y Gorilla Glass 3",
    ],
    fuentes: [
      "https://en-us.support.motorola.com/app/answers/detail/a_id/191003/~/specifications---moto-g17/g17-power",
      "https://www.motorola.com/gb/en/p/phones/moto-g/17/pmipmjn44mj?pn=PBBK0005GB",
    ],
  },
  // moto g67
  "motorola-moto-g67-dual-sim": {
    titular: "Pantalla AMOLED a 120 Hz, 5G y norma militar MIL-STD-810H",
    cuerpo:
      "El moto g67 pone en la gama media una pantalla Extreme AMOLED de 6,78 pulgadas a 120 Hz, con hasta 5000 nits de pico y protección Gorilla Glass 7i. Funciona con un MediaTek Dimensity 6300 con 5G. La cámara principal de 50 MP usa un sensor Sony LYTIA 600, con un ultra gran angular de 8 MP y una frontal de 32 MP. La batería de 5200 mAh carga a 30 W. Cumple la norma militar MIL-STD-810H, tiene protección IP64, parlantes estéreo con Dolby Atmos y NFC, en un cuerpo de 7,33 mm. Es para quien quiere buena pantalla y un teléfono resistente para el día a día.",
    destacados: [
      "Pantalla Extreme AMOLED de 6,78 pulgadas a 120 Hz",
      "Cámara de 50 MP con sensor Sony LYTIA 600",
      "Batería de 5200 mAh con carga de 30 W",
      "Norma militar MIL-STD-810H y protección IP64",
    ],
    fuentes: [
      "https://en-us.support.motorola.com/app/answers/detail/a_id/191005/~/specifications---moto-g67-/-67-power",
      "https://global.techradar.com/es-mx/phones/motorola-expande-su-familia-g-con-los-nuevos-moto-g67-moto-g17-y-moto-g17-power",
      "https://www.ldlc.com/es-es/ficha/PB00731041.html",
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
  // Nintendo Switch – Modelo OLED (Joy-Con rojo neón y azul neón)
  "nintendo-switch-oled-neon": {
    titular: "Pantalla OLED de 7 pulgadas y dock con puerto LAN para la tele",
    cuerpo:
      "Es la versión de Nintendo Switch con pantalla OLED táctil de 7 pulgadas, más grande que la de 6,2 del modelo original y con bordes más finos. Se juega de tres maneras: en la tele con el dock, con salida de hasta 1080p; sobre la mesa, con el soporte ancho y regulable; o en la mano, con los Joy-Con puestos. El dock suma un puerto LAN para jugar online por cable con una conexión más estable, además de dos USB y la salida HDMI. Trae 64 GB internos que se amplían con microSD, y la batería rinde entre 4,5 y 9 horas según el juego.",
    destacados: [
      "Pantalla OLED táctil de 7 pulgadas",
      "Modo TV hasta 1080p, modo mesa y modo portátil",
      "Dock con puerto LAN, dos USB y salida HDMI",
      "64 GB ampliables con microSD y 4,5 a 9 h de batería",
    ],
    fuentes: [
      "https://www.nintendo.com/en-gb/Nintendo-Switch-Family/Nintendo-Switch-OLED-Model/Nintendo-Switch-OLED-Model-2000984.html",
      "https://gamespot.com/articles/nintendo-switch-oled-announced-coming-october-8/1100-6493578/",
    ],
  },
  // Oakley Meta Vanguard
  "oakley-meta-vanguard": {
    titular: "Anteojos deportivos con cámara 3K, Meta AI y resistencia IP67",
    cuerpo:
      "Los Oakley Meta Vanguard son anteojos de sol deportivos con cámara y audio integrados, pensados para correr y andar en bici. La cámara de 12 MP va centrada sobre la nariz, con 122° de campo visual, y graba en 3K con estabilización ajustable, cámara lenta e hiperlapso: filmás tu salida sin cargar una cámara de acción. Tienen parlantes abiertos que no tapan el oído, cinco micrófonos y un botón para pedirle cosas a Meta AI. Se vinculan con relojes Garmin para dictarte ritmo y pulso, y con Strava para sumar tus datos al video. Resisten polvo y agua con IP67 y rinden hasta 9 horas, más 36 con el estuche.",
    destacados: [
      "Cámara centrada de 12 MP con video 3K y 122° de campo visual",
      "Resistencia IP67 al polvo y al agua",
      "Hasta 9 horas de uso mixto y 36 horas extra con el estuche",
      "Integración con Garmin y Strava, y asistente Meta AI",
    ],
    fuentes: [
      "https://www.meta.com/ai-glasses/cycling/",
      "https://www.engadget.com/wearables/oakley-meta-vanguard-are-the-smart-glasses-athletes-might-actually-want-001511094.html",
      "https://www.currys.co.uk/products/oakley-meta-vanguard-glasses-black-with-prizm-24k-lenses-10292612.html",
    ],
  },
  // PlayStation 5 (modelo slim con unidad de disco, 1 TB)
  "playstation-5-slim-con-lectora": {
    titular: "PS5 con lectora: juegos en disco o digitales, y 1 TB de SSD",
    cuerpo:
      "Es la PlayStation 5 en su versión slim con unidad de disco, así que podés comprar juegos físicos de PS5 y PS4 o descargarlos desde PlayStation Store. Trae 1 TB en un SSD de alta velocidad, ray tracing en los juegos compatibles para sombras y reflejos más realistas, y salida 4K con HDR en un televisor que lo admita. El control DualSense suma respuesta háptica y gatillos adaptativos, y el audio 3D Tempest se escucha por los parlantes de la tele o con auriculares. Es retrocompatible con juegos de PS4, y con Game Boost algunos corren más fluidos o a más cuadros por segundo.",
    destacados: [
      "Unidad de disco para juegos físicos de PS5 y PS4",
      "SSD de alta velocidad de 1 TB",
      "Ray tracing y salida 4K con HDR en juegos y TV compatibles",
      "Audio 3D Tempest por la tele o con auriculares",
    ],
    fuentes: ["https://www.playstation.com/es-ar/ps5/"],
  },
  // PlayStation 5 Digital Edition (modelo slim, 825 GB)
  "playstation-5-slim-digital": {
    titular: "La PS5 sin lectora, para quien ya compra sus juegos en digital",
    cuerpo:
      "Es la PlayStation 5 en su versión slim y sin unidad de disco: los juegos se compran y descargan desde PlayStation Store. Tiene un SSD de alta velocidad de 825 GB que acorta las cargas, ray tracing en los juegos compatibles para sombras y reflejos más realistas, y salida 4K con HDR en un televisor que lo admita. Con el control DualSense sentís la respuesta háptica y los gatillos adaptativos, y el audio 3D Tempest se escucha por los parlantes de la tele o con auriculares. Corre también juegos de PS4. Si más adelante querés usar discos, le podés agregar la lectora desmontable, que se vende aparte.",
    destacados: [
      "SSD de alta velocidad de 825 GB",
      "Ray tracing y salida 4K con HDR en juegos y TV compatibles",
      "Retrocompatible con juegos de PS4",
      "Acepta la lectora de discos desmontable, que se vende aparte",
    ],
    fuentes: [
      "https://www.playstation.com/es-ar/ps5/",
      "https://www.tomshardware.com/video-games/playstation/playstation-5-digital-edition-with-1tb-ssd-downgraded-to-825gb-listed-at-the-same-price-cfi-2116-revision-emerges-overseas-on-amazon",
    ],
  },
  // REDMI Pad 2
  "redmi-pad-2-11": {
    titular: "Pantalla de 11 pulgadas en 2560 × 1600 y batería de 9000 mAh",
    cuerpo:
      "La REDMI Pad 2 es una tablet de 11 pulgadas con pantalla de 2560 × 1600 píxeles, la resolución que se suele llamar 2.5K, y una frecuencia de hasta 90 Hz, así que textos, series y videos se ven nítidos y fluidos. La mueve un MediaTek Helio G100-Ultra y viene con Xiaomi HyperOS 2. La batería de 9000 mAh carga a 18 W por USB-C. Tiene ranura para microSD de hasta 2 TB, para sumar espacio para películas o apuntes, cámara trasera de 8 MP y frontal de 5 MP para videollamadas. Es para mirar contenido, leer, estudiar o tener una tablet familiar en casa.",
    destacados: [
      "Pantalla de 11 pulgadas, 2560 × 1600 a hasta 90 Hz",
      "Batería de 9000 mAh con carga de 18 W por USB-C",
      "Procesador MediaTek Helio G100-Ultra",
      "Ranura microSD de hasta 2 TB",
    ],
    fuentes: [
      "https://www.mi.com/latin-es/product/redmi-pad-2/specs/",
      "https://www.mi.com/africa-en/product/redmi-pad-2/specs/",
    ],
  },
  // Samsung 24" Essential Monitor S3 S30GD Full HD 100 Hz (LS24D300GALXZB)
  "samsung-essential-monitor-24-100hz": {
    titular: "Monitor IPS de 24 pulgadas Full HD con hasta 100 Hz",
    cuerpo:
      "Es un monitor de 24 pulgadas con panel IPS y resolución Full HD (1920 × 1080), para trabajar, estudiar o ver series. El panel IPS mantiene los colores parejos aunque lo mires de costado, con ángulos de visión de 178°. La frecuencia sube hasta 100 Hz: viene en 60 Hz y se cambia desde el menú del monitor, y con eso el cursor y el desplazamiento se ven más suaves. Se conecta por HDMI o VGA, así que sirve también para una PC vieja. Trae Eye Saver Mode y Flicker Free para cuidar la vista, y admite montaje VESA de 100 × 100.",
    destacados: [
      'Panel IPS de 24" Full HD (1920 × 1080)',
      "Hasta 100 Hz, configurable desde el menú del monitor",
      "Entradas HDMI y VGA (D-Sub)",
      "Eye Saver Mode, Flicker Free y montaje VESA 100 × 100",
    ],
    fuentes: [
      "https://www.samsung.com/ar/monitors/full-hd-1080p/essential-monitor-s3-s30gd-24-inch-fhd-ips-100hz-ls24d300galxzb/",
    ],
  },
  // Samsung Galaxy A07 (4G, SM-A075M)
  "samsung-galaxy-a07": {
    titular: 'Pantalla de 6,7" a 90 Hz, 5000 mAh y seis años de actualizaciones',
    cuerpo:
      "El Galaxy A07 es el Samsung de entrada para quien necesita lo básico y que dure. Tiene pantalla de 6,7 pulgadas a 90 Hz, procesador MediaTek Helio G99 y una batería de 5000 mAh. Samsung le asegura seis actualizaciones de Android y seis años de parches de seguridad, algo raro en un equipo de este rango. La cámara principal es de 50 MP con autofoco, acompañada por un sensor de profundidad de 2 MP, y adelante tiene 8 MP. Admite microSD de hasta 2 TB para fotos y videos, resiste salpicaduras y polvo con IP54 y pesa 184 g en 7,6 mm de espesor.",
    destacados: [
      'Pantalla de 6,7" a 90 Hz',
      "Seis actualizaciones de Android y seis años de seguridad",
      "Cámara principal de 50 MP con autofoco",
      "Batería de 5000 mAh, microSD hasta 2 TB e IP54",
    ],
    fuentes: [
      "https://www.samsung.com/br/business/smartphones/galaxy-a/galaxy-a07-black-256gb-sm-a075mzkizto/",
      "https://www.megatone.net/producto/samsung-ung-a07-sm-a075m-4g128gb-ng_KIT0756SSG/",
      "https://www.samsung.com/ar/smartphones/galaxy-a/galaxy-a07-light-violet-64gb-sm-a075mlvaaro/",
    ],
  },
  // Samsung Galaxy A16 (4G, SM-A165M)
  "samsung-galaxy-a16": {
    titular: 'Super AMOLED de 6,7" y seis años de actualizaciones de Android',
    cuerpo:
      "El Galaxy A16 es un equipo de entrada con una pantalla que no suele verse en esta gama: Super AMOLED de 6,7 pulgadas con resolución Full HD+. Samsung le asegura seis generaciones de Android y seis años de seguridad, así que no queda viejo en dos años. Atrás tiene una principal de 50 MP, un ultra gran angular de 5 MP y un sensor de 2 MP; adelante, 13 MP. La batería de 5000 mAh rinde hasta 18 horas de video. Suma NFC para pagar con el celular, microSD de hasta 1,5 TB y resistencia IP54 a salpicaduras.",
    destacados: [
      'Pantalla Super AMOLED de 6,7" Full HD+',
      "Seis actualizaciones de Android y seis años de seguridad",
      "Cámara principal de 50 MP y ultra gran angular de 5 MP",
      "5000 mAh, NFC, microSD hasta 1,5 TB e IP54",
    ],
    fuentes: [
      "https://www.samsung.com/ie/business/smartphones/galaxy-a/galaxy-a16-black-128gb-sm-a165fzkbeub/",
      "https://www.megatone.net/producto/samsung-ung-a16-sm-a165m-4g128gb-ng_KIT1630SSG/",
    ],
  },
  // Samsung Galaxy A17 4G (SM-A175F)
  "samsung-galaxy-a17": {
    titular: 'AMOLED de 6,7" a 90 Hz, cámara de 50 MP con OIS y 6 años de Android',
    cuerpo:
      "El Galaxy A17 4G es un equipo de entrada pensado para durar: Samsung le asegura seis actualizaciones de Android y seis años de parches de seguridad. Tiene pantalla Super AMOLED de 6,7 pulgadas Full HD+ a 90 Hz, protegida con Gorilla Glass Victus+, y procesador MediaTek Helio G99. La cámara principal de 50 MP tiene estabilización óptica, algo poco común en esta gama, y la acompañan un ultra gran angular de 5 MP y un macro de 2 MP. La batería de 5000 mAh rinde hasta 18 horas de video. Mide 7,5 mm, pesa 190 g, tiene NFC para pagar con el celular y resistencia IP54 a salpicaduras.",
    destacados: [
      'Pantalla Super AMOLED de 6,7" Full HD+ a 90 Hz',
      "Cámara principal de 50 MP con estabilización óptica",
      "Seis actualizaciones de Android y seis años de seguridad",
      "Batería de 5000 mAh, NFC e IP54",
    ],
    fuentes: [
      "https://www.samsung.com/ie/business/smartphones/galaxy-a/galaxy-a17-black-128gb-sm-a175fzkbeub/",
      "https://www.megatone.net/producto/samsung-ung-a17-sm-a175f-4g-128gb-ng_KIT1751SSG/",
      "https://www.sammobile.com/samsung/galaxy-a17/firmware/SM-A175F/ARO/download/A175FXXS1AYJA/2123966/",
    ],
  },
  // Samsung Galaxy A27 5G
  "samsung-galaxy-a27": {
    titular: 'Super AMOLED de 6,7" a 120 Hz, Snapdragon 6 Gen 3 y cámara con OIS',
    cuerpo:
      "El Galaxy A27 5G es la gama media accesible de Samsung con 5G. La pantalla Super AMOLED de 6,7 pulgadas va a 120 Hz y suma Vision Booster para verse mejor al sol. Lo mueve un Snapdragon 6 Gen 3. La cámara principal de 50 MP tiene estabilización óptica y graba en 4K, acompañada por un ultra gran angular de 5 MP y un macro de 2 MP; adelante hay 12 MP. La batería de 5000 mAh rinde hasta 23 horas de video. Admite microSD de hasta 2 TB, es IP64 contra polvo y salpicaduras, y Samsung le asegura seis actualizaciones de Android y seis años de seguridad.",
    destacados: [
      'Pantalla Super AMOLED de 6,7" a 120 Hz',
      "Snapdragon 6 Gen 3 y conectividad 5G",
      "Cámara principal de 50 MP con estabilización óptica y video 4K",
      "Seis actualizaciones de Android y seis años de seguridad",
    ],
    fuentes: [
      "https://www.samsung.com/ie/smartphones/galaxy-a/galaxy-a27-5g-black-128gb-sm-a276bzkbeub/",
      "https://news.samsung.com/ar/llega-a-argentina-el-nuevo-galaxy-a27-5g-de-samsung-con-beneficios-de-lanzamiento",
    ],
  },
  // Samsung Galaxy A37 5G (SM-A376B)
  "samsung-galaxy-a37": {
    titular: "IP68, 120 Hz y hasta 29 horas de video en 7,4 mm de espesor",
    cuerpo:
      "El Galaxy A37 5G suma a la gama media resistencia IP68 al agua y al polvo y Gorilla Glass Victus+ adelante y atrás. La pantalla Super AMOLED de 6,7 pulgadas va a 120 Hz, y el equipo mide 7,4 mm y pesa 196 g. La cámara principal de 50 MP tiene estabilización óptica, con un ultra gran angular de 8 MP y un macro de 5 MP; adelante, 12 MP. La batería de 5000 mAh rinde hasta 29 horas de video y con un cargador de 45 W llega al 60% en unos 30 minutos. Samsung le asegura seis actualizaciones de Android y seis años de seguridad.",
    destacados: [
      "Resistencia IP68 y Gorilla Glass Victus+ adelante y atrás",
      'Pantalla Super AMOLED de 6,7" a 120 Hz',
      "Cámara de 50 MP con estabilización óptica y ultra gran angular de 8 MP",
      "5000 mAh: hasta 29 horas de video y 60% de carga en 30 min",
    ],
    fuentes: [
      "https://www.samsung.com/ae/business/smartphones/galaxy-a/galaxy-a37-5g-awesome-white-128gb-sm-a376bzwpmea/",
      "https://www.fravega.com/p/x-990293147/",
    ],
  },
  // Samsung Galaxy A56 5G (SM-A566B)
  "samsung-galaxy-a56": {
    titular: "Marco de metal, IP67 y carga de 45 W en la gama media de Samsung",
    cuerpo:
      "El Galaxy A56 5G tiene marco de metal, Gorilla Glass Victus+ y resistencia IP67 al agua y al polvo, en un cuerpo de 7,4 mm y 198 g. La pantalla Super AMOLED de 6,7 pulgadas va a 120 Hz y con Vision Booster llega a 1200 nits. Atrás combina una principal de 50 MP con estabilización óptica, un ultra gran angular de 12 MP y un macro de 5 MP, y graba en 4K; adelante, 12 MP. La batería de 5000 mAh rinde hasta 29 horas de video y carga a 45 W. Samsung le asegura seis actualizaciones de Android y seis años de seguridad.",
    destacados: [
      "Marco de metal, Gorilla Glass Victus+ e IP67",
      'Super AMOLED de 6,7" a 120 Hz y 1200 nits con Vision Booster',
      "Cámara de 50 MP con estabilización óptica y video 4K",
      "5000 mAh: hasta 29 horas de video, carga de 45 W",
    ],
    fuentes: [
      "https://www.samsung.com/uk/smartphones/galaxy-a/galaxy-a56-5g-awesome-lightgrey-256gb-sm-a566bzaceub/",
      "https://www.samsung.com/uk/business/smartphones/galaxy-a/galaxy-a56-5g-awesome-graphite-128gb-enterprise-edition-sm-a566bzkaeeb/",
    ],
  },
  // Samsung Galaxy A57 5G (SM-A576B)
  "samsung-galaxy-a57": {
    titular: "6,9 mm y 179 g con IP68, pantalla a 120 Hz y cámara con OIS",
    cuerpo:
      "El Galaxy A57 5G mide 6,9 mm y pesa 179 g, con Gorilla Glass Victus+ adelante y atrás y resistencia IP68 al agua y al polvo. La pantalla Super AMOLED Plus de 6,7 pulgadas va a 120 Hz. Atrás tiene una principal de 50 MP con estabilización óptica, un ultra gran angular de 12 MP y un macro de 5 MP; adelante, 12 MP. La batería de 5000 mAh llega al 60% en unos 30 minutos con un cargador de 45 W. Suma herramientas como Circle to Search y Best Face, y seis actualizaciones de Android con seis años de seguridad.",
    destacados: [
      "6,9 mm de espesor y 179 g",
      "IP68 y Gorilla Glass Victus+ adelante y atrás",
      'Pantalla Super AMOLED Plus de 6,7" a 120 Hz',
      "Seis actualizaciones de Android y seis años de seguridad",
    ],
    fuentes: [
      "https://www.samsung.com/ae/business/smartphones/galaxy-a/galaxy-a57-5g-awesome-gray-256gb-sm-a576bzapmea/",
      "https://www.samsung.com/us/business/smartphones/galaxy-a57-5g/buy/galaxy-a57-5g-256gb-unlocked-sku-sm-a576uzafxaa/",
    ],
  },
  // Samsung Galaxy S25 FE (SM-S731B)
  "samsung-galaxy-s25-fe": {
    titular: "Zoom óptico 3×, video 8K e IP68 con siete años de Android",
    cuerpo:
      "El Galaxy S25 FE es la puerta de entrada a la línea S. Tiene pantalla Dynamic AMOLED 2X de 6,7 pulgadas a 120 Hz y procesador Exynos 2400. Atrás lleva una principal de 50 MP con estabilización óptica, un ultra gran angular de 12 MP y un teleobjetivo de 8 MP con zoom óptico 3×, y graba en 8K. La batería de 4900 mAh rinde hasta 28 horas de video y carga a 45 W por cable o 15 W inalámbrica. El marco es de Armor Aluminum, el vidrio Gorilla Glass Victus+ y es IP68. Samsung le asegura siete actualizaciones de Android.",
    destacados: [
      "Teleobjetivo de 8 MP con zoom óptico 3× y video 8K",
      'Pantalla Dynamic AMOLED 2X de 6,7" a 120 Hz',
      "4900 mAh con carga de 45 W por cable y 15 W inalámbrica",
      "IP68 y siete actualizaciones de Android",
    ],
    fuentes: [
      "https://www.samsung.com/ie/smartphones/galaxy-s/galaxy-s25-fe-navy-128gb-sm-s731bdbdeub/",
    ],
  },
  // Samsung Galaxy S25 Ultra (SM-S938B)
  "samsung-galaxy-s25-ultra": {
    titular: "Cámara de 200 MP con zoom óptico 3× y 5×, S Pen y marco de titanio",
    cuerpo:
      "El Galaxy S25 Ultra es el tope de la línea S de 2025. Lleva el Snapdragon 8 Elite for Galaxy con 12 GB de RAM y una pantalla Dynamic AMOLED 2X de 6,9 pulgadas con resolución Quad HD+ a 120 Hz. Atrás tiene cuatro cámaras: principal de 200 MP, ultra gran angular de 50 MP y dos teleobjetivos con zoom óptico 3× y 5×, y graba en 8K. El S Pen va guardado dentro del equipo, para anotar o firmar sin buscar nada. La batería de 5000 mAh rinde hasta 31 horas de video, el marco es de titanio y Samsung le asegura siete actualizaciones de Android.",
    destacados: [
      "Principal de 200 MP y zoom óptico 3× y 5×",
      'Pantalla Dynamic AMOLED 2X de 6,9" Quad HD+ a 120 Hz',
      "S Pen integrado y marco de titanio",
      "5000 mAh: hasta 31 horas de video y 7 actualizaciones de Android",
    ],
    fuentes: [
      "https://www.samsung.com/uk/business/smartphones/galaxy-s/galaxy-s25-ultra-titanium-silverblue-256gb-sm-s938bzbdeub/",
      "https://www.samsung.com/in/business/smartphones/galaxy-s/galaxy-s25-ultra-sm-s938bzbqins/",
    ],
  },
  // Samsung Galaxy S26
  "samsung-galaxy-s26": {
    titular: 'Pantalla de 6,3" y zoom óptico 3× en un cuerpo de 167 gramos',
    cuerpo:
      "El Galaxy S26 es el modelo compacto de la línea S: pantalla de 6,3 pulgadas en 7,2 mm de espesor y 167 g, con marco de Armor Aluminum y Gorilla Glass Victus 2. Atrás lleva una principal de 50 MP, un ultra gran angular de 12 MP y un teleobjetivo de 10 MP con zoom óptico 3×, para acercarte sin recortar la foto. Tiene 12 GB de RAM y una batería de 4300 mAh que rinde hasta 30 horas de video; con carga rápida llega al 55% en unos 30 minutos. Suma Galaxy AI, como Photo Assist, que edita fotos según lo que le escribís.",
    destacados: [
      "Pantalla de 6,3 pulgadas en 7,2 mm de espesor y 167 g",
      "Teleobjetivo de 10 MP con zoom óptico 3×",
      "Batería de 4300 mAh: hasta 30 horas de video",
      "12 GB de RAM y cámara de vapor rediseñada",
    ],
    fuentes: [
      "https://www.samsung.com/ar/smartphones/galaxy-s26/",
      "https://www.samsung.com/ar/smartphones/galaxy-s26/compare/",
    ],
  },
  // Samsung Galaxy S26 FE (SM-S741B)
  "samsung-galaxy-s26-fe": {
    titular: 'Pantalla de 6,7" a 120 Hz, zoom óptico 3× y siete años de Android',
    cuerpo:
      "El Galaxy S26 FE lleva buena parte de la línea S a un escalón más accesible. Tiene pantalla Dynamic AMOLED 2X de 6,7 pulgadas a 120 Hz y procesador Exynos 2500. Atrás combina una principal de 50 MP con estabilización óptica, un ultra gran angular de 12 MP y un teleobjetivo de 8 MP con zoom óptico 3×, y graba en 8K. La batería de 4900 mAh rinde hasta 29 horas de video y carga a 45 W por cable o 15 W inalámbrica. Es IP68 contra agua y polvo, y Samsung le asegura siete actualizaciones de Android.",
    destacados: [
      "Pantalla Dynamic AMOLED 2X de 6,7 pulgadas a 120 Hz",
      "Teleobjetivo de 8 MP con zoom óptico 3× y video 8K",
      "4900 mAh con carga de 45 W por cable y 15 W inalámbrica",
      "IP68 y siete actualizaciones de Android",
    ],
    fuentes: ["https://www.samsung.com/africa_en/smartphones/galaxy-s26-fe/"],
  },
  // Samsung Galaxy S26+
  "samsung-galaxy-s26-plus": {
    titular: 'Pantalla de 6,7" y 4900 mAh con 69% de carga en media hora',
    cuerpo:
      "El Galaxy S26+ tiene las mismas cámaras y el mismo procesador que el S26, en un formato más grande: pantalla de 6,7 pulgadas, 7,3 mm de espesor y 190 g. La batería sube a 4900 mAh, con hasta 31 horas de reproducción de video, y la carga rápida lo lleva al 69% en unos 30 minutos. Atrás tiene una principal de 50 MP, un ultra gran angular de 12 MP y un teleobjetivo de 10 MP con zoom óptico 3×. Trae 12 GB de RAM, marco de Armor Aluminum y Gorilla Glass Victus 2. Conviene a quien quiere más pantalla para videos, lectura o juegos sin pasar al Ultra.",
    destacados: [
      "Pantalla de 6,7 pulgadas en 7,3 mm de espesor",
      "Batería de 4900 mAh: hasta 31 horas de video",
      "Hasta 69% de carga en unos 30 minutos",
      "Teleobjetivo de 10 MP con zoom óptico 3×",
    ],
    fuentes: [
      "https://www.samsung.com/ar/smartphones/galaxy-s26/",
      "https://www.samsung.com/ar/smartphones/galaxy-s26/compare/",
    ],
  },
  // Samsung Galaxy S26 Ultra
  "samsung-galaxy-s26-ultra": {
    titular: "Pantalla de privacidad integrada, S Pen y cámara de 200 MP",
    cuerpo:
      "El Galaxy S26 Ultra estrena una pantalla de privacidad integrada: se activa desde el panel rápido o con doble presión del botón lateral y oculta lo que hay en la pantalla de 6,9 pulgadas a quien mira de costado; podés aplicarla solo a ciertas apps, a las notificaciones o al ingreso del PIN. Lleva el Snapdragon 8 Elite Gen 5 for Galaxy y S Pen integrado. La principal es de 200 MP, con zoom óptico 3× y 5× y ultra gran angular de 50 MP. La batería de 5000 mAh da hasta 31 horas de video y carga al 75% en unos 30 minutos.",
    destacados: [
      "Pantalla de 6,9 pulgadas con privacidad integrada",
      "Principal de 200 MP y zoom óptico 3× y 5×",
      "S Pen integrado y Snapdragon 8 Elite Gen 5 for Galaxy",
      "5000 mAh: hasta 31 horas de video, 75% de carga en 30 min",
    ],
    fuentes: [
      "https://www.samsung.com/ar/smartphones/galaxy-s26-ultra/",
      "https://www.samsung.com/latin/smartphones/galaxy-s26-ultra/",
      "https://www.samsung.com/pe/smartphones/galaxy-s26-ultra/",
    ],
  },
  // Samsung Galaxy Watch Ultra LTE 47 mm (SM-L705F)
  "samsung-galaxy-watch-ultra-l705-lte": {
    titular: "Titanio, zafiro, 10 ATM y GPS de doble frecuencia, con LTE propio",
    cuerpo:
      "El Galaxy Watch Ultra es el reloj de Samsung para deporte al aire libre y uso exigente. La caja de 47 mm es de titanio, el frente de cristal de zafiro, y resiste agua a 10 ATM con certificación IP68 y pruebas MIL-STD-810H. El GPS de doble frecuencia (L1 + L5) mejora la ubicación entre edificios o en la montaña. Por ser LTE, con eSIM podés recibir llamadas y mensajes sin el teléfono cerca. La pantalla llega a 3000 nits, la batería de 590 mAh rinde hasta 100 horas en modo de ahorro, y suma Quick Button configurable y una sirena de emergencia de 86 dB.",
    destacados: [
      "Caja de titanio de 47 mm y cristal de zafiro",
      "10 ATM, IP68 y MIL-STD-810H",
      "GPS de doble frecuencia (L1 + L5) y LTE con eSIM",
      "Hasta 100 horas de batería en modo de ahorro",
    ],
    fuentes: [
      "https://www.samsung.com/ie/business/watches/galaxy-watch/galaxy-watch-ultra-2025-47mm-titanium-grey-lte-sm-l705fza2eua/",
      "https://final-eu.etoren.com/products/samsung-galaxy-watch-ultra-lte-sm-l705f-47mm-titanium-white-case-with-white-marine-band",
    ],
  },
  // Samsung Galaxy Z Flip8
  "samsung-galaxy-z-flip-8": {
    titular: 'Plegable de 6,9" que cerrado entra en el bolsillo y pesa 180 g',
    cuerpo:
      "El Galaxy Z Flip8 abre una pantalla AMOLED de 6,9 pulgadas y, cerrado, queda en 13,1 mm de espesor; abierto mide 6,1 mm y pesa 180 g, 8 g menos que el Flip7. La pantalla externa FlexWindow de 4,1 pulgadas te deja ver notificaciones, contestar mensajes o usar la cámara principal de 50 MP para selfies sin abrirlo. Al lado lleva un ultra gran angular de 12 MP, y en modo Flex lo apoyás entreabierto para grabar o hacer videollamadas sin trípode. Tiene 12 GB de RAM, batería de 4300 mAh, carga de 25 W y resistencia IP48. Viene con Android 17 y Galaxy AI.",
    destacados: [
      'Pantalla principal AMOLED de 6,9" y FlexWindow de 4,1"',
      "180 g y 13,1 mm de espesor cerrado",
      "Cámara principal de 50 MP y ultra gran angular de 12 MP",
      "Batería de 4300 mAh, carga de 25 W y resistencia IP48",
    ],
    fuentes: [
      "https://www.samsung.com/au/mobile/buying-guide/galaxy-z-flip8-features-specs/",
      "https://www.samsung.com/my/smartphones/galaxy-z-flip8/specs/",
      "https://www.samsung.com/ca/support/mobile-devices/galaxy-z-fold8-ultra-galaxy-z-fold8-and-galaxy-z-flip8-specifications-and-features/",
    ],
  },
  // Samsung Galaxy Z Fold8
  "samsung-galaxy-z-fold-8": {
    titular: 'Pantalla interna de 7,6" en formato 4:3 y el Fold más liviano: 201 g',
    cuerpo:
      "El Galaxy Z Fold8 se abre en una pantalla de 7,6 pulgadas en formato 4:3, más cercano a una tablet, que llega a 3000 nits; cerrado usás la pantalla externa de 5,5 pulgadas como un teléfono común. Con 201 g es el Galaxy Z Fold más liviano hasta ahora. Atrás tiene dos cámaras de 50 MP, gran angular y ultra gran angular, y suma dos cámaras frontales de 10 MP. La batería es de 4800 mAh. La bisagra Armor FlexHinge está probada para 200.000 plegados, el vidrio es Gorilla Glass Ceramic 3 y tiene resistencia IP48. Conviene a quien trabaja con varias apps a la vez.",
    destacados: [
      'Pantalla interna de 7,6" en 4:3 y externa de 5,5"',
      "201 g, el Galaxy Z Fold más liviano hasta ahora",
      "Dos cámaras traseras de 50 MP y dos frontales de 10 MP",
      "Bisagra probada para 200.000 plegados e IP48",
    ],
    fuentes: [
      "https://www.samsung.com/ca/support/mobile-devices/galaxy-z-fold8-ultra-galaxy-z-fold8-and-galaxy-z-flip8-specifications-and-features/",
      "https://news.samsung.com/mx/quieres-un-plegable-la-nueva-serie-galaxy-z-es-perfecta-para-renovar-tu-celular",
      "https://fi.google.com/about/phones/samsung-galaxy-z-fold8-specs",
    ],
  },
  // Samsung Odyssey G5 G55A 27" QHD 165 Hz 1000R (LS27AG550ELXZB)
  "samsung-odyssey-g5-monitor-27-165hz-curvo": {
    titular: 'QHD curvo de 27" a 165 Hz y 1 ms para jugar con fluidez',
    cuerpo:
      "Es un monitor gamer de 27 pulgadas con resolución QHD (2560 × 1440) y curvatura 1000R, que rodea más tu campo de visión que una pantalla plana. Llega a 165 Hz con 1 ms de respuesta (MPRT), y con AMD FreeSync Premium evita los cortes de imagen cuando los cuadros por segundo varían. El panel VA tiene un contraste de 2500:1, que ayuda en escenas oscuras, y es compatible con HDR10. Se conecta por DisplayPort o HDMI 2.0 y tiene salida de auriculares. Conviene a quien juega en PC y quiere más resolución que Full HD sin resignar fluidez.",
    destacados: [
      'Pantalla curva 1000R de 27" QHD (2560 × 1440)',
      "165 Hz y 1 ms (MPRT) de respuesta",
      "AMD FreeSync Premium y compatibilidad HDR10",
      "Panel VA con contraste de 2500:1",
    ],
    fuentes: [
      "https://www.samsung.com/ar/monitors/gaming/odyssey-g5-g55a-27-inch-165hz-1ms-ls27ag550elxzb",
      "https://www.samsung.com/uy/monitors/gaming/odyssey-g5-g55c-27-inch-165hz-curved-qhd-ls27cg552elxzx",
    ],
  },
  // Starlink Mini (UTA-231)
  "starlink-mini-satellite-antenna-wifi-router-kit-uta-231": {
    titular: "Internet satelital que entra en la mochila, con router Wi-Fi integrado",
    cuerpo:
      "La Starlink Mini es la antena satelital portátil de Starlink: mide 298,5 × 259 mm y pesa 1,10 kg, así que se lleva en una mochila al campo, a la ruta o al barco. A diferencia de las antenas anteriores, trae el router Wi-Fi 5 adentro: de doble banda, cubre hasta 112 m² y admite hasta 128 dispositivos. Consume en promedio entre 25 y 40 W, lo que permite alimentarla desde el auto o una batería portátil con el cable adecuado. Funciona entre -30 °C y 50 °C. Para conectarte necesitás un plan de servicio de Starlink.",
    destacados: [
      "Antena de 298,5 × 259 mm y 1,10 kg",
      "Router Wi-Fi 5 de doble banda integrado, hasta 128 dispositivos",
      "Consumo promedio de 25 a 40 W",
      "Funciona entre -30 °C y 50 °C, campo de visión de 110°",
    ],
    fuentes: [
      "https://www.starlink.com/br/specifications?spec=5",
      "https://starlink.com/public-files/specification_sheet_mini_x.pdf",
      "https://www.notebookcheck.net/Starlink-Mini-priced-at-599-as-SpaceX-makes-weight-specs-official-and-offers-Mini-Roam-plan-for-30-month.850231.0.html",
    ],
  },
  // WD_BLACK SN850P NVMe SSD para consolas PS5, 2 TB (WDBBYV0020BNC-WRSN)
  "wdblack-nvme-ssd-para-playstation-5": {
    titular: "SSD con licencia oficial PS5: hasta 7300 MB/s y disipador de fábrica",
    cuerpo:
      "Es una unidad SSD NVMe PCIe Gen4 con licencia oficial de PlayStation, hecha para la ranura M.2 de expansión de la PS5. Viene con el disipador ya colocado, diseñado para trabajar con el flujo de aire de la consola, así que no hace falta comprar ni armar nada aparte. Lee a hasta 7300 MB/s y escribe a hasta 6600 MB/s, y suma 2 TB para instalar y jugar tus juegos de PS5 desde ahí. Conviene si tu PS5 se quedó sin lugar y no querés borrar juegos cada vez que bajás uno nuevo.",
    destacados: [
      "Licencia oficial y probado para PS5",
      "Hasta 7300 MB/s de lectura y 6600 MB/s de escritura",
      "Disipador ya instalado, pensado para la ranura M.2 de la PS5",
      "PCIe Gen4 NVMe, compatible con PCIe Gen3",
    ],
    fuentes: [
      "https://westerndigital.com/in-id/products/internal-drives/wd-black-sn850p-nvme-ssd-for-ps5",
      "https://shop.sandisk.com/content/dam/store/en-us/assets/topics/ps5-nvme-ssd-expansion/Info-WD-BLACK-SN850P-NVMe-SSD-for-PS5-Expansion-Campaign-Officially-Licensed.pdf",
      "https://katalog.atcomp.cz/katalog/2040500004/Datasheet.pdf",
    ],
  },
  // Xiaomi 17 Ultra
  "xiaomi-17-ultra-5g": {
    titular: "Teleobjetivo de 200 MP con zoom óptico continuo de 75 a 100 mm",
    cuerpo:
      "El Xiaomi 17 Ultra está armado alrededor de la cámara, con óptica Leica. La principal de 50 MP usa un sensor de 1 pulgada, y el teleobjetivo de 200 MP tiene zoom óptico continuo entre 75 y 100 mm, así que encuadrás de lejos sin pasar al zoom digital. Lo completa un ultra gran angular de 50 MP. Lo mueve un Snapdragon 8 Elite Gen 5, con pantalla LTPO de 6,9 pulgadas que va de 1 a 120 Hz y llega a 3500 nits. La batería de 6000 mAh carga a 90 W con cable y a 50 W inalámbrica. Es para quien usa el teléfono como cámara principal.",
    destacados: [
      "Cámara principal de 50 MP con sensor de 1 pulgada",
      "Teleobjetivo de 200 MP con zoom óptico continuo de 75 a 100 mm",
      "Pantalla LTPO de 6,9 pulgadas, de 1 a 120 Hz y hasta 3500 nits",
      "Batería de 6000 mAh con carga de 90 W y 50 W inalámbrica",
    ],
    fuentes: [
      "https://www.movistar.es/moviles/xiaomi-xiaomi-17-ultra-512gb-blanco/",
      "https://www.xataka.com/moviles/xiaomi-17-ultra-caracteristicas-precio-ficha-tecnica-1",
      "https://www.mi.com/global/product/xiaomi-17-ultra/specs/",
    ],
  },
  // Xiaomi Electric Scooter 4 Go
  "xiaomi-electric-scooter-4-go": {
    titular: "Hasta 20 km/h y 18 km de autonomía, con ruedas que no se inflan",
    cuerpo:
      "El Xiaomi Electric Scooter 4 Go es un monopatín eléctrico plegable pensado para trayectos cortos por la ciudad. Su motor de 250 W nominales, con 450 W de pico, llega a 20 km/h, con modos de 6, 15 y 20 km/h, y la batería de 165 Wh rinde hasta unos 18 km por carga. Las ruedas de 8,1 pulgadas son runflat huecas, así que no hay que inflarlas. Frena con freno eléctrico en la rueda delantera y de tambor en la trasera. Soporta hasta 90 kg y sube pendientes de alrededor del 10%. Es para ir al trabajo, a la facultad o a hacer mandados sin depender del colectivo.",
    destacados: [
      "Velocidad máxima de 20 km/h, con modos de 6, 15 y 20 km/h",
      "Autonomía de hasta 18 km con batería de 165 Wh",
      "Ruedas runflat de 8,1 pulgadas que no necesitan inflado",
      "Plegable y con carga máxima de 90 kg",
    ],
    fuentes: [
      "https://www.mi.com/global/product/xiaomi-electric-scooter-4-go/specs/",
      "https://www.mi.com/pe/support/faq/details/KA-54022/",
      "https://www.cleanrider.com/catalogue/trottinette-electrique/xiaomi/xiaomi-electric-scooter-4-go/",
    ],
  },
};
