import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="DuoPlay"
      className={cn("size-9", className)}
      {...props}
    >
      <circle cx="15" cy="20" r="11" fill="var(--color-lavender-400)" />
      <circle
        cx="25"
        cy="20"
        r="11"
        fill="var(--color-coral-500)"
        fillOpacity="0.85"
      />
      <path
        d="M20 27.5c-.4 0-.8-.15-1.1-.42l-3.6-3.3c-1.3-1.2-1.3-3.2 0-4.4 1.3-1.2 3.5-1.2 4.7.1 1.2-1.3 3.4-1.3 4.7-.1 1.3 1.2 1.3 3.2 0 4.4l-3.6 3.3c-.3.27-.7.42-1.1.42Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
}) {
  const markSize = size === "sm" ? "size-7" : "size-9";
  const wordSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markSize} />
      {showWordmark && (
        <span
          className={cn(
            "inline-flex items-baseline font-display font-semibold tracking-tight",
            wordSize,
          )}
        >
          Duo<span className="text-primary">Play</span>
          <span
            aria-hidden="true"
            className="ml-1 size-1.5 translate-y-[-0.35em] rounded-full bg-lavender-300 shadow-[0_0_10px_2px_rgb(226_184_135_/_0.55)]"
          />
        </span>
      )}
    </span>
  );
}
