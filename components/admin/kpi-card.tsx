import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  className?: string;
}

export function KpiCard({ label, value, change, trend, className }: KpiCardProps) {
  const changeColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-slate-500";

  const changeIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "—";

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-4", className)}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <div className="mt-1 flex items-center gap-1 text-xs">
        <span className={changeColor}>
          {changeIcon} {change}
        </span>
        <span className="text-slate-400">vs période précédente</span>
      </div>
    </div>
  );
}
