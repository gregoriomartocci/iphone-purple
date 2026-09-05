# Criterio de fotos de producto

Esto es la regla completa, en un solo lugar. Nació de encontrar el mismo tipo
de error varias veces —una caja en vez del equipo, un fondo negro, una
captura de pantalla de Ajustes— y de tener que repetir cada vez por qué no
sirve. De acá en más, cualquier foto que se sume al catálogo —a mano, con la
extensión, o por el pipeline de proveedores— se mide contra esto.

## La regla en una frase

**Tiene que verse el equipo, no lo que lo rodea.** Ni la caja, ni el
depósito, ni una pantalla de software, ni un cartel de precio. El equipo,
entero, entrando en el cuadro.

## Según el estado del equipo

**Sellado (a estrenar):** foto de estudio. Producto solo, fondo blanco,
nítida, como sale de fábrica. Nada de manos sosteniéndolo, nada de mesas,
nada de ambientes de casa o de depósito. Un producto real fotografiado en un
living o un mostrador —aunque sea genuinamente nuevo y sin uso— no alcanza:
para sellado, si no hay una foto de fábrica, no hay foto. Es preferible la
ficha vacía a una que parece de segunda mano.

**Seminuevo (usado):** una foto real del equipo sirve. Puede estar arriba de
una mesa, o alguien sosteniéndolo con la mano — eso es honesto para un
usado, es lo que se va a entregar. Lo que sigue prohibido igual: la caja en
vez del equipo, el equipo en exhibición de una tienda con el cable
antirrobo, una pantalla de Ajustes, un cartel de precio, una etiqueta de
grading pegada y visible (del tipo "CPO: FAIL").

## Nunca, sea cual sea el estado

- **La caja en lugar del equipo.** Si la foto muestra el embalaje y no el
  producto —aunque el equipo se alcance a ver de reojo, aunque sea "el
  celular recién sacado de la caja" pero tapado por ella— no sirve. Tiene
  que verse el equipo, dominante en el cuadro.
- **Fondo negro, gris o de color en una foto de estudio.** Aunque sea foto de
  prensa oficial de la marca y esté perfecta en todo lo demás: siempre la
  variante en blanco.
- **El equipo cortado por el borde del cuadro.** Tiene que entrar entero, con
  margen. Ojo particular con fotos verticales angostas: la tarjeta del
  catálogo las recorta a cuadrado, y si el equipo ocupa casi todo el alto de
  la foto original, ese recorte le come una punta —típicamente el módulo de
  cámara arriba—. Antes de publicar una foto muy vertical, conviene simular
  ese recorte y mirarlo.
- **Una captura de pantalla de Ajustes, About o cualquier menú de software.**
  Eso es una captura, no una foto del producto.
- **Equipos en exhibición de tienda,** con el cable o el imán antirrobo
  enganchado.
- **Marcas de agua de otros sitios**, dibujos, vectores o ilustraciones que
  no son una foto real.

## Cómo verificar antes de publicar, no después

Este documento existe porque varias de estas fallas solo se ven mirando la
imagen entera, no el nombre del archivo. Antes de dar una foto por buena:

1. Abrirla en tamaño real, no solo la miniatura.
2. Preguntarse: ¿esto es el equipo, o es la caja / la pantalla / el fondo?
3. Si la foto es muy vertical (angosta), simular el recorte cuadrado que va a
   aplicar la tarjeta del catálogo antes de confiar en que "se ve bien".
4. Si hay dudas sobre el modelo exacto —Pro vs Pro Max, una generación contra
   la siguiente—, buscar una seña que lo confirme (el color, si es exclusivo
   de esa generación; una etiqueta legible) antes de publicar. Una foto
   correcta pero del modelo equivocado es peor que no tener foto.

## Si un producto "no existe", verificarlo antes de decirlo

El catálogo tiene equipos más nuevos que lo que sabe cualquier modelo de
lenguaje. Pasó con la MacBook Neo 13: Apple la anunció en marzo de 2026 y
acá se afirmó que no existía, que el nombre estaba mal y que había que
revisar la ficha —cuando la ficha estaba bien y el producto se vende—.

La regla, entonces: **si un producto del catálogo no suena conocido, eso no
es evidencia de nada.** Es más probable que sea posterior al corte de
conocimiento a que el negocio haya cargado mal un nombre. Antes de sugerir
que se corrija o se saque, hay que buscarlo en la web y confirmarlo contra
la página oficial del fabricante. Lo mismo vale para colores y variantes que
suenan raros: los de la MacBook Neo son Silver, Blush, Citrus e Indigo, que
no se parecen a ninguna notebook anterior de Apple, y son correctos.

## Cuando algo se ve mal después de corregido

Antes de asumir que la corrección no entró: **el archivo se sirve siempre por
la misma ruta** (`/productos/<slug>/1.jpg`), así que un cambio de contenido
bajo el mismo nombre puede quedar cacheado en el navegador de quien mira,
aunque el servidor ya esté sirviendo el archivo nuevo. Antes de reabrir el
caso, conviene:

- Pedirle a quien vio el problema un refresco forzado (Cmd/Ctrl + Shift + R,
  o probar en una ventana privada).
- Confirmar en el propio código: `ls public/productos/<slug>/` y mirar el
  archivo con el visor de imágenes.
- Si hay dudas de si el deploy ya llegó a producción, pedir el archivo en
  crudo (`curl` a la URL de Vercel) y compararlo por tamaño o hash contra el
  local, en vez de confiar en una captura de pantalla que puede ser vieja.
