# Pedido de fotos

GENERADO por `npm run fotos:pedido`. Se regenera solo cada vez que entran
fotos nuevas, así no se piden las que ya tenemos.

Son **0 productos sin ninguna imagen** —hoy su ficha sale vacía— y
**0 equipos sellados** cuya foto principal es de ambiente y hay que
reemplazar.

Copiá todo lo que está entre las líneas y pegalo en la extensión de Claude en
Chrome. Cuando termine:

    npm run fotos:importar ~/Downloads

---

Buscá fotos de producto para una tienda de electrónica y descargalas a la
carpeta de descargas, cada una con el nombre exacto que se pide más abajo. No
hace falta crear una subcarpeta: si se intenta, el navegador termina metiendo
el nombre de la carpeta adentro del nombre del archivo y da lo mismo.

**Todo tiene que ser el producto NUEVO**, como sale de fábrica: sin rayas, sin
uso, sin desgaste. Y "nuevo" significa foto de estudio, no una foto de alguien
mostrando el equipo que le llegó: **nada de manos sosteniéndolo, nada de mesas,
nada de fondos de living o de depósito.** Si la única opción disponible es un
producto real fotografiado en un ambiente así, no sirve igual: hay que seguir
buscando la foto de fábrica.

**Cómo tiene que ser:** el producto solo sobre fondo BLANCO —blanco de
verdad, no gris ni negro—, foto de estudio, nítida, mínimo 1000 px de ancho.
Muchas marcas también publican la misma foto de prensa sobre fondo negro: esa
versión no sirve, aunque sea oficial y esté perfecta en todo lo demás. Preferí
siempre la variante en blanco del mismo producto. Celulares y tablets de
**dorso** (de frente son todos una pantalla negra igual). Notebooks abiertas en
tres cuartos. Relojes con la malla abierta.

**Dónde buscar,** en este orden: la sala de prensa del fabricante
(`<marca> press room` o `newsroom`), su página oficial del producto, un
distribuidor oficial.

**No sirve:**

- Fondo negro, gris o de color, aunque sea foto oficial de la marca.
- Dibujos, vectores o ilustraciones.
- Marcas de agua de otros sitios.
- Manos, personas, mesas, pisos, livings o depósitos de fondo.
- La caja en vez del producto, o el producto sin terminar de salir de la caja
  —tiene que verse el equipo entero, no el packaging—.
- Una foto donde el equipo queda cortado por el borde del cuadro: tiene que
  entrar completo, con margen alrededor.
- Una pantalla mostrando un menú de Ajustes o "Acerca de": eso es una captura
  de software, no una foto del producto.
- Equipos usados, rayados, o en exhibición con el cable antirrobo.

**Nombres:** hasta 3 por producto, con el nombre exacto de la lista y nada más
—sin prefijos ni sufijos—. La `-1` es la mejor y la que va al catálogo. Si de
alguno no encontrás nada que cumpla, dejalo sin archivo y avisá; prefiero eso a
una foto que no corresponde al modelo exacto.

**Antes de guardar cada archivo, abrí la imagen y miralo:** que sea el equipo
entero, no un recorte donde queda cortado por la mitad ni un primer plano de
una esquina; que no sea el logo de la tienda ni un ícono de la página; y que
mida más de 1000 px. La vez pasada volvieron el logo de Amazon Prime, una
miniatura de 78 px y un archivo de prueba de 1 píxel.

**Y miralo una vez más para el fondo, que es lo que más vuelve mal:** el fondo
tiene que ser blanco. Si alrededor del producto ves negro, gris oscuro o
cualquier color, esa foto no entra, por buena que sea el resto — se mide el
borde de la imagen al recibirla y se rechaza sola. Si del modelo sólo existe
la versión sobre negro, dejalo sin archivo y avisá.

**Una foto por producto, y distinta para cada uno.** No uses el mismo archivo
para dos productos aunque se parezcan mucho. La última vez volvió la misma
imagen para el iPad Air 11 M4, el 13 M3 y el 13 M4 —tres equipos de tamaños y
generaciones distintas—, y otra repetida para cuatro MacBook Pro, incluyendo
una de 14 puesta como si fuera la de 16. Si de un modelo concreto no
encontrás su foto propia, dejalo sin archivo y avisá. Una foto del modelo
equivocado es peor que no tener foto: el cliente compra mirando eso.

Lo mismo dentro de un producto: si pedís `-1` y `-2`, que sean dos tomas
distintas —dorso y perfil, abierta y cerrada—, no la misma imagen dos veces.

**Hacé la lista entera.** Son muchos productos: no pares en los primeros dos.
Si uno se resiste, anotalo y seguí con el siguiente.

---
