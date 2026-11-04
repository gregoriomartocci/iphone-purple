import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorDelPanel from "@/app/admin/error";

let ruta = "/admin/whatsapp";
vi.mock("next/navigation", () => ({ usePathname: () => ruta }));

function error(digest?: string) {
  return Object.assign(new Error("se rompió la tarjeta"), { digest });
}

afterEach(() => {
  ruta = "/admin/whatsapp";
  vi.restoreAllMocks();
});

describe("ErrorDelPanel", () => {
  it("reintenta con retry", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    render(<ErrorDelPanel error={error()} retry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("desde otra sección ofrece volver al resumen", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorDelPanel error={error()} retry={vi.fn()} />);

    expect(screen.getByRole("link", { name: /ir al resumen/i })).toHaveAttribute(
      "href",
      "/admin"
    );
  });

  it("si falla el resumen no ofrece volver a él", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    ruta = "/admin";
    render(<ErrorDelPanel error={error()} retry={vi.fn()} />);

    expect(screen.queryByRole("link", { name: /ir al resumen/i })).toBeNull();
    expect(screen.getByRole("link", { name: /ver la tienda/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("muestra el código del error para poder buscarlo en los registros", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorDelPanel error={error("888952192")} retry={vi.fn()} />);

    expect(screen.getByText(/888952192/)).toBeInTheDocument();
  });
});
