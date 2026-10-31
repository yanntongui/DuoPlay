import { GameRoom } from "@/components/game/game-room";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Partie en cours" };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-3">
          <Logo />
          <span className="font-mono text-[11px] text-muted-foreground">
            {token.slice(0, 8)}…
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-5">
        <GameRoom token={token} />
      </main>
    </div>
  );
}
