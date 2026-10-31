import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press sheen inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Action principale : dégradé rubis, reflet spéculaire, halo chaud. */
        default:
          "gradient-primary top-light text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-[1.06] hover:shadow-[0_16px_40px_-14px_rgb(225_29_72_/_0.65)]",
        /* Action secondaire : verre teinté or champagne, plus discrète. */
        secondary:
          "border border-lavender-300/30 bg-lavender-100 text-secondary-foreground hover:bg-lavender-200/80",
        /* Troisième niveau : hairline sur carte, effet de relief au survol. */
        outline:
          "border border-ivory-300 bg-card/90 text-foreground shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-lavender-300 hover:shadow-[var(--shadow-lift)]",
        ghost: "text-foreground hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
        /* Sur fond sombre : la lumière champagne devient l'action. */
        light:
          "border border-lavender-300/40 bg-lavender-300 text-accent-foreground shadow-[var(--shadow-glow-lavender)] hover:brightness-[1.04]",
        /* Action destructive : hairline rubis, jamais un aplat agressif. */
        destructive:
          "border border-coral-500/45 bg-coral-500/10 text-coral-200 hover:border-coral-500/70 hover:bg-coral-500/20",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-11 px-4 text-[13px]",
        lg: "h-14 px-8 text-base",
        icon: "size-12",
        iconSm: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
