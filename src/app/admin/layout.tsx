import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r-4 border-black p-4 hidden md:flex flex-col bg-card shrink-0 h-full overflow-y-auto">
        <h1 className="text-xl font-bold mb-8 font-pixel text-primary uppercase tracking-widest">
          Admin Panel
        </h1>
        <nav className="space-y-4 flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-black transition-all font-vt323 text-2xl"
          >
            <LayoutDashboard className="w-6 h-6" />
            Reports
          </Link>
          <Link
            href="/admin/dictionary"
            className="flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-black transition-all font-vt323 text-2xl"
          >
            <BookOpen className="w-6 h-6" />
            Dictionary
          </Link>
        </nav>

        <Link
          href="/"
          className="flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground mt-auto font-vt323 text-xl"
        >
          <LogOut className="w-5 h-5" />
          Back to Game
        </Link>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto h-full">{children}</main>
    </div>
  );
}
