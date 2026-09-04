import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./BrandIcons";
import { cn } from "@/lib/utils";

type Props = {
  number: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
  /** `solid` para CTAs primarios, `outline` para secundarios, `bare` para links sueltos. */
  variant?: "solid" | "outline" | "bare";
  /** Para cerrar el menú móvil al tocar el link, por ejemplo. */
  onClick?: () => void;
};

const VARIANTS = {
  solid:
    "bg-ink text-white hover:bg-ink/85 px-6 h-12 rounded-full inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors",
  outline:
    "border border-line text-foreground hover:border-foreground/35 px-6 h-12 rounded-full inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors",
  bare: "inline-flex items-center gap-2 text-sm text-foreground transition-colors",
} as const;

export function WhatsAppLink({
  number,
  message,
  children,
  className,
  variant = "solid",
  onClick,
}: Props) {
  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(VARIANTS[variant], className)}
    >
      <WhatsAppIcon className="size-4 shrink-0" />
      {children}
    </a>
  );
}

export { WhatsAppIcon };
