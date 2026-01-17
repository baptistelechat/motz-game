export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-12">
      <div className="flex flex-col gap-6 items-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-wider text-primary drop-shadow-[6px_6px_0_rgba(0,0,0,1)]">
          Motz Game
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed">
          A retro-style word game.
          <br />
          <span className="text-lg md:text-xl opacity-75 mt-2 block">
            Coming Soon...
          </span>
        </p>

        <div className="mt-8 p-8 border-pixel bg-card shadow-hard max-w-xl w-full">
          <h2 className="text-2xl font-display mb-6 text-card-foreground">
            System Status
          </h2>
          <ul className="text-left space-y-4 text-xl md:text-2xl">
            <li className="flex items-center gap-3">
              <span className="text-green-500">✔</span> Infrastructure Ready
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✔</span> Pixel-Pop Design System
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">⚡</span> Authentication
              (Anonymous) - Backlog
            </li>
          </ul>
        </div>
      </div>

      <footer className="fixed bottom-4 right-4"></footer>
    </main>
  );
}
