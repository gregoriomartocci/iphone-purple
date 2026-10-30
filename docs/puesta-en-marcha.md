# Puesta en marcha

Los dos servicios que faltan para que el sitio deje de servir la semilla y
empiece a publicar stock real, con los prompts para que lo haga un agente con
navegador.

---

## Antes de empezar

### Va `schema.sql`, no va `seed.sql`

`seed.sql` son 73 productos de demostración: existe para que alguien que clona
el repo vea un catálogo lleno. Cargarlo en la base del negocio es llenarse de
equipos que no existen y después borrarlos a mano. **Solo `schema.sql`.**

### El orden importa

Primero el `schema.sql`, después las claves en `.env.local`. Al revés queda un
estado peor que el de hoy: con credenciales cargadas pero sin tablas, la
consulta falla, el sitio vuelve a la semilla —`lib/data/index.ts` lo hace a
propósito, para no quedarse en blanco— y el cartel de «catálogo de
demostración» **deja de aparecer**, porque da por hecho que hay base. Datos
falsos sin aviso.

### La `service_role` no se pega en ningún chat

De las tres claves, dos son públicas por diseño: `Project URL` y `anon public`
viajan al navegador en cada visita. La tercera, `service_role`, saltea RLS —es
la llave maestra de la base—. Copiala vos directo al `.env.local`, no la pases
por el chat de ninguna extensión ni la pegues en ningún lado que quede
guardado.

---

## Parte 1 — Prompt para Supabase

Copiar desde acá hasta donde dice FIN.

---

Necesito crear un proyecto de Supabase y dejar la base lista. Seguí los pasos
en orden; el orden importa y más abajo digo por qué.

**Regla para todo el trabajo:** cuando haya que ingresar credenciales, frená y
devolveme el control. Avisame, esperá a que yo lo resuelva, y seguí cuando te
diga.

**Tarea 1 — Crear el proyecto**

1. Entrá a https://supabase.com y hacé clic en entrar.
2. **FRENÁ ACÁ.** Avisame que llegaste al login y devolveme el control.
3. Ya adentro, creá un proyecto nuevo con estos datos:
   - **Nombre:** `iphone-purple`
   - **Región:** `South America (São Paulo)` — es la más cercana a Argentina y
     la que da menos latencia.
   - **Plan:** Free
4. Supabase va a generar una contraseña de base de datos y **la muestra una
   sola vez**. Avisame antes de seguir para que la guarde; si se pierde hay
   que regenerarla.
5. Esperá a que el proyecto termine de crearse. Puede tardar un par de
   minutos.

**Tarea 2 — Crear las tablas**

1. En el menú lateral, abrí **SQL Editor**.
2. Hacé clic en **New query**.
3. Te voy a pegar el contenido de un archivo llamado `schema.sql`. Pegalo tal
   cual en el editor, sin modificar ni una línea, y hacé clic en **Run**.
4. Decime exactamente qué respondió: si dice «Success» o si devolvió algún
   error, con el texto del error completo.

   > **No cargues ningún otro archivo.** Si en algún momento ves un `seed.sql`,
   > ignoralo: son datos de demostración y no los queremos en esta base.

**Tarea 3 — Verificar que las tablas estén**

1. Abrí **Table Editor** en el menú lateral.
2. Decime qué tablas aparecen listadas. Tendrían que estar al menos:
   `products`, `product_variants`, `product_images`, `suppliers`,
   `supplier_imports`, `sales`, `trade_ins`, `store_settings`.
3. Si falta alguna, avisame y no sigas.

**Tarea 4 — Las claves**

1. Andá a **Project Settings → API**.
2. Copiame estos dos valores, que son públicos y viajan al navegador igual:
   - **Project URL**
   - La clave **anon / public**
3. Hay una tercera clave, **service_role**. **No la copies ni me la pases.**
   Solo decime que está ahí y yo la voy a buscar por mi cuenta: saltea los
   permisos de la base y no quiero que quede escrita en ningún chat.

FIN

---

## Parte 2 — Prompt para Railway

Esto recién tiene sentido **después** de que Supabase esté andando: el lector
de WhatsApp necesita una base donde escribir.

Copiar desde acá hasta donde dice FIN.

---

Necesito desplegar un servicio en Railway a partir de un repositorio de
GitHub. Seguí los pasos en orden.

**Dos reglas para todo el trabajo:**

- Cuando haya que ingresar credenciales o datos de tarjeta, **frená y
  devolveme el control**.
- No inventes valores de configuración. Si algo no coincide con lo que dice
  este prompt, frená y contámelo.

**Tarea 1 — Crear el servicio**

1. Entrá a https://railway.app
2. **FRENÁ ACÁ** para que yo haga el login.
3. Railway pide un medio de pago para servicios que corren siempre. Si te lo
   pide, **FRENÁ** y avisame: lo cargo yo.
4. Creá un proyecto nuevo: **New Project → Deploy from GitHub repo** y elegí
   el repositorio `iphone-purple`.

**Tarea 2 — Que use el Dockerfile correcto**

Esto es lo que más fácil se pasa por alto: el repo tiene **dos** cosas
desplegables y nos interesa solo una.

1. Abrí **Settings** del servicio.
2. Buscá **Build** y poné como **Dockerfile Path**: `Dockerfile.whatsapp`
3. Confirmá que quedó escrito exactamente así, con la mayúscula y el punto.

**Tarea 3 — Variables de entorno**

En la pestaña **Variables**, agregá estas dos:

- `TOKEN_WHATSAPP` — pedime el valor, te lo paso yo. Es la clave con la que el
  panel le pide los mensajes; sin ella, cualquiera con la URL vería las listas
  de los proveedores.
- `DIAS` — valor `3`

**Tarea 4 — El volumen (sin esto hay que escanear el QR en cada reinicio)**

1. En el servicio, agregá un **Volume**.
2. Montalo exactamente en: `/datos`
3. Confirmame que quedó montado ahí.

**Tarea 5 — Desplegar y mostrarme el QR**

1. Lanzá el deploy.
2. Abrí los **Logs** del servicio y esperá. En algún momento va a aparecer un
   código QR dibujado con caracteres.
3. **Avisame apenas lo veas y dejá los logs abiertos.** El QR lo tengo que
   escanear yo con el teléfono, desde WhatsApp → Dispositivos vinculados, y
   caduca rápido.

**Tarea 6 — La URL**

1. En **Settings → Networking**, generá un dominio público si no lo tiene.
2. Copiame la URL (`https://algo.up.railway.app`).
3. Probá abrir esa URL con `/salud` al final y decime qué devuelve. Tendría
   que ser un JSON diciendo si está conectado y cuántos chats tiene — sin
   mostrar ningún mensaje.

FIN

---

## Después

Con las claves de Supabase y la URL de Railway:

1. Las tres de Supabase van a `.env.local` y a las variables de Vercel
   (Production).
2. `WHATSAPP_SERVIDOR_URL` y `WHATSAPP_SERVIDOR_TOKEN` también.
3. Recién ahí el cartel de «catálogo de demostración» se apaga solo, y el
   catálogo pasa a mostrar lo que haya en la base: al principio nada, hasta
   que entre la primera lista.
