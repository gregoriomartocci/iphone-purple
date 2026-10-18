# Comprar y conectar el dominio

Cómo pasar de `iphone-purple.vercel.app` a `iphonepurple.com.ar`, y el prompt
para que lo haga un agente con navegador.

---

## Parte 1 — Lo que conviene saber antes

### El dominio elegido

`iphonepurple.com.ar`, **sin guion**. Al 2026-10-18 estaba libre, verificado
contra el whois oficial:

```bash
whois -h whois.nic.ar iphonepurple.com.ar
# El dominio no se encuentra registrado en NIC Argentina
```

Sin guion porque es el que ya asume el código —está como fallback en
`app/robots.ts`, `app/sitemap.ts`, los dos `layout.tsx` y
`app/(store)/checkout/actions.ts`— y porque se dicta de corrido por teléfono,
sin tener que aclarar «guion del medio», que para un local que vende por
WhatsApp pesa más que la simetría con el nombre del repo.

### NIC.ar no tiene editor de zona

Esto define todo el procedimiento. NIC Argentina **solo publica la delegación**
(los registros `NS`): no hay dónde cargar un registro `A` ni un `CNAME`.

Por eso la única vía para conectar con Vercel es **delegar a los nameservers de
Vercel**, y no la de «cargar el A record que te da el dashboard». De paso es la
mejor opción: Vercel emite y renueva el certificado solo, y los registros se
administran después desde Vercel.

### Requisitos que no se pueden saltear

| Qué       | Detalle                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| Identidad | CUIT/CUIL + Clave Fiscal **nivel 2 o superior**                                    |
| Dónde     | nic.ar, con login vía Trámites a Distancia (TAD)                                   |
| Plazo     | Se registra y renueva de a **1 año**                                               |
| Pago      | Tarjeta de crédito o PagoMisCuentas (acreditan en 24 h), o Rapipago (72 h hábiles) |

> **El dominio queda a nombre del CUIT que hace el trámite.** Si lo registrás
> con el tuyo, el dominio es tuyo y no del local. No está mal —es lo habitual
> mientras el proyecto lo llevás vos—, pero conviene que esté hablado, porque
> transferirlo después es otro trámite.

### Qué va a tener que hacer una persona

Dos momentos, y no hay forma de evitarlos:

1. **El login de Clave Fiscal.** Son credenciales fiscales con segundo factor.
2. **El pago.**

El prompt de abajo está escrito para que el agente haga todo lo demás y **pare**
en esos dos puntos.

---

## Parte 2 — Prompt para el agente con navegador

Copiar desde acá hasta el final y pegarlo en la extensión.

---

Necesito comprar un dominio en NIC Argentina y conectarlo a un proyecto de
Vercel. Son cuatro tareas en orden; no saltees ninguna ni cambies el orden,
porque cada una depende de la anterior.

**Dos reglas que valen para todo el trabajo:**

- Hay dos momentos donde **tenés que frenar y devolverme el control**: cuando
  haya que ingresar la Clave Fiscal de AFIP/ARCA, y cuando haya que pagar.
  Avisame, esperá a que yo lo resuelva, y seguí cuando te diga.
- No inventes valores de DNS. Los nameservers los vas a leer del dashboard de
  Vercel. Si lo que ves no coincide con lo que dice este prompt, frená y
  contámelo en vez de improvisar.

**Tarea 1 — Comprar el dominio en NIC.ar**

1. Entrá a https://nic.ar
2. Buscá `iphonepurple` en la zona `.com.ar` y confirmá que figure disponible.
   Si aparece ocupado, **frená acá y avisame**: no compres ninguna variante ni
   ninguna otra zona por tu cuenta.
3. Hacé clic en **Quiero registrarlo**.
4. Elegí la opción **N° de CUIT/CUIL y Clave Fiscal**.
5. **FRENÁ ACÁ.** Avisame que llegaste al login y devolveme el control para
   que ingrese la Clave Fiscal.
6. Ya dentro de Trámites a Distancia, hacé clic en **Registrar**.
7. Revisá que el dominio diga exactamente `iphonepurple.com.ar` y hacé clic en
   **Confirmar Trámite**.
8. Verificá los datos de facturación en **Tus datos** y el nombre del dominio
   en **Orden**.
9. **FRENÁ ACÁ.** Avisame que está todo listo para pagar y devolveme el
   control. No elijas medio de pago ni cargues datos de tarjeta.
10. Cuando te avise que el pago está hecho, confirmá que el dominio figure
    registrado y decime en cuánto tiempo dice que se acredita.

**Tarea 2 — Agregar el dominio al proyecto en Vercel**

1. Entrá a https://vercel.com/dashboard
2. Abrí el proyecto **iphone-purple**.
3. Andá a **Settings → Domains**.
4. Clic en **Add Domain**, escribí `iphonepurple.com.ar` y agregalo.
5. Si te ofrece agregar también `www.iphonepurple.com.ar`, **aceptá**. Quiero
   las dos, con `www` redirigiendo al dominio sin `www`.
6. Va a aparecer como mal configurado o pendiente. Es lo esperado en este
   punto: todavía no delegamos. Seguí igual.

**Tarea 3 — Habilitar el DNS de Vercel y leer los nameservers**

1. En Vercel, andá a la sección **Domains** del equipo (la de la barra
   lateral, no la de Settings del proyecto) y abrí `iphonepurple.com.ar`.
2. Buscá el botón **Enable Vercel DNS** y activalo.
3. Copiá los nameservers que te muestre. Deberían ser estos dos:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

   **Si Vercel te muestra otros valores, usá los que muestra Vercel y
   decímelo.** Los de arriba son lo documentado, pero manda el dashboard.

**Tarea 4 — Delegar el dominio en NIC.ar**

1. Volvé a https://nic.ar y entrá con el botón **INGRESO**.
2. Elegí **N° de CUIT/CUIL y Clave Fiscal**.
3. **FRENÁ ACÁ** si te vuelve a pedir la Clave Fiscal y devolveme el control.
4. En la lista de dominios, al lado de `iphonepurple.com.ar`, hacé clic en
   **Delegar**.
5. Clic en **Agregar una nueva delegación**.
6. Cargá los dos nameservers de Vercel que copiaste en la Tarea 3. Tienen que
   ser exactamente dos.

   > No uses la opción **Autodelegar**: esa es para servidores DNS que viven
   > dentro del propio dominio, que no es nuestro caso.

7. Clic en **Guardar**.
8. Clic en **Ejecutar Cambios**. Este paso es el que aplica la delegación: sin
   él no pasa nada aunque hayas guardado.

**Tarea 5 — Verificar y reportar**

1. Volvé a Vercel, a **Settings → Domains** del proyecto `iphone-purple`.
2. Mirá el estado de `iphonepurple.com.ar` y de `www.iphonepurple.com.ar`.
3. Probá abrir `https://iphonepurple.com.ar` en una pestaña nueva.

Al terminar, escribime un resumen con:

- Si el dominio quedó registrado y pagado, y cuándo se acredita.
- Los nameservers exactos que mostró Vercel.
- Si la delegación en NIC.ar quedó con el **Ejecutar Cambios** confirmado.
- El estado que muestra Vercel para cada uno de los dos dominios, con el texto
  literal del cartel.
- Si el sitio ya abre o todavía no.

Es normal que al principio no ande: la delegación puede tardar hasta 24-48 h
en propagarse, y el certificado se emite recién cuando Vercel ve la delegación
activa. Si no anda al toque, no toques nada más: reportá y esperamos.

---

## Parte 3 — Lo que falta hacer del lado del repo

Esto no lo hace el agente; va por PR cuando el dominio ya resuelva.

1. **Cargar `NEXT_PUBLIC_APP_URL` en Vercel**, en Production:

   ```bash
   vercel env add NEXT_PUBLIC_APP_URL production
   # valor: https://iphonepurple.com.ar
   ```

   Sin esto, el `sitemap.xml`, el `robots.txt`, las URLs canónicas y los datos
   estructurados siguen usando el fallback del código. Da la casualidad de que
   el fallback es el mismo dominio, así que no se rompe nada — pero dejarlo
   implícito significa que el día que cambie el dominio hay que tocar código en
   vez de una variable.

2. **Cargar `NEXTAUTH_URL`**, también en Production, con el mismo valor. Hoy en
   Vercel solo está `AUTH_SECRET`. Ojo acá: si `NEXTAUTH_URL` no coincide
   exactamente con el dominio desde el que entrás, el panel queda inaccesible
   —está explicado en `lib/auth.ts`—.

3. **Actualizar las URLs de la documentación**: `README.md` (el link «Ver el
   sitio en vivo» y el badge), `docs/ficha-proyecto.md` y `docs/linkedin.md`
   apuntan todos a `iphone-purple.vercel.app`.

4. **Revisar el canje y el checkout**, que arman URLs absolutas, una vez que el
   dominio esté activo.
