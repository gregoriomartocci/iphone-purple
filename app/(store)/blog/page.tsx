import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/data";
import { PageHero, PAGE_PHOTOS } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Notas",
  description:
    "Guías y novedades sobre equipos Apple: comparativas, cómo revisar un usado, baterías y Plan Canje.",
};

export const revalidate = 3600;

/** "2026-08-18" → "18 de agosto de 2026", sin sorpresas de zona horaria. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
        title="Notas"
        subtitle="Lo que aprendimos vendiendo y reparando equipos, contado sin vueltas."
        image={PAGE_PHOTOS.blog}
      />

      <div className="shell py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-muted-foreground mt-16">
            Todavía no publicamos ninguna nota.
          </p>
        ) : (
          <>
            <Link href={`/blog/${lead.slug}`} className="group mt-14 block">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div className="bg-surface relative aspect-16/10 overflow-hidden rounded-2xl">
                  {lead.coverUrl && (
                    <Image
                      src={lead.coverUrl}
                      alt={lead.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div>
                  <time className="text-muted-foreground text-xs">
                    {formatDate(lead.publishedAt)}
                  </time>
                  <h2 className="text-foreground mt-2 text-2xl leading-snug font-semibold sm:text-3xl">
                    {lead.title}
                  </h2>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {lead.excerpt}
                  </p>
                  <span className="text-purple mt-4 inline-block text-sm">Leer nota</span>
                </div>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="border-line mt-20 grid gap-10 border-t pt-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <div className="bg-surface relative aspect-16/10 overflow-hidden rounded-xl">
                      {post.coverUrl && (
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 350px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <time className="text-muted-foreground mt-4 block text-xs">
                      {formatDate(post.publishedAt)}
                    </time>
                    <h2 className="text-foreground mt-1.5 leading-snug font-medium">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
