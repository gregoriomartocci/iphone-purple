import { Fragment } from "react";

/**
 * Render del cuerpo de una nota.
 *
 * Las notas usan un subconjunto mínimo de Markdown —`##` para subtítulos, `-` para
 * listas y `**negrita**`— que es todo lo que necesita este blog. Se arma con
 * elementos de React, no con HTML crudo, así que un texto cargado desde el panel
 * nunca puede inyectar markup en la página.
 */

function renderInline(text: string, keyPrefix: string) {
  // Partimos por **negrita** conservando los delimitadores en los índices impares.
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-${i}`} className="text-ink font-medium">
        {chunk}
      </strong>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{chunk}</Fragment>
    )
  );
}

export function PostBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/);

  return (
    <div className="max-w-2xl">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-ink mt-10 mb-3 text-xl font-semibold">
              {renderInline(trimmed.slice(3), `h${i}`)}
            </h2>
          );
        }

        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^-\s*/, ""));
          return (
            <ul key={i} className="my-5 space-y-2 pl-5">
              {items.map((item, j) => (
                <li
                  key={j}
                  className="text-muted-foreground marker:text-line list-disc leading-relaxed"
                >
                  {renderInline(item, `li${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-muted-foreground my-5 leading-relaxed">
            {renderInline(trimmed, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
