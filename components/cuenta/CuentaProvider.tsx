"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Datos de la persona que compra.
 *
 * Hoy viven en el navegador, no en una cuenta: comprar no exige registrarse,
 * así que hasta que alguien decida crear una cuenta no hay dónde guardarlos
 * del lado del servidor. Aun así sirven desde el primer minuto —los favoritos
 * se marcan, los pedidos quedan listados, los datos se autocompletan— y el día
 * que se conecte la base esto es lo que se sincroniza.
 *
 * Lo que NO hace es fingir que hay una cuenta. La pantalla dice con todas las
 * letras que esto está guardado en este navegador, porque alguien que cambia
 * de teléfono y no encuentra sus favoritos tiene que entender por qué.
 */

export type Favorito = {
  slug: string;
  nombre: string;
  precioArs: number;
  imagen: string | null;
  agregadoEn: string;
};

export type Direccion = {
  id: string;
  etiqueta: string;
  calle: string;
  localidad: string;
  codigoPostal: string;
};

export type PedidoGuardado = {
  referencia: string;
  fecha: string;
  totalArs: number;
  items: { nombre: string; variante: string; cantidad: number }[];
  entrega: "retiro" | "envio";
  /** Turno reservado, cuando es retiro. */
  turno?: { fecha: string; hora: string };
  estado: "pendiente" | "confirmado" | "entregado";
};

export type Perfil = {
  nombre: string;
  email: string;
  telefono: string;
};

type Valor = {
  listo: boolean;
  perfil: Perfil;
  guardarPerfil: (p: Partial<Perfil>) => void;
  favoritos: Favorito[];
  esFavorito: (slug: string) => boolean;
  alternarFavorito: (f: Omit<Favorito, "agregadoEn">) => void;
  direcciones: Direccion[];
  agregarDireccion: (d: Omit<Direccion, "id">) => void;
  quitarDireccion: (id: string) => void;
  pedidos: PedidoGuardado[];
  registrarPedido: (p: Omit<PedidoGuardado, "fecha" | "estado">) => void;
};

const Contexto = createContext<Valor | null>(null);
const CLAVE = "ip-cuenta-v1";

const PERFIL_VACIO: Perfil = { nombre: "", email: "", telefono: "" };

type Guardado = {
  perfil: Perfil;
  favoritos: Favorito[];
  direcciones: Direccion[];
  pedidos: PedidoGuardado[];
};

const VACIO: Guardado = {
  perfil: PERFIL_VACIO,
  favoritos: [],
  direcciones: [],
  pedidos: [],
};

export function CuentaProvider({ children }: { children: React.ReactNode }) {
  const [datos, setDatos] = useState<Guardado>(VACIO);
  const [listo, setListo] = useState(false);

  /**
   * Rehidratación desde el navegador.
   *
   * Se lee después del primer render porque en el servidor no hay
   * localStorage, y leerlo durante el render daría marcado distinto en
   * cliente y servidor.
   *
   * La regla de renders en cascada no aplica: esto corre una sola vez al
   * montar para sincronizar con un almacén externo, que es justamente el caso
   * para el que existen los efectos, y no en respuesta a props que cambian.
   */
  useEffect(() => {
    try {
      const crudo = window.localStorage.getItem(CLAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ver arriba
      if (crudo) setDatos({ ...VACIO, ...(JSON.parse(crudo) as Partial<Guardado>) });
    } catch {
      // Un JSON corrupto o el almacenamiento bloqueado no pueden voltear la
      // página: se arranca vacío y se sigue.
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
      // Modo privado o cuota llena: se pierde la persistencia, no la sesión.
    }
  }, [datos, listo]);

  const guardarPerfil = useCallback((p: Partial<Perfil>) => {
    setDatos((d) => ({ ...d, perfil: { ...d.perfil, ...p } }));
  }, []);

  const alternarFavorito = useCallback((f: Omit<Favorito, "agregadoEn">) => {
    setDatos((d) => {
      const existe = d.favoritos.some((x) => x.slug === f.slug);
      return {
        ...d,
        favoritos: existe
          ? d.favoritos.filter((x) => x.slug !== f.slug)
          : [{ ...f, agregadoEn: new Date().toISOString() }, ...d.favoritos],
      };
    });
  }, []);

  const agregarDireccion = useCallback((d0: Omit<Direccion, "id">) => {
    setDatos((d) => ({
      ...d,
      direcciones: [...d.direcciones, { ...d0, id: crypto.randomUUID() }],
    }));
  }, []);

  const quitarDireccion = useCallback((id: string) => {
    setDatos((d) => ({ ...d, direcciones: d.direcciones.filter((x) => x.id !== id) }));
  }, []);

  const registrarPedido = useCallback((p: Omit<PedidoGuardado, "fecha" | "estado">) => {
    setDatos((d) => ({
      ...d,
      pedidos: [
        { ...p, fecha: new Date().toISOString(), estado: "pendiente" as const },
        ...d.pedidos,
      ],
    }));
  }, []);

  return (
    <Contexto.Provider
      value={{
        listo,
        perfil: datos.perfil,
        guardarPerfil,
        favoritos: datos.favoritos,
        esFavorito: (slug) => datos.favoritos.some((f) => f.slug === slug),
        alternarFavorito,
        direcciones: datos.direcciones,
        agregarDireccion,
        quitarDireccion,
        pedidos: datos.pedidos,
        registrarPedido,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useCuenta(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error("useCuenta necesita estar dentro de <CuentaProvider>");
  return v;
}
