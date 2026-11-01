export function ChartPlaceholder() {
  return (
    <div className="flex h-64 items-center justify-center rounded border border-dashed border-slate-300">
      <div className="text-center">
        <div className="mb-2 text-3xl">📊</div>
        <p className="text-sm text-slate-500">Graphique à implémenter</p>
        <p className="text-xs text-slate-400">Utiliser Chart.js ou Recharts</p>
      </div>
    </div>
  );
}
