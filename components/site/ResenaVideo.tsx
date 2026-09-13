import { RESENAS } from "@/lib/data/resenas";

/**
 * La reseña en video, al final de la ficha.
 *
 * Se incrusta desde youtube-nocookie.com: es el mismo reproductor, pero no
 * deja cookies de seguimiento hasta que la persona le da play. Y `loading
 * lazy`: el iframe pesa, y está al final de una página larga que la mayoría
 * no va a recorrer entera.
 *
 * Sin reseña cargada no se muestra nada: ni el título ni un hueco.
 */
export function ResenaVideo({ slug, nombre }: { slug: string; nombre: string }) {
  const id = RESENAS[slug];
  if (!id) return null;

  return (
    <section className="mt-16 sm:mt-20">
      <h2 className="text-2xl font-semibold sm:text-3xl">Reseña en video</h2>
      <p className="text-muted-foreground prosa mt-2">
        Es de un canal independiente, no del local: la opinión es de quien lo usó.
      </p>

      <div className="border-line mt-8 overflow-hidden rounded-2xl border bg-black shadow-sm">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={`Reseña de ${nombre}`}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full"
        />
      </div>
    </section>
  );
}
