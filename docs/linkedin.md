# Texto para el proyecto en LinkedIn

Para pegar en **Perfil → Proyectos → Agregar proyecto**. Está escrito para que
lo lea alguien que no conoce el negocio: primero qué problema resuelve, después
cómo, y recién al final la lista de tecnologías.

---

## Nombre del proyecto

```
iPhone Purple — E-commerce y panel de gestión
```

## URL del proyecto

```
https://iphone-purple.vercel.app
```

## Fechas

Asociar al período en que se trabajó. Si sigue activo, dejar "Actualmente estoy
trabajando en este proyecto".

---

## Descripción (versión larga, hasta 2.000 caracteres)

```
Tienda online y panel de gestión para una casa de venta de equipos Apple en La Plata.

El problema: los proveedores mandan sus listas de precios por WhatsApp, los clientes consultan por WhatsApp y el stock cambia todos los días. Cada lista se cargaba a mano y el catálogo publicado nunca coincidía con lo que había en el mostrador.

La solución ataca las dos puntas del mostrador:

Para quien compra — catálogo con stock real, búsqueda y filtros progresivos por URL (marca → categoría → modelo → condición → batería → capacidad), ficha técnica completa por modelo, comparación entre generaciones, cotizador de Plan Canje y carrito con checkout sin necesidad de crear cuenta.

Para el local — panel donde se pega el mensaje crudo del proveedor y un modelo de Claude lo convierte en filas estructuradas con salida validada por esquema; se aplica el margen, se revisa y se publica. Además registra ventas, descuenta stock y guarda cada importación con su texto original como historial auditable.

Decisiones de arquitectura que vale la pena destacar:

• Capa de datos con una única puerta de entrada que decide entre Postgres y una semilla local. El sitio corre completo sin configurar nada, los tests no necesitan base de datos, y conectar la base más adelante no obligó a tocar ni una vista.

• El filtrado y el orden viven en la capa de datos, no en SQL, para que el comportamiento sea idéntico en los dos modos.

• Las facetas de filtro se derivan del stock real: solo se ofrecen tramos de batería y capacidades que existen, y la capacidad aparece recién con un modelo elegido, porque "64 GB" no significa lo mismo en un iPhone que en una consola.

• Las réplicas están aisladas por diseño y la regla está cubierta por tests: el listado por defecto sirve solo originales y el ahorro nunca se calcula comparando una réplica contra un producto original.

SEO orientado a búsqueda local, con datos estructurados de tienda, y 79 tests sobre las reglas de negocio que no pueden fallar en silencio.
```

## Descripción (versión corta, por si el espacio queda ajustado)

```
Tienda online y panel de gestión para una casa de venta de equipos Apple en La Plata.

Catálogo con stock real y filtros progresivos por URL, ficha técnica completa por modelo, cotizador de Plan Canje y checkout sin necesidad de cuenta. Del lado del negocio, un panel donde se pega la lista que el proveedor manda por WhatsApp y un modelo de Claude la convierte en filas estructuradas para revisar, aplicarles margen y publicar.

La capa de datos tiene una única puerta de entrada que decide entre Postgres y una semilla local: el sitio corre completo sin configurar nada y los tests no necesitan base de datos. Las facetas de filtro se derivan del stock real, y las reglas de negocio que no pueden fallar en silencio están cubiertas por 79 tests.

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Supabase · Auth.js · SDK de Anthropic · Vitest · GitHub Actions · Vercel
```

---

## Aptitudes a asociar al proyecto

Conviene cargarlas como skills del proyecto: LinkedIn las usa para las
búsquedas de recruiters.

```
Next.js · React · TypeScript · Tailwind CSS · PostgreSQL · Supabase ·
Diseño de API · Server Components · SEO · Testing · CI/CD · Vercel ·
Integración de LLMs · Diseño de producto · UI/UX
```

---

## Capturas

Las nueve de `docs/capturas/` están listas para subir. Orden sugerido, que
cuenta la historia de arriba abajo:

1. `01-portada.png` — la portada completa
2. `03-catalogo.png` — el catálogo con los filtros a la vista
3. `05-producto.png` — la ficha de producto
4. `04-filtros.png` — filtros aplicados
5. `09-movil.png` — la vista en teléfono

---

## Post para el feed (opcional)

Un proyecto cargado sin post rinde bastante menos: el proyecto queda en el
perfil, el post es lo que circula.

```
Terminé el sitio de iPhone Purple, una casa de venta de equipos Apple en La Plata.

El problema no era técnico al principio: los proveedores mandan las listas de precios por WhatsApp, y cargarlas a mano hacía que el catálogo publicado nunca coincidiera con lo que había en el mostrador.

Así que el sitio tiene dos caras. La que ve el cliente es un catálogo con stock real, filtros que se comparten por link, ficha técnica completa y checkout sin obligarlo a crear una cuenta. La que ve el local es un panel donde se pega el mensaje del proveedor tal cual llegó y sale convertido en filas para revisar, ponerles margen y publicar.

Lo que más me gustó resolver: que el sitio arranque completo sin configurar nada. Toda la lectura pasa por una sola puerta que decide entre la base de datos y una semilla local, así que se puede desarrollar sin levantar nada, los tests corren sin base, y conectar la base después no obligó a tocar una sola vista.

Next.js 16, React 19, TypeScript, Tailwind v4, Supabase y el SDK de Anthropic para interpretar las listas.

→ https://iphone-purple.vercel.app
```
