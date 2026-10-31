# Protección de ramas

Las reglas de GitHub que cuidan `main` y `staging`, versionadas acá para
poder reponerlas si alguien las apaga o si el repo se recrea.

Requieren [GitHub CLI](https://cli.github.com) autenticado:

```bash
gh auth login    # una sola vez, elegí GitHub.com → SSH → navegador
gh auth status   # verificar
```

---

## `main` — producción

Nadie pushea directo. Entra por PR y con CI en verde.

```bash
gh api -X PUT repos/gregoriomartocci/iphone-purple/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Tipos, lint y tests", "Build de producción", "Seguridad"]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": true,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
JSON
```

Qué hace cada cosa, y por qué está así:

| Regla                                | Efecto                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `required_status_checks.strict`      | No se mergea sin CI verde **y** con la rama actualizada contra `main`. |
| `contexts`                           | Los tres jobs de `ci.yml`. Si les cambiás el `name`, cambialos acá.    |
| `required_approving_review_count: 0` | Obliga a abrir PR, pero no a que otro apruebe: trabajás solo.          |
| `enforce_admins: true`               | La regla también te frena a vos. Ver abajo.                            |
| `required_linear_history`            | Sin merges de merge: el historial se lee como una línea.               |
| `allow_force_pushes: false`          | Nadie reescribe la historia de producción.                             |
| `allow_deletions: false`             | Nadie borra `main`.                                                    |

### Sobre `enforce_admins: true`

Está en `true` porque en `false` la regla **no sirve**. Se probó: con
`enforce_admins: false`, un push directo a `main` no se rechaza — GitHub lo
deja pasar y solo imprime `Bypassed rule violations`. Es un cartel, no una
tranquera.

Con `true`, el mismo push devuelve `GH006: protected branch hook declined` y
no entra. Verificado, no supuesto.

### El hotfix de un sábado

Si producción está rota y hay que publicar ya, el camino sigue siendo el PR:
abrilo, esperá CI y mergeá. Son tres minutos y es lo correcto casi siempre.

Si de verdad no se puede esperar:

```bash
# 1. abrir la tranquera
gh api -X DELETE repos/gregoriomartocci/iphone-purple/branches/main/protection/enforce_admins
# 2. publicar el arreglo
git push origin main
# 3. CERRARLA DE NUEVO, en el mismo rato
gh api -X POST repos/gregoriomartocci/iphone-purple/branches/main/protection/enforce_admins
```

El paso 3 no es opcional. Una protección que se abre y queda abierta es peor
que no tenerla, porque creés que estás cubierto.

---

## `staging` — pre-producción

Más liviana: acá sí se puede pushear directo, porque es el lugar donde se
prueba. Lo único que no se permite es reescribir o borrar.

```bash
gh api -X PUT repos/gregoriomartocci/iphone-purple/branches/staging/protection \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "required_pull_request_reviews": null,
  "enforce_admins": false,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

---

## Verificar

```bash
gh api repos/gregoriomartocci/iphone-purple/branches/main/protection \
  | python3 -m json.tool | head -30
```

O en la web: **Settings → Branches → Branch protection rules**.

---

## Además, en la web

Dos cosas que conviene tildar a mano una sola vez, en
**Settings → General → Pull Requests**:

- **Automatically delete head branches** — borra sola la rama al mergear el
  PR, que es la mitad del trabajo de mantener el repo ordenado.
- Dejar **Allow squash merging** y **Allow rebase merging**, y **desactivar
  Allow merge commits**.

Lo último no es estético: `required_linear_history` rechaza los merge
commits, así que dejar ese botón prendido solo sirve para que GitHub te
frene el merge cuando ya estás por publicar.

Cuál usar en cada caso:

| Merge                | Cómo       | Por qué                                                                                        |
| -------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `feat/…` → `staging` | **Squash** | La rama son diez commits de ida y vuelta; en `staging` interesa el cambio terminado, uno solo. |
| `staging` → `main`   | **Squash** | Un commit por publicación. No es la primera opción, es la única que funciona: ver abajo.       |

---

## Por qué publicar es squash y no rebase

La primera versión de este documento decía rebase, con el argumento de que en
`main` interesa cada commit por separado. Funcionó dos veces y después dejó de
funcionar, con este error:

```
GraphQL: This branch can't be rebased (mergePullRequest)
```

La causa es que las dos reglas se peleaban entre sí. El paso 6 del circuito
—sincronizar `staging` con `main` después de publicar— se hace con un merge, y
eso deja un merge commit dentro de `staging`. GitHub no puede rebasar una rama
que contiene merge commits. O sea: cada publicación sembraba el merge commit
que iba a romper la siguiente.

Las salidas posibles eran tres. Habilitar merge commits choca con
`required_linear_history`. Sincronizar `staging` con un force push choca con
`allow_force_pushes: false`, que no vale la pena aflojar. Queda el squash, que
funciona sin importar qué tenga la rama adentro.

Lo que se pierde: en `main` cada publicación es un commit solo. El detalle
commit por commit sigue estando en `staging` y en el PR, que es donde se mira
cuando hay que entender un cambio.
