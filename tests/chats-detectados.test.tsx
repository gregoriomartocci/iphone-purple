import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ChatsDetectados } from "@/components/admin/ChatsDetectados";
import type { AutorDetectado } from "@/lib/whatsapp/sincronizar";

const guardar = vi.fn();
vi.mock("@/app/admin/actions", () => ({
  saveSupplierAction: (...args: unknown[]) => guardar(...args),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function autor(p: Partial<AutorDetectado> = {}): AutorDetectado {
  return {
    telefono: "5492211234567",
    comparable: "11234567",
    nombre: "Fran",
    chats: ["comunidad iCell Oeste"],
    mensajes: 9,
    listas: 3,
    ultimaLista: new Date().toISOString(),
    proveedor: null,
    proveedorInactivo: false,
    ...p,
  };
}

beforeEach(() => guardar.mockReset());

describe("ChatsDetectados", () => {
  it("ofrece cargar a quien manda listas y no está cargado", () => {
    render(<ChatsDetectados autores={[autor()]} supabaseReady />);
    expect(screen.getByRole("button", { name: /cargar como proveedor/i })).toBeEnabled();
  });

  /**
   * A quien ya está mapeado no se le vuelve a ofrecer: cargarlo de nuevo
   * crearía un segundo proveedor con el mismo teléfono, y las listas
   * emparejarían con cualquiera de los dos.
   */
  it("no lo ofrece a quien ya está mapeado", () => {
    render(
      <ChatsDetectados
        autores={[
          autor({
            proveedor: {
              id: "prov-1",
              name: "Apple Touch mayorista",
              phone: "2211234567",
              defaultMarginPct: 18,
              isActive: true,
            },
          }),
        ]}
        supabaseReady
      />
    );

    expect(screen.queryByRole("button", { name: /cargar como proveedor/i })).toBeNull();
    expect(screen.getByText("Apple Touch mayorista")).toBeInTheDocument();
  });

  it("no lo ofrece a quien nunca mandó una lista", () => {
    render(
      <ChatsDetectados
        autores={[autor({ listas: 0, ultimaLista: null })]}
        supabaseReady
      />
    );
    expect(screen.queryByRole("button", { name: /cargar como proveedor/i })).toBeNull();
  });

  it("apaga el botón si no hay base donde guardar", () => {
    render(<ChatsDetectados autores={[autor()]} supabaseReady={false} />);
    expect(screen.getByRole("button", { name: /cargar como proveedor/i })).toBeDisabled();
  });

  /**
   * Lo que de verdad importa de esta pantalla: que el proveedor quede cargado
   * con el teléfono que WhatsApp entregó, sin que nadie lo tipee. Un dígito
   * mal y sus listas dejan de emparejar para siempre, en silencio.
   */
  it("guarda el teléfono exacto que vino de WhatsApp", async () => {
    guardar.mockResolvedValue({ ok: true });

    render(<ChatsDetectados autores={[autor()]} supabaseReady />);
    fireEvent.click(screen.getByRole("button", { name: /cargar como proveedor/i }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(guardar).toHaveBeenCalledWith(
        expect.objectContaining({ phone: "5492211234567", name: "Fran" })
      )
    );
  });

  it("precarga el nombre del chat cuando WhatsApp no dio uno", () => {
    render(
      <ChatsDetectados
        autores={[autor({ nombre: null, chats: ["Mundo Wholesale"] })]}
        supabaseReady
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cargar como proveedor/i }));
    expect(screen.getByDisplayValue("Mundo Wholesale")).toBeInTheDocument();
  });

  it("no deja guardar un proveedor sin nombre", () => {
    render(<ChatsDetectados autores={[autor()]} supabaseReady />);

    fireEvent.click(screen.getByRole("button", { name: /cargar como proveedor/i }));
    fireEvent.change(screen.getByDisplayValue("Fran"), { target: { value: "  " } });

    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("muestra en qué chats aparece, que es como se lo reconoce", () => {
    render(
      <ChatsDetectados
        autores={[autor({ chats: ["comunidad iCell Oeste", "Fran mayorista"] })]}
        supabaseReady
      />
    );

    const fila = screen.getByRole("listitem");
    expect(
      within(fila).getByText(/comunidad iCell Oeste · Fran mayorista/)
    ).toBeInTheDocument();
  });

  /**
   * Un proveedor desactivado a propósito no es uno que falte cargar: volver a
   * cargarlo dejaría dos filas con el mismo teléfono.
   */
  it("no ofrece cargar a un proveedor que ya existe pero está desactivado", () => {
    render(
      <ChatsDetectados autores={[autor({ proveedorInactivo: true })]} supabaseReady />
    );

    expect(screen.queryByRole("button", { name: /cargar como proveedor/i })).toBeNull();
    expect(screen.getByText(/cargado pero desactivado/i)).toBeInTheDocument();
  });

  it("dice qué hacer cuando todavía no entró ningún mensaje", () => {
    render(<ChatsDetectados autores={[]} supabaseReady />);
    expect(screen.getByText(/todavía no juntó mensajes/i)).toBeInTheDocument();
  });
});
