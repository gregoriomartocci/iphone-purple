import { ImageResponse } from "next/og";

/**
 * Imagen que se ve al compartir el sitio por WhatsApp, Instagram o Google.
 *
 * Se genera en el build en vez de mantener un JPG a mano: así el texto sigue
 * siendo texto —se corrige editando este archivo— y no hay que rehacer una
 * pieza en un editor cada vez que cambia algo.
 *
 * Es la primera impresión de un link pegado en un chat, que es exactamente
 * como llega la mayoría de la gente a un negocio como este.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "iPhone Purple — iPhone y productos Apple en La Plata";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#0c0c10",
        color: "#ffffff",
        // Sin fuente propia el renderer usa la de sistema: suficiente para
        // una pieza de este tamaño y evita cargar un archivo en cada build.
        fontFamily: "sans-serif",
      }}
    >
      {/* El punto violeta es el planeta del logo reducido a su mínima
            expresión: a este tamaño una marca completa no se lee. */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#5e16eb",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: 6, opacity: 0.75 }}>IPHONE PURPLE</div>
      </div>

      {/* Cada renglón es su propio div: el renderer de esta imagen no admite
            un <br/> suelto entre textos, exige un contenedor explícito. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          lineHeight: 1.05,
          marginTop: 40,
        }}
      >
        <div>iPhone y productos Apple</div>
        <div>en La Plata</div>
      </div>

      <div
        style={{
          fontSize: 32,
          marginTop: 32,
          opacity: 0.7,
          maxWidth: 860,
          lineHeight: 1.35,
        }}
      >
        Sellados y seminuevos con garantía escrita. Plan Canje por tu usado y servicio
        técnico propio.
      </div>
    </div>,
    size
  );
}
