/**
 * Lo que WhatsApp informa de cada contacto, por identificador.
 *
 * Un contacto puede llegar por partes y con dos identidades: su teléfono y su
 * identificador interno. Se guarda bajo las dos para poder encontrarlo con la
 * que venga en un mensaje de grupo. Una actualización parcial nunca pisa un
 * dato que ya se sabe.
 */
const limpio = (jid) =>
  String(jid ?? "")
    .split("@")[0]
    .split(":")[0];

export function registrarContacto(mapa, contacto) {
  const claves = [contacto?.id, contacto?.lid].map(limpio).filter(Boolean);
  if (claves.length === 0) return false;

  const jidTelefono = [contacto.id, contacto.lid].find((j) =>
    String(j ?? "").endsWith("@s.whatsapp.net")
  );
  const nuevo = {
    agenda: contacto.name || null,
    propio: contacto.verifiedName || contacto.notify || null,
    telefono: jidTelefono ? limpio(jidTelefono) : null,
  };

  let cambio = false;
  const previos = claves.map((c) => mapa.get(c)).filter(Boolean);
  const unido = {
    agenda: nuevo.agenda ?? previos.find((p) => p.agenda)?.agenda ?? null,
    propio: nuevo.propio ?? previos.find((p) => p.propio)?.propio ?? null,
    telefono: nuevo.telefono ?? previos.find((p) => p.telefono)?.telefono ?? null,
  };
  for (const clave of claves) {
    if (JSON.stringify(mapa.get(clave)) !== JSON.stringify(unido)) {
      mapa.set(clave, unido);
      cambio = true;
    }
  }
  return cambio;
}

/** Primero cómo lo agendó el negocio, después el nombre que eligió el contacto. */
export function nombreDeContacto(mapa, id) {
  const c = mapa.get(limpio(id));
  return c?.agenda ?? c?.propio ?? null;
}

/** El jid para consultar un perfil. Un identificador interno no es un teléfono. */
export function jidParaConsultar(mapa, id) {
  if (String(id).includes("@")) return id;
  const telefono = mapa.get(limpio(id))?.telefono;
  if (telefono) return `${telefono}@s.whatsapp.net`;
  return String(id).startsWith("54") ? `${id}@s.whatsapp.net` : `${id}@lid`;
}
