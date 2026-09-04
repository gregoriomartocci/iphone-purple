# Prompt para que la extensión de Chrome junte las fotos que faltan

Este documento es para pegarle a la extensión de Claude en Chrome. Ella navega
y ve las páginas; yo, desde acá, no puedo entrar a los sitios de las marcas
—Dyson y el pressbox de Motorola me devuelven 403— pero sí puedo bajar,
mirar y descartar lo que ella encuentre.

Por eso la división del trabajo es esta: **la extensión junta URLs, yo bajo y
reviso.** No le pidas que guarde 27 archivos a mano; que te devuelva una lista
y el resto lo hago yo en un comando.

## El prompt

Copiá desde acá hasta el final del bloque:

```
Necesito juntar fotos de producto para el catálogo de una tienda de
electrónica. No descargues nada: quiero una lista de URLs directas a las
imágenes, que después bajo yo.

Para cada producto de la lista de abajo, buscá en este orden y parás en el
primero que dé resultado:

1. La sala de prensa o el newsroom del fabricante (buscá "<marca> press room",
   "<marca> newsroom", "<marca> media assets"). Es la mejor fuente: son
   imágenes que el fabricante publica para que las use quien vende el producto.
2. La página oficial del producto en el sitio del fabricante.
3. La ficha del producto en un distribuidor oficial de la marca.

Qué buscar, en concreto:

- El producto solo, sobre fondo blanco o transparente, como sale de fábrica.
- Para teléfonos y tablets: que se vea el DORSO. La foto de frente es una
  pantalla negra y todos los modelos quedan iguales.
- Para notebooks: abierta, en tres cuartos.
- Ancho mínimo 1000 px.

Qué descartar sin excepción:

- Cualquier imagen con marca de agua o logo de un sitio encima (GSMArena,
  MobileDokan, marketplaces). Aunque sea la única que encuentres.
- Manos, personas, escritorios, cajas abiertas, ambientes de casa.
- Equipos en exhibición de una tienda: se les ve el cable con imán antirrobo.
- Etiquetas de código de barras pegadas al producto.
- Equipos con uso: rayas, pantalla partida, plástico amarillento.
- Fotos de la caja en lugar del producto.

Devolveme una tabla de texto plano, una fila por imagen, con estas tres
columnas separadas por tabulaciones y nada más:

slug<TAB>url_de_la_imagen<TAB>pagina_de_donde_salio

Usá exactamente los slug que figuran en la lista. Podés devolver hasta tres
imágenes por producto; poné primero la mejor. Si de un producto no encontraste
nada que cumpla, escribí una fila con:

slug<TAB>SIN RESULTADO<TAB>qué probaste

Prefiero un "SIN RESULTADO" honesto antes que una foto que no cumple. Una
imagen que no es del modelo exacto es peor que no tener imagen: termina en
alguien que recibió algo distinto de lo que vio.

LISTA DE PRODUCTOS:
```

Y pegale abajo la lista que sale de correr:

```
npm run fotos:faltan
```

## Cuando te devuelva la tabla

Pegámela en el chat. Yo bajo cada URL, la miro una por una, descarto lo que no
cumpla y te digo cuáles entraron y cuáles no. Después corre el índice y quedan
publicadas.

## Lo que sigue siendo decisión tuya

Las fotos de una sala de prensa están publicadas para que las use quien vende
el producto. Las de la página de una marca o de un marketplace, no: son de
ellos, y usarlas en una tienda que cobra es exponerse a un reclamo. La
diferencia es real aunque las dos se vean igual de bien.

Decime con cuál de las dos querés que trabaje y sigo esa.
