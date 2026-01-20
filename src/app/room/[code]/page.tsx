import { LobbyHeader } from "@/components/game/lobby-header";
import { MainLayout } from "@/components/layout/main-layout";
import { createClient } from "@/lib/supabase/server";
import { Loader } from "@nsmr/pixelart-react";
import { notFound } from "next/navigation";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: game, error } = await supabase
    .from("games")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !game) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <h1 className="font-display text-theme text-3xl md:text-4xl text-center">
          SALLE D&apos;ATTENTE
        </h1>

        <LobbyHeader code={code} />

        <div className="text-center font-sans text-muted-foreground animate-pulse flex items-center gap-2">
          <Loader className="size-6 animate-spin" />
          En attente des joueurs...
        </div>
      </div>
    </MainLayout>
  );
}
