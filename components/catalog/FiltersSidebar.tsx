"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = ["iPhone", "Samsung", "Motorola", "Xiaomi", "Accesorios", "Auriculares", "Fundas"];
const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Sony"];
const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const CONDITIONS = ["Nuevo", "Reacondicionado"];

interface FiltersProps {
  onClose?: () => void;
}

export function FiltersSidebar({ onClose }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll(name);
      if (current.includes(value)) {
        params.delete(name);
        current.filter((v) => v !== value).forEach((v) => params.append(name, v));
      } else {
        params.append(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const isActive = (name: string, value: string) => {
    return searchParams.getAll(name).includes(value);
  };

  const clearFilters = () => {
    router.push(pathname);
    onClose?.();
  };

  const hasFilters = searchParams.toString().length > 0;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">
      {children}
    </h3>
  );

  const FilterSection = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
    <div className={last ? "" : "border-b border-[#F0F0F0] pb-5 mb-5"}>
      {children}
    </div>
  );

  const ToggleGroup = ({
    title,
    paramName,
    options,
  }: {
    title: string;
    paramName: string;
    options: string[];
  }) => (
    <FilterSection>
      <SectionTitle>{title}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = isActive(paramName, opt.toLowerCase());
          return (
            <button
              key={opt}
              onClick={() =>
                router.push(`${pathname}?${createQueryString(paramName, opt.toLowerCase())}`)
              }
              className={`text-sm rounded-lg px-3 py-1.5 border transition-colors ${
                active
                  ? "bg-[#111] text-white border-[#111]"
                  : "text-[#666] border-[#E8E8E8] hover:border-[#999]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-5 mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999]">
          Filtros
        </span>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#7B2FBE] font-medium hover:underline underline-offset-4 mt-2"
            >
              Limpiar filtros
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#999] hover:text-[#111] transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <ToggleGroup title="Categoría" paramName="categoria" options={CATEGORIES} />
      <ToggleGroup title="Marca" paramName="marca" options={BRANDS} />

      {/* Price range */}
      <FilterSection>
        <SectionTitle>Precio (ARS)</SectionTitle>
        <div className="px-1">
          <Slider
            defaultValue={[0, 5000000]}
            min={0}
            max={5000000}
            step={50000}
            className="mb-3 [&_[role=slider]]:accent-[#7B2FBE]"
          />
          <div className="flex items-center justify-between text-xs text-[#666]">
            <span>$0</span>
            <span>$5.000.000</span>
          </div>
        </div>
      </FilterSection>

      <ToggleGroup title="Almacenamiento" paramName="storage" options={STORAGES} />
      <ToggleGroup title="Condición" paramName="condicion" options={CONDITIONS} />

      {/* Rating */}
      <FilterSection>
        <SectionTitle>Rating mínimo</SectionTitle>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-2.5">
              <Checkbox
                id={`rating-${r}`}
                checked={isActive("rating", r.toString())}
                onCheckedChange={() => {
                  router.push(
                    `${pathname}?${createQueryString("rating", r.toString())}`
                  );
                }}
                className="accent-[#7B2FBE] data-[state=checked]:bg-[#7B2FBE] data-[state=checked]:border-[#7B2FBE] border-[#E8E8E8]"
              />
              <Label htmlFor={`rating-${r}`} className="text-[#666] text-sm cursor-pointer">
                {"★".repeat(r)}{"☆".repeat(5 - r)} y más
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Stock only */}
      <FilterSection last>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="in-stock"
            checked={isActive("stock", "disponible")}
            onCheckedChange={() => {
              router.push(`${pathname}?${createQueryString("stock", "disponible")}`);
            }}
            className="accent-[#7B2FBE] data-[state=checked]:bg-[#7B2FBE] data-[state=checked]:border-[#7B2FBE] border-[#E8E8E8]"
          />
          <Label htmlFor="in-stock" className="text-[#666] text-sm cursor-pointer">
            Solo con stock disponible
          </Label>
        </div>
      </FilterSection>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-5 w-full bg-[#7B2FBE] text-white font-semibold rounded-xl py-3 text-sm hover:bg-[#6D28D9] transition-colors md:hidden"
        >
          Ver resultados
        </button>
      )}
    </aside>
  );
}
