import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";

const BUCKET = "images";
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["admin", "super_admin"].includes((session.user as { role?: string }).role ?? "")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string | null) ?? "products";

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP o AVIF." },
      { status: 400 }
    );
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    return NextResponse.json(
      { error: `El archivo supera el límite de ${MAX_SIZE_MB}MB` },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = form.get("name") as string | null;
  const fileName = name
    ? `${folder}/${name}.${ext}`
    : `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, arrayBuffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl, path: fileName }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    !["admin", "super_admin"].includes((session.user as { role?: string }).role ?? "")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { path } = await req.json();
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Falta el path del archivo" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
