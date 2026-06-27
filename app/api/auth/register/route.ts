import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendWelcome } from "@/lib/email/resend";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name } = schema.parse(body);

    const supabase = await createAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: false,
    });

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      await sendWelcome(full_name, email);
    } catch {
      // Non-blocking — welcome email failure shouldn't block registration
    }

    return NextResponse.json({ userId: data.user?.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
