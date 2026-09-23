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
  "enforce_admins": false,
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
| `enforce_admins: false`              | Podés saltearla en una emergencia real. Ver abajo.                     |
| `required_linear_history`            | Sin merges de merge: el historial se lee como una línea.               |
| `allow_force_pushes: false`          | Nadie reescribe la historia de producción.                             |
| `allow_deletions: false`             | Nadie borra `main`.                                                    |

### Sobre `enforce_admins: false`

Queda en `false` a propósito: sos el único que trabaja en el repo, y si un
sábado el sitio se rompe tenés que poder publicar el arreglo sin pelearte con
la configuración. La contracara es que la regla te protege de un descuido,
no de vos mismo decidiendo saltearla.

Si algún día entra otra persona al repo, ponelo en `true`:

```bash
gh api -X POST repos/gregoriomartocci/iphone-purple/branches/main/protection/enforce_admins
```

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

| Merge                | Cómo       | Por qué                                                                                                    |
| -------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `feat/…` → `staging` | **Squash** | La rama son diez commits de ida y vuelta; en `staging` interesa el cambio terminado, uno solo.             |
| `staging` → `main`   | **Rebase** | Acá sí interesa cada commit por separado: es el historial de producción, y es lo que se lee para revertir. |
