import { cn } from "@/lib/utils";

/**
 * Onde lumineuse décorative : donne de la profondeur aux fonds sans image ni
 * coût de rendu (deux dégradés radiaux, flou statique).
 */
export function Aura({
  className,
  tone = "lavender",
  drift,
}: {
  className?: string;
  tone?: "lavender" | "coral" | "blush";
  drift?: "slow" | "slower";
}) {
  const tones = {
    lavender: "bg-lavender-300/25",
    coral: "bg-coral-500/22",
    blush: "bg-blush-500/16",
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "aura",
        tones[tone],
        drift === "slow" && "float-slow",
        drift === "slower" && "float-slower",
        className,
      )}
    />
  );
}

/** Titre de section : étiquette, titre éditorial et action alignée. */
export function SectionTitle({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-xl leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/** Pastille d'information : un ton, une icône optionnelle, jamais colorée seule. */export function Pill({
  className,
  tone = "neutral",
  interactive,
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "neutral" | "primary" | "lavender" | "dark" | "glass";
  interactive?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200";
  const interactiveStyles = interactive
    ? "cursor-pointer hover:scale-105 active:scale-95"
    : "";

  const tones = {
    neutral: `${base} ${interactiveStyles} bg-ivory-100 text-graphite-300 hover:bg-ivory-200/60`,
    primary: `${base} ${interactiveStyles} bg-coral-100 text-coral-700 hover:bg-coral-200/60`,
    lavender: `${base} ${interactiveStyles} bg-lavender-100 text-lavender-700 hover:bg-lavender-200/60`,
    dark: `${base} ${interactiveStyles} bg-graphite-900/90 text-white`,
    glass: `${base} ${interactiveStyles} border border-white/10 bg-white/10 text-white backdrop-blur-md`,
  } as const;

  return (
    <span
      className={cn(
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Tuile d'illustration : l'emoji du contenu (catégorie, parcours, ambiance)
 * posé sur un dégradé teinté. Sans lui, il flotte et fait « placeholder ».
 */
export function EmojiTile({
  children,
  tone = "lavender",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "lavender" | "coral" | "graphite";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones = {
    lavender: "from-lavender-100 to-lavender-200/70",
    coral: "from-coral-100 to-coral-200/70",
    graphite: "from-ivory-100 to-ivory-200",
  } as const;

  const sizes = {
    sm: "size-9 rounded-xl text-lg",
    md: "size-12 rounded-2xl text-2xl",
    lg: "size-16 rounded-3xl text-3xl",
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] ring-1 ring-inset ring-white/10",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
