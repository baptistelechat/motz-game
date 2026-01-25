import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <MainLayout className="items-center justify-center">
      <div className="flex flex-col items-center gap-8 text-center p-4">
        <h1 className="font-display text-6xl md:text-8xl text-destructive drop-shadow-[6px_6px_0_var(--border)] md:drop-shadow-[4px_4px_0_var(--border)]">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="font-display text-2xl md:text-3xl text-theme uppercase drop-shadow-[2px_2px_0_(--border)] md:drop-shadow-[4px_4px_0_(--border)]">
            PAGE INTROUVABLE
          </h2>
          <p className="text-base md:text-xl text-muted-foreground">
            Cette salle n&apos;existe pas ou a été détruite.
          </p>
        </div>
        <Button asChild size="xl" variant="default">
          <Link href="/">RETOUR AU MENU</Link>
        </Button>
      </div>
    </MainLayout>
  );
}
