import { CaptchaGuard } from "@/components/auth/captcha-guard";
import { LobbyClient } from "@/components/game/lobby-client";
import { LobbyInfo } from "@/components/game/lobby-info";
import { MainLayout } from "@/components/layout/main-layout";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: game } = await supabase
    .from("games")
    .select("id, status, host_id")
    .eq("code", code)
    .single();

  if (!game) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isHost = user?.id === game.host_id;

  return (
    <MainLayout className="items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto gap-8 p-4">
        <h1 className="font-display text-theme text-3xl md:text-4xl text-center drop-shadow-[4px_4px_0_#000000]">
          SALLE D&apos;ATTENTE
        </h1>

        <div
          className={`grid grid-cols-1 ${
            isHost ? "lg:grid-cols-2" : ""
          } gap-8 items-center w-full transition-all duration-500`}
        >
          {isHost && (
            <div className="flex justify-center order-2 lg:order-1 animate-in fade-in slide-in-from-left-4">
              <LobbyInfo code={code} />
            </div>
          )}

          <div
            className={`flex justify-center w-full order-1 ${
              isHost ? "lg:order-2" : ""
            }`}
          >
            <CaptchaGuard>
              <LobbyClient code={code} gameId={game.id} hostId={game.host_id} />
            </CaptchaGuard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
