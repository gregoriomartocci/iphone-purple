# Pedido de fotos para la extensión de Claude en Chrome

La extensión navega y ve las páginas; yo desde el proyecto no puedo entrar a
los sitios de las marcas —Dyson y el pressbox de Motorola devuelven 403— pero
sí puedo mirar cada archivo que vuelva, descartar el que no sirva y publicarlo.

El circuito es este:

1. Corrés `npm run fotos:faltan` y copiás el listado.
2. Pegás el prompt de abajo con ese listado al final, en la extensión.
3. La extensión guarda todo en `~/Descargas/fotos-iphone-purple/`.
4. Me pasás la carpeta y yo la reviso, descarto lo que no sirve y la publico.

Lo importante es el **nombre del archivo**. El listado ya trae el nombre exacto
para cada producto. Sin eso vuelve una carpeta de "descarga (3).jpg" y hay que
abrir una por una para saber de qué equipo es.

---

## El prompt

```
Necesito juntar fotos de producto para el catálogo de una tienda de
electrónica. Descargalas a una carpeta llamada fotos-iphone-purple dentro de
Descargas.

Para cada producto de la lista del final, buscá en este orden y parás en el
primero que dé resultado:

1. La sala de prensa del fabricante ("<marca> press room", "<marca> newsroom",
   "<marca> media assets"). Es la mejor fuente: son imágenes publicadas para
   que las use quien vende el producto.
2. La página oficial del producto en el sitio del fabricante.
3. La ficha del producto en un distribuidor oficial de la marca.

QUÉ BUSCAR

- El producto solo, sobre fondo blanco o transparente, como sale de fábrica.
- Celulares y tablets: que se vea el DORSO. De frente es una pantalla negra y
  todos los modelos quedan iguales; es el error que más veces tuvimos que
  deshacer.
- Notebooks: abierta, en tres cuartos.
- Relojes: con la malla abierta en semicírculo.
- Si el producto tiene varios colores en stock, priorizá esos colores.
- Ancho mínimo 1000 px. Cuanto más grande, mejor.

QUÉ DESCARTAR SIN EXCEPCIÓN

- Marca de agua o logo de un sitio encima (GSMArena, MobileDokan,
  marketplaces). Aunque sea la única que encuentres.
- Dibujos, vectores y renders de aficionado. Ya publicamos veintidós por error:
  eran rectángulos negros con un marco de color, y dos traían texto inventado
  impreso en el dorso. Si parece una ilustración plana y no una foto, no va.
- Manos, personas, escritorios, cajas abiertas, ambientes de casa.
- Equipos en exhibición de una tienda: se les ve el cable con imán antirrobo.
- Etiquetas de código de barras pegadas al producto.
- Equipos con uso: rayas, pantalla partida, plástico amarillento.
- La caja en lugar del producto.

CÓMO GUARDAR CADA UNA

Con el nombre exacto que indica el listado. Si conseguís tres fotos del
iPhone 17, se llaman iphone-17-1.jpg, iphone-17-2.jpg y iphone-17-3.jpg, en
ese orden de preferencia: la -1 es la mejor, la que va a salir en la grilla.

Guardá hasta tres por producto. Si de alguno no encontraste nada que cumpla,
no inventes: dejalo sin archivo y anotalo al final de tu respuesta.

Cuando termines, decime cuántas bajaste de cada producto y de qué sitio salió
cada una.

Prefiero un "no encontré" honesto antes que una foto que no cumple. Una imagen
que no es del modelo exacto termina en alguien que recibió algo distinto de lo
que vio.

PRODUCTOS:
```

Y pegás abajo la salida de `npm run fotos:faltan`.

---

## Cuando me pases la carpeta

    npm run fotos:importar ~/Descargas/fotos-iphone-purple

Lee el nombre de cada archivo, lo asigna al producto, lo endereza, lo achica y
le saca los metadatos. Lo que no coincida con ningún producto queda aparte para
que lo miremos. Después reviso una por una y publicamos.
