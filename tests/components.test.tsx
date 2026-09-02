import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostBody } from "@/components/site/PostBody";
import { StockBadge } from "@/components/site/ProductCard";
import { formatARS, slugify } from "@/utils/format";

describe("StockBadge", () => {
  it("avisa cuando no hay stock", () => {
    render(<StockBadge stock={0} />);
    expect(screen.getByText("Sin stock")).toBeInTheDocument();
  });

  it("distingue una unidad de dos", () => {
    const { unmount } = render(<StockBadge stock={1} />);
    expect(screen.getByText("Última unidad")).toBeInTheDocument();
    unmount();

    render(<StockBadge stock={2} />);
    expect(screen.getByText("Últimas 2 unidades")).toBeInTheDocument();
  });

  it("con stock holgado no mete presión", () => {
    render(<StockBadge stock={12} />);
    expect(screen.getByText("En stock")).toBeInTheDocument();
  });
});

describe("PostBody", () => {
  it("convierte ## en subtítulos", () => {
    render(<PostBody body={"## Rendimiento\n\nUn párrafo."} />);
    expect(screen.getByRole("heading", { name: "Rendimiento" })).toBeInTheDocument();
  });

  it("arma listas a partir de guiones", () => {
    render(<PostBody body={"- uno\n- dos\n- tres"} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("resalta la negrita", () => {
    const { container } = render(<PostBody body="Texto con **algo** resaltado." />);
    expect(container.querySelector("strong")?.textContent).toBe("algo");
  });

  it("no interpreta HTML del cuerpo: lo muestra como texto", () => {
    // El cuerpo puede venir del panel; nunca debe poder inyectar markup.
    const { container } = render(
      <PostBody body={'<img src=x onerror="alert(1)"> y <b>negrita</b>'} />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(container.textContent).toContain("<img");
  });

  it("aguanta un cuerpo vacío", () => {
    const { container } = render(<PostBody body="" />);
    expect(container).toBeTruthy();
  });
});

describe("formato", () => {
  it("formatea pesos sin decimales", () => {
    const formatted = formatARS(1_250_000);
    expect(formatted).toContain("1");
    expect(formatted).not.toContain(",00");
  });

  it("slugify saca acentos, símbolos y espacios", () => {
    expect(slugify("iPhone 15 Pro Máx")).toBe("iphone-15-pro-max");
    expect(slugify("  Doble   espacio  ")).toBe("doble-espacio");
    expect(slugify("¿Qué onda?")).toBe("que-onda");
  });

  it("slugify produce algo usable como URL", () => {
    for (const input of ["iPhone 16 Pro Max", "MacBook Air M3", "AirPods Pro 2"]) {
      expect(slugify(input)).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
