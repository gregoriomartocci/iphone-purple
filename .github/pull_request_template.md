## Qué cambia

<!-- En una o dos líneas, en lenguaje de la tienda y no del código.
     "El cotizador ahora descuenta el canje del precio final", no
     "refactor de TradeInCalculator". -->

## Por qué

<!-- El problema que resuelve. Si viene de algo que pasó en el local
     —un precio mal publicado, un cliente que no encontró algo—, contalo:
     es lo que no se deduce del diff. -->

## Cómo lo probé

<!-- Qué miraste vos, además de lo que corre CI. Si toca algo visual,
     dejá la URL de preview de Vercel. -->

- [ ] Lo vi funcionando en la URL de preview
- [ ] Probado en teléfono (la mayoría del tráfico entra de ahí)

## Antes de publicar

- [ ] Va contra `staging`, no contra `main`
- [ ] Si toca fotos de `public/`, la ruta quedó permitida en `localPatterns`
      de `next.config.ts` (si no, el optimizador devuelve 400)
- [ ] Si suma variables de entorno, están cargadas en Vercel y documentadas
      en `.env.example`
