import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PostBody } from "@/components/site/PostBody";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { GENERAL_MESSAGE } from "@/lib/whatsapp";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Nota no encontrada" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings, posts] = await Promise.all([
    getPost(slug),
    getSettings(),
    getPosts(),
  ]);

  if (!post) notFound();

  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="shell py-8 sm:py-12">
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-ink inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="size-4" />
        Todas las notas
      </Link>

      <header className="mt-8 max-w-2xl">
        <time className="text-muted-foreground text-xs">
          {formatDate(post.publishedAt)}
        </time>
        <h1 className="mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {post.excerpt}
        </p>
        <p className="text-muted-foreground mt-4 text-sm">Por {post.author}</p>
      </header>

      {post.coverUrl && (
        <div className="bg-surface relative mt-10 aspect-16/9 overflow-hidden rounded-2xl">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-12">
        <PostBody body={post.body} />
      </div>

      <aside className="bg-surface mt-16 max-w-2xl rounded-2xl p-8">
        <h2 className="text-lg font-semibold">¿Te quedó alguna duda?</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Escribinos y te la respondemos sin compromiso, aunque no compres nada.
        </p>
        <WhatsAppLink
          number={settings.whatsappNumber}
          message={GENERAL_MESSAGE}
          className="mt-5"
        >
          Escribinos
        </WhatsAppLink>
      </aside>

      {more.length > 0 && (
        <section className="border-line mt-20 border-t pt-12">
          <h2 className="text-xl font-semibold">Seguí leyendo</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {more.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="group">
                <div className="bg-surface relative aspect-16/10 overflow-hidden rounded-xl">
                  {item.coverUrl && (
                    <Image
                      src={item.coverUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <h3 className="text-ink mt-4 leading-snug font-medium">{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
