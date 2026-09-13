/**
 * Reseña en video de cada producto: el ID del video de YouTube, por slug.
 *
 * Va al final de la ficha, después de la comparación y las preguntas. Es la
 * última cosa que mira quien ya se convenció con las fotos y el precio y
 * quiere escuchar a alguien que lo usó; por eso va al final y no arriba, donde
 * competiría con lo que vende.
 *
 * Son canales independientes, no del local: la ficha lo dice. Y se elige una
 * sola por producto, la mejor —en castellano si existe una buena, si no en
 * inglés—, no una lista: la persona vino a comprar, no a ver YouTube.
 *
 * Curado a mano, como los destacados y las réplicas. Se completa con la
 * extensión: se le pide una reseña por producto y se pega acá el ID (lo que
 * va después de `v=` en la dirección del video). Un producto sin entrada no
 * muestra la sección.
 */
export const RESENAS: Record<string, string> = {};
