# iPhone Purple — Ficha técnica del proyecto

Documento de referencia con los datos verificados del repositorio, más un
prompt listo para pegarle a un agente con navegador (la extensión de Claude
para Chrome) para que saque las capturas y cargue el proyecto en LinkedIn.

---

## Parte 1 — Ficha técnica

### Identidad

|                         |                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Nombre**              | iPhone Purple                                                                                   |
| **Qué es**              | Tienda online y panel de gestión para una casa de venta de equipos Apple en La Plata, Argentina |
| **Sitio en producción** | https://iphone-purple.vercel.app                                                                |
| **Repositorio**         | https://github.com/gregoriomartocci/iphone-purple                                               |
| **Estado**              | En producción con datos de demostración; pendiente conectar la base real                        |

### El problema que resuelve

Los proveedores mandan sus listas de precios por WhatsApp, los clientes
consultan por WhatsApp, y el stock cambia todos los días. Cada lista se cargaba
a mano, así que el catálogo publicado nunca coincidía con lo que había en el
mostrador.

El proyecto ataca las dos puntas: un sitio donde el cliente ve stock real y
compra sin fricción, y un panel donde el local pega el mensaje del proveedor y
sale publicado con el margen aplicado.

### Stack

| Capa          | Tecnología                                         | Versión   |
| ------------- | -------------------------------------------------- | --------- |
| Framework     | Next.js (App Router, Server Components, Turbopack) | 16.3      |
| UI            | React                                              | 19.2      |
| Lenguaje      | TypeScript en modo estricto                        | 5         |
| Estilos       | Tailwind CSS con tokens por variable CSS           | 4         |
| Base de datos | Supabase (PostgreSQL + RLS + Storage)              | SDK 2.108 |
| Autenticación | Auth.js / NextAuth                                 | 5 (beta)  |
| Validación    | Zod                                                | 4.4       |
| IA            | SDK de Anthropic — salida estructurada con esquema | 0.106     |
| Tests         | Vitest + Testing Library + jsdom                   | 4.1       |
| Calidad       | ESLint 9, Prettier 3, Husky 9, lint-staged         | —         |
| CI            | GitHub Actions: calidad, build y seguridad         | —         |
| Hosting       | Vercel                                             | —         |

### Números

|                          |                                          |
| ------------------------ | ---------------------------------------- |
| Rutas públicas           | 9                                        |
| Secciones del panel      | 8                                        |
| Componentes              | 40                                       |
| Tests                    | 79, en 4 archivos                        |
| Catálogo de demostración | 54 productos · 101 variantes · 11 marcas |
| Fotos de producto        | 55, en 24 productos                      |

### Funcionalidades

**Sitio público**

- Catálogo con búsqueda y filtros por URL, renderizados en el servidor: un
  filtro aplicado se comparte por link y sobrevive al refresh.
- Filtros progresivos: marca → categoría → modelo → condición → grado →
  batería → capacidad → color. Cada opción muestra cuántos equipos la cumplen.
- Ficha de producto con ficha técnica completa en cinco bloques, comparación
  entre generaciones, respaldos del negocio y preguntas frecuentes.
- Carrito con checkout **sin necesidad de crear cuenta**, que se confirma por
  WhatsApp con el pedido ya escrito.
- Cotizador de Plan Canje en cuatro pasos que devuelve el valor de toma y la
  diferencia a pagar.
- Reparaciones, blog y contacto.
- SEO orientado a búsqueda local: datos estructurados de tienda, producto,
  migas de pan y preguntas frecuentes; sitemap; imagen de compartir generada en
  el build.

**Panel de gestión**

- Importador de listas de WhatsApp: se pega el mensaje crudo, un modelo lo
  convierte en filas estructuradas validadas por esquema, se aplica el margen,
  se revisa fila por fila y se publica. El texto original queda archivado como
  historial auditable.
- Productos, proveedores, ventas con descuento de stock, leads del canje,
  reparaciones y blog.

### Decisiones de arquitectura destacables

**Capa de datos con una única puerta de entrada.** Todo pasa por
`lib/data/index.ts`, que decide entre PostgreSQL y una semilla local según haya
credenciales. Ninguna página sabe cuál está activo. Consecuencias: el sitio
corre completo sin configurar nada, los tests no necesitan base de datos, y
conectar la base después no obligó a tocar ni una vista.

**El filtrado y el orden viven en la capa de datos, no en SQL**, para que el
comportamiento sea idéntico en los dos modos.

**Las facetas se derivan del stock real.** Solo se ofrecen tramos de batería y
capacidades que existen, y la capacidad aparece recién con un modelo elegido:
"64 GB" no significa lo mismo en un iPhone que en una consola.

**Las réplicas están aisladas por diseño.** El listado por defecto sirve solo
originales, la etiqueta se muestra siempre, y el ahorro nunca se calcula
comparando una réplica contra un producto original. Es una regla con
consecuencias legales y está cubierta por tests.

**La clave de servicio de la base no puede filtrarse al navegador**: el módulo
que la usa está marcado con `server-only`. Más cabeceras de seguridad y CSP.

### Qué mostrar en las capturas

| Pantalla          | URL                                                   | Por qué                                                |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Portada           | `/`                                                   | Foto a pantalla completa, identidad de marca           |
| Catálogo          | `/catalogo`                                           | Filtros progresivos con contadores, grilla de producto |
| Filtros aplicados | `/catalogo?marca=Apple&estado=seminuevo&grade=a-plus` | Que el filtro vive en la URL                           |
| Ficha de producto | `/catalogo/iphone-15-pro`                             | Galería, selector de variante, ficha técnica           |
| Plan Canje        | `/plan-canje`                                         | El cotizador, que es diferencial del negocio           |
| Contacto          | `/contacto`                                           | Tarjeta de datos y formulario que abre WhatsApp        |
| Móvil             | `/catalogo` a 390 px                                  | Una tarjeta por fila, filtros en panel lateral         |

---

## Parte 2 — Prompt para el agente con navegador

Copiar desde acá hasta el final y pegarlo en la extensión.

---

Necesito que hagas dos tareas seguidas: sacar capturas de un sitio y cargar el
proyecto en mi perfil de LinkedIn.

**Tarea 1 — Capturas**

Abrí https://iphone-purple.vercel.app y sacá capturas de estas pantallas, en
este orden. Usá una ventana de escritorio de 1440 px de ancho salvo donde diga
otra cosa, esperá a que carguen las imágenes antes de capturar, y guardá cada
una con el nombre que indico:

1. `01-portada` — la home (`/`), arriba de todo, con la foto de fondo visible.
2. `02-mas-vendidos` — la home, scrolleada hasta la sección "Los más vendidos".
3. `03-catalogo` — `/catalogo`, scrolleado unos 400 px para que se vean juntos
   el panel de filtros de la izquierda y la grilla de productos.
4. `04-filtros` — `/catalogo?marca=Apple&estado=seminuevo&grade=a-plus`, mismo
   scroll, para que se note que los filtros quedan en la URL.
5. `05-producto` — `/catalogo/iphone-15-pro`, arriba de todo, con la foto del
   equipo y el bloque de precio.
6. `06-ficha-tecnica` — la misma página, scrolleada hasta la sección "Ficha
   técnica".
7. `07-plan-canje` — `/plan-canje`, scrolleado hasta que se vea el cotizador.
8. `08-contacto` — `/contacto`, scrolleado hasta la tarjeta de datos.
9. `09-movil` — `/catalogo` con la ventana en 390 px de ancho, scrolleada para
   que se vean las tarjetas de producto.

**Tarea 2 — Cargar el proyecto en LinkedIn**

Entrá a mi perfil de LinkedIn, andá a la sección Proyectos y agregá uno nuevo
con estos datos exactos:

- **Nombre del proyecto:** `iPhone Purple — E-commerce y panel de gestión`
- **URL del proyecto:** `https://iphone-purple.vercel.app`
- **Descripción:** pegá exactamente este texto:

```
Tienda online y panel de gestión para una casa de venta de equipos Apple en La Plata.

El problema: los proveedores mandan sus listas de precios por WhatsApp, los clientes consultan por WhatsApp y el stock cambia todos los días. Cada lista se cargaba a mano y el catálogo publicado nunca coincidía con lo que había en el mostrador.

La solución ataca las dos puntas del mostrador:

Para quien compra — catálogo con stock real, búsqueda y filtros progresivos por URL (marca, categoría, modelo, condición, batería, capacidad), ficha técnica completa por modelo, comparación entre generaciones, cotizador de Plan Canje y carrito con checkout sin necesidad de crear cuenta.

Para el local — panel donde se pega el mensaje crudo del proveedor y un modelo de Claude lo convierte en filas estructuradas con salida validada por esquema; se aplica el margen, se revisa y se publica. Además registra ventas, descuenta stock y guarda cada importación con su texto original como historial auditable.

Decisiones de arquitectura que vale la pena destacar:

- Capa de datos con una única puerta de entrada que decide entre PostgreSQL y una semilla local. El sitio corre completo sin configurar nada, los tests no necesitan base de datos, y conectar la base más adelante no obligó a tocar ni una vista.

- El filtrado y el orden viven en la capa de datos, no en SQL, para que el comportamiento sea idéntico en los dos modos.

- Las facetas de filtro se derivan del stock real: solo se ofrecen tramos de batería y capacidades que existen, y la capacidad aparece recién con un modelo elegido, porque "64 GB" no significa lo mismo en un iPhone que en una consola.

- Las réplicas están aisladas por diseño y la regla está cubierta por tests: el listado por defecto sirve solo originales y el ahorro nunca se calcula comparando una réplica contra un producto original.

Next.js 16, React 19, TypeScript, Tailwind v4, Supabase, Auth.js, SDK de Anthropic, Vitest, GitHub Actions y Vercel. SEO orientado a búsqueda local con datos estructurados, y 79 tests sobre las reglas de negocio que no pueden fallar en silencio.
```

- **Aptitudes asociadas:** agregá las que LinkedIn te deje de esta lista, en
  este orden de prioridad: Next.js, React, TypeScript, Tailwind CSS,
  PostgreSQL, Supabase, Server Components, SEO, Testing, CI/CD, Vercel,
  UI/UX.

- **Multimedia:** subí las capturas `01-portada`, `03-catalogo`,
  `05-producto`, `04-filtros` y `09-movil`, en ese orden.

Antes de guardar, mostrame cómo quedó el formulario completo para que lo
revise. No publiques nada en el feed: por ahora solo cargá el proyecto en el
perfil.
