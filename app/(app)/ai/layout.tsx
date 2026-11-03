import "./ai.css";

export default function AiLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="ai-shell relative">
      <div className="ai-aura" aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  );
}
