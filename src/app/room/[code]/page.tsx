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
    <MainLayout className="h-dvh overflow-hidden flex flex-col p-4 pt-16 md:pt-4">
      <div className="flex-none w-full flex justify-center mb-4">
        <h1 className="font-display text-theme text-3xl md:text-4xl text-center drop-shadow-[4px_4px_0_#000000]">
          SALLE D&apos;ATTENTE
        </h1>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto min-h-0 flex flex-col items-center justify-center gap-8">
        <div
          className={`grid grid-cols-1 ${
            isHost ? "lg:grid-cols-2" : ""
          } gap-8 items-center w-full h-full min-h-0 justify-items-center transition-all duration-500`}
        >
          {isHost && (
            <div className="flex justify-center w-full animate-in fade-in slide-in-from-left-4 lg:h-full lg:items-center">
              <LobbyInfo code={code} />
            </div>
          )}

          <div className="flex flex-col items-center justify-center w-full h-full min-h-0 md:h-auto md:max-h-full">
            <CaptchaGuard>
              <LobbyClient code={code} gameId={game.id} hostId={game.host_id} />
            </CaptchaGuard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
