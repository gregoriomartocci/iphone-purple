# Ramas y ambientes

Cómo llega un cambio desde el editor hasta el sitio publicado, y por qué está
armado así.

---

## El mapa

```
feat/lo-que-sea ─┐
fix/lo-que-sea  ─┼─► staging ─────────► main
chore/lo-que-sea ┘      │                 │
                        │                 │
                 URL fija de         iphone-purple
                 pre-producción      .vercel.app
                 (se aprueba acá)    (lo ve el cliente)
```

Dos ramas permanentes y ninguna más. Todo lo demás es temporal y se borra
apenas se mergea.

| Rama      | Vive    | Ambiente en Vercel  | Para qué                                     |
| --------- | ------- | ------------------- | -------------------------------------------- |
| `main`    | Siempre | Production          | Lo que ve el cliente. Nunca se toca directo. |
| `staging` | Siempre | Preview (URL fija)  | Se mira y se aprueba antes de publicar.      |
| `feat/…`  | Días    | Preview descartable | Una tarea. Sale de `staging` y vuelve ahí.   |
| `fix/…`   | Horas   | Preview descartable | Un arreglo.                                  |
| `chore/…` | Horas   | Preview descartable | Dependencias, config, herramientas.          |
| `docs/…`  | Horas   | Preview descartable | Solo documentación.                          |

### Por qué `main` y no `prod`

Porque `main` **es** el nombre estándar de la rama de producción, y renombrarla
obliga a reconfigurar la rama de producción en Vercel, cambiar la default en
GitHub, reescribir `ci.yml` y volver a clonar. Riesgo a cambio de nada.

### Por qué existe `staging` y no alcanza con el preview de cada PR

El preview de un PR cambia de URL en cada rama y desaparece cuando se mergea.
`staging` tiene una URL fija que se puede mandar por WhatsApp y que siempre
apunta a lo último aprobado. Es la diferencia entre «mirá esto» y «mirá esto,
y si te parece lo publico».

---

## El recorrido de un cambio

```bash
# 1. Salir siempre de staging actualizado, nunca de main
git checkout staging && git pull

# 2. Una rama por tarea, con prefijo
git checkout -b feat/cotizador-de-canje

# 3. Trabajar y commitear. Los hooks corren solos:
#    pre-commit → lint-staged (eslint --fix + prettier)
#    pre-push   → typecheck + tests
git push -u origin feat/cotizador-de-canje

# 4. PR contra staging. CI corre sola; Vercel deja una URL de preview.
gh pr create --base staging --fill

# 5. Mergeado y aprobado en la URL de staging, se publica:
gh pr create --base main --head staging --title "Publicar: cotizador de canje"
```

La rama se borra al mergear. Si quedó alguna colgada:

```bash
git branch --merged staging     # ver qué se puede borrar sin perder nada
git fetch --prune               # limpiar las que ya no están en el remoto
```

---

## Ambientes y datos

Hoy **producción corre con la semilla**, no con base de datos. Está en
`lib/data/index.ts`: si no hay credenciales de Supabase, sirve
`lib/data/seed.ts`. Por eso hoy los tres ambientes muestran lo mismo.

| Variable            | Production                  | Preview / staging           |
| ------------------- | --------------------------- | --------------------------- |
| `AUTH_SECRET`       | Cargada                     | —                           |
| Supabase (las tres) | Sin cargar → usa la semilla | Sin cargar → usa la semilla |
| `ANTHROPIC_API_KEY` | Sin cargar                  | Sin cargar                  |
| `MP_ACCESS_TOKEN`   | Sin cargar                  | Sin cargar                  |

### Cuando se conecte la base real

Esto es lo único importante de todo el documento:

> **`staging` no puede apuntar nunca a la base de producción.**

En cuanto se carguen las credenciales de Supabase en Production, hay que
decidir qué hace `staging`, y hay dos caminos sanos:

1. **Dejarlo con la semilla** (no cargar Supabase en Preview). Gratis, cero
   riesgo, y sigue sirviendo para aprobar diseño y textos. No sirve para
   probar el panel contra datos reales.
2. **Un segundo proyecto de Supabase** para staging, con el mismo
   `schema.sql` y el mismo `seed.sql`. Cuesta un poco de mantenimiento y
   permite probar el panel y el importador sin tocar el stock real.

Lo que **no** hay que hacer es apuntar Preview a la base de producción: el
panel escribe, y un importador probado en staging publicaría precios reales.

---

## Protecciones

`main` está protegida: no se pushea directo, entra solo por PR y con CI en
verde. Si un push a `main` es rechazado, no es un error — es la protección
haciendo su trabajo. El camino es el PR.

Las reglas están versionadas en [`branch-protection.md`](branch-protection.md)
para poder reponerlas si se pierden.
