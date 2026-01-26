import { GameClient } from "@/components/game/game-client";
import { MainLayout } from "@/components/layout/main-layout";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

interface GamePageProps {
  params: Promise<{ code: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: game } = await supabase
    .from("games")
    .select("id, status, host_id")
    .eq("code", code)
    .single();

  if (!game) {
    notFound();
  }

  if (game.status === "LOBBY") {
    redirect(`/room/${code}`);
  }

  return (
    <MainLayout className="h-dvh overflow-hidden flex flex-col p-4 pt-14">
      <GameClient gameId={game.id} currentUserId={user.id} />
    </MainLayout>
  );
}
