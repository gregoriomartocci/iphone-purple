// GENERADO por scripts/indexar-fotos.mjs — no editar a mano.
// Es el espejo de public/productos/: cada archivo que hay ahí, en el orden en
// que la ficha lo muestra. Para sumar una foto, dejala en la carpeta del
// producto y corré `npm run fotos:indexar`.
//
// Las licencias Creative Commons exigen crédito visible, así que las fotos que
// vinieron de Commons se guardan con su autor y la ficha lo muestra. Una foto
// propia o comprada va con autor en null y entonces no se acredita a nadie.

export type CreditoFoto = {
  url: string;
  /** null cuando no hay a quién acreditar: foto propia, comprada o de prensa. */
  autor: string | null;
  licencia: string | null;
  origen: string | null;
  /** "render" es el equipo recortado sobre blanco o transparente; "foto", una toma real. */
  recorte: "render" | "foto";
  /** Los videos van al final de la galería. */
  video: boolean;
};

export const FOTOS_PRODUCTO: Record<string, CreditoFoto[]> = {
  "airpods-pro-2": [
    {
      url: "/productos/airpods-pro-2/1.jpg",
      autor: "Hajoon0102",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:AirPods_Pro_(2nd_generation).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "apple-watch-series-10": [
    {
      url: "/productos/apple-watch-series-10/1.jpg",
      autor: "KK IN HK",
      licencia: "Public domain",
      origen: "https://commons.wikimedia.org/wiki/File:Apple_Watch_Series_10.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "garmin-instinct-2s-solar": [
    {
      url: "/productos/garmin-instinct-2s-solar/1.jpg",
      autor: "Lomrjyo",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Garmin_Instinct_2s.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "ipad-air-11-m4": [
    {
      url: "/productos/ipad-air-11-m4/1.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:IPad_Air_11-inch_(M3)_backside.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/ipad-air-11-m4/2.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPad_Air_11-inch_(M3).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "ipad-air-13-m3": [
    {
      url: "/productos/ipad-air-13-m3/1.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:IPad_Air_11-inch_(M3)_backside.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/ipad-air-13-m3/2.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPad_Air_11-inch_(M3).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "ipad-air-13-m4": [
    {
      url: "/productos/ipad-air-13-m4/1.jpg",
      autor: "メイド理世",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:About_iPad_Air_13-inch_(M2).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "ipad-air-m2": [
    {
      url: "/productos/ipad-air-m2/1.jpg",
      autor: "メイド理世",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:About_iPad_Air_11-inch_(M2).jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/ipad-air-m2/2.jpg",
      autor: "メイド理世",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:About_iPad_Air_13-inch_(M2).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "iphone-11": [
    {
      url: "/productos/iphone-11/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_11_White.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-11-pro": [
    {
      url: "/productos/iphone-11-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_11_Pro_Midnight_Green.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-11-pro-max": [
    {
      url: "/productos/iphone-11-pro-max/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:IPhone_11_Pro_Max_Midnight_Green.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-12": [
    {
      url: "/productos/iphone-12/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_12_Blue.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-12-pro": [
    {
      url: "/productos/iphone-12-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_12_Pro_Gold.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-12-pro-max": [],
  "iphone-13": [
    {
      url: "/productos/iphone-13/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_13_vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-13-pro": [
    {
      url: "/productos/iphone-13-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_13_Pro_vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-13-pro-max": [
    {
      url: "/productos/iphone-13-pro-max/1.jpg",
      autor: "メイド理世",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Back_view_of_iPhone_13_Pro_Max_Gold.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "iphone-14": [
    {
      url: "/productos/iphone-14/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_14_vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-14-pro": [
    {
      url: "/productos/iphone-14-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_14_Pro_vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-14-pro-max": [
    {
      url: "/productos/iphone-14-pro-max/1.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:IPhone_14_Pro_Max_Deep_purple_A2896_China,_Hong_Kong_and_Macao_version_rear.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/iphone-14-pro-max/2.jpg",
      autor: "Hajoon0102",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Back_of_the_iPhone_14_Pro_Max.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "iphone-15": [
    {
      url: "/productos/iphone-15/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_15_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-15-pro": [
    {
      url: "/productos/iphone-15-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_15_Pro_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-15-pro-max": [
    {
      url: "/productos/iphone-15-pro-max/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_15_Pro_Max_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-16": [
    {
      url: "/productos/iphone-16/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_16_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-16-pro": [
    {
      url: "/productos/iphone-16-pro/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_16_Pro_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-16-pro-max": [
    {
      url: "/productos/iphone-16-pro-max/1.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_16_Pro_Max_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-17": [
    {
      url: "/productos/iphone-17/1.png",
      autor: "Eugen Prostakov",
      licencia: "CC BY 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_(Lavender).png",
      recorte: "render",
      video: false,
    },
    {
      url: "/productos/iphone-17/2.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-17-pro": [
    {
      url: "/productos/iphone-17-pro/1.png",
      autor: "Eugen Prostakov",
      licencia: "CC BY 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Pro.png",
      recorte: "render",
      video: false,
    },
    {
      url: "/productos/iphone-17-pro/2.png",
      autor: "Own work",
      licencia: "CC BY 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_back.svg",
      recorte: "render",
      video: false,
    },
    {
      url: "/productos/iphone-17-pro/3.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "iphone-17-pro-max": [
    {
      url: "/productos/iphone-17-pro-max/1.png",
      autor: "Eugen Prostakov",
      licencia: "CC BY 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_Max_(Deep_Blue).png",
      recorte: "render",
      video: false,
    },
    {
      url: "/productos/iphone-17-pro-max/2.png",
      autor: "Rafael Fernandez",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_Max_Vector.svg",
      recorte: "render",
      video: false,
    },
  ],
  "logitech-g29-driving-force": [
    {
      url: "/productos/logitech-g29-driving-force/1.jpg",
      autor: "Antoineets",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Logitech_G29_steering_wheel.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-air-m3": [
    {
      url: "/productos/macbook-air-m3/1.jpg",
      autor: "AzureSaturn",
      licencia: "CC0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Air_(13-inch,_M4,_Silver).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-air-m5-13": [
    {
      url: "/productos/macbook-air-m5-13/1.jpg",
      autor: "AzureSaturn",
      licencia: "CC0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Air_(13-inch,_M4,_Silver).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-air-m5-15": [
    {
      url: "/productos/macbook-air-m5-15/1.jpg",
      autor: "AzureSaturn",
      licencia: "CC0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Air_(15-inch,_M4,_Silver).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-neo-13": [
    {
      url: "/productos/macbook-neo-13/1.jpg",
      autor: null,
      licencia: null,
      origen: null,
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m4-pro-14": [
    {
      url: "/productos/macbook-pro-m4-pro-14/1.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m4-pro-14/2.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation_(blue).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m5-14": [
    {
      url: "/productos/macbook-pro-m5-14/1.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-14/2.jpg",
      autor: "Mark Solarski marksolarski",
      licencia: "CC0",
      origen: "https://commons.wikimedia.org/wiki/File:Apple_Macbook_Pro_(Unsplash).jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m5-max-14": [
    {
      url: "/productos/macbook-pro-m5-max-14/1.jpg",
      autor: "Mark Solarski marksolarski",
      licencia: "CC0",
      origen: "https://commons.wikimedia.org/wiki/File:Apple_Macbook_Pro_(Unsplash).jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-max-14/2.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m5-max-16": [
    {
      url: "/productos/macbook-pro-m5-max-16/1.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Apple_MacBook_Pro_16%22_M2_Max.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-max-16/2.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Apple_MacBook_Pro_16%22_M2_Max_closeup.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-max-16/3.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Apple_MacBook_Pro_16%22_M2_Max_with_Headset_and_Mouse.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m5-pro-14": [
    {
      url: "/productos/macbook-pro-m5-pro-14/1.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation_(blue).jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-pro-14/2.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:MacBook_Pro_3rd_Generation.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "macbook-pro-m5-pro-16": [
    {
      url: "/productos/macbook-pro-m5-pro-16/1.jpg",
      autor: "Premeditated",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:MacBook_Pro_16_(M1_Pro,_2021)_-_Wikipedia.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/macbook-pro-m5-pro-16/2.jpg",
      autor: "SimonWaldherr",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Apple_MacBook_Pro_16%22_M2_Max.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "moto-g35": [
    {
      url: "/productos/moto-g35/1.jpg",
      autor: "Savantup",
      licencia: "CC0",
      origen: "https://commons.wikimedia.org/wiki/File:Motorola_Moto_G35_5G.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "nintendo-switch-2-mario-kart": [
    {
      url: "/productos/nintendo-switch-2-mario-kart/1.jpg",
      autor: "Crisco 1492",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Nintendo_Switch_2_in_Docking_Console.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/nintendo-switch-2-mario-kart/2.jpg",
      autor: "Crisco 1492",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Nintendo_Switch_2_in_Handheld_Mode.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "nintendo-switch-oled": [
    {
      url: "/productos/nintendo-switch-oled/1.jpg",
      autor: "Grandmaster Huon",
      licencia: "CC0",
      origen: "https://commons.wikimedia.org/wiki/File:Switch_oled_console.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "playstation-5-slim": [
    {
      url: "/productos/playstation-5-slim/1.jpg",
      autor: null,
      licencia: null,
      origen: null,
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/playstation-5-slim/2.jpg",
      autor: null,
      licencia: null,
      origen: null,
      recorte: "foto",
      video: false,
    },
  ],
  "redmi-15c": [
    {
      url: "/productos/redmi-15c/1.jpg",
      autor: "Maksdroider",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Redmi_15C_back.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/redmi-15c/2.jpg",
      autor: "Maksdroider",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Redmi_15C_front.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "redmi-pad-2": [
    {
      url: "/productos/redmi-pad-2/1.jpg",
      autor: null,
      licencia: null,
      origen: null,
      recorte: "foto",
      video: false,
    },
  ],
  "xiaomi-17": [
    {
      url: "/productos/xiaomi-17/1.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen:
        "https://commons.wikimedia.org/wiki/File:Xiaomi_17_backside_Ice_Melting_Blue.jpg",
      recorte: "foto",
      video: false,
    },
  ],
  "xiaomi-17-ultra": [
    {
      url: "/productos/xiaomi-17-ultra/1.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Xiaomi_17_Ultra_by_Leica_rear.jpg",
      recorte: "foto",
      video: false,
    },
    {
      url: "/productos/xiaomi-17-ultra/2.jpg",
      autor: "茅野ふたば",
      licencia: "CC BY-SA 4.0",
      origen: "https://commons.wikimedia.org/wiki/File:Xiaomi_17_Ultra.jpg",
      recorte: "foto",
      video: false,
    },
  ],
};
