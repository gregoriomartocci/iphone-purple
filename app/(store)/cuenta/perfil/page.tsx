"use client";

import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Bell, Shield, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres"),
  phone: z.string().min(8, "Ingresá un teléfono válido"),
  email: z.string().email("Email inválido"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
    },
  });

  const onSubmit = (_data: ProfileForm) => {
    setSaved(true);
    toast.success("Perfil actualizado");
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = session?.user?.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="bg-white min-h-screen pt-14">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#111]">Mi perfil</h1>
        <p className="text-[#666] text-sm mt-1 mb-6">Administrá tu información personal</p>

        <div className="space-y-4">
          {/* Avatar block */}
          <div className="bg-[#F3EEFF] rounded-2xl p-5 flex items-center gap-4 border border-[#E8E8FF] mb-6">
            <div className="bg-[#7B2FBE] text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-[#111] font-semibold">{session?.user?.name ?? "Usuario"}</p>
              <p className="text-[#666] text-sm">{session?.user?.email}</p>
            </div>
          </div>

          {/* Personal data */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 space-y-4">
            <h2 className="text-[#111] font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-[#7B2FBE]" />
              Datos personales
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-[#666] text-xs font-medium mb-1 block">Nombre completo</label>
                <input
                  {...register("full_name")}
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="text-[#666] text-xs font-medium mb-1 block">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-[#666] text-xs font-medium mb-1 block">Teléfono / WhatsApp</label>
                <input
                  {...register("phone")}
                  placeholder="+54 9 11 1234-5678"
                  className="border border-[#E8E8E8] bg-white rounded-xl h-10 px-3 text-sm text-[#111] placeholder:text-[#CCC] focus:border-[#7B2FBE] focus:outline-none w-full"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <button
                type="submit"
                className="bg-[#7B2FBE] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#6D28D9] transition-colors flex items-center gap-2"
              >
                {saved && <CheckCircle className="w-4 h-4" />}
                {saved ? "¡Guardado!" : "Guardar cambios"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 space-y-4">
            <h2 className="text-[#111] font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#7B2FBE]" />
              Notificaciones
            </h2>
            <div className="space-y-3">
              {[
                { label: "Actualizaciones de pedidos por email", defaultChecked: true },
                { label: "Ofertas y promociones", defaultChecked: true },
                { label: "Alertas de restock", defaultChecked: false },
                { label: "Newsletter semanal", defaultChecked: false },
              ].map((pref) => (
                <label key={pref.label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#666] text-sm">{pref.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={pref.defaultChecked}
                    className="accent-[#7B2FBE] w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 space-y-4">
            <h2 className="text-[#111] font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7B2FBE]" />
              Seguridad
            </h2>
            <button className="border border-[#E8E8E8] text-[#111] rounded-xl px-4 py-2 text-sm hover:bg-[#F5F5F5] transition-colors">
              Cambiar contraseña
            </button>
          </div>

          {/* Danger zone */}
          <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
            <h2 className="text-red-600 font-semibold flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4" />
              Zona de peligro
            </h2>
            <p className="text-[#666] text-sm mb-3">
              Eliminar tu cuenta es una acción permanente e irreversible.
            </p>
            <button className="border border-red-300 text-red-500 rounded-xl px-4 py-2 text-sm hover:bg-red-100 transition-colors">
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
