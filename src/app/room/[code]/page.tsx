import { CaptchaGuard } from "@/components/auth/captcha-guard";
import { DictionaryLoader } from "@/components/game/dictionary-loader";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: game } = await supabase
    .from("games")
    .select("id, status, host_id")
    .eq("code", code)
    .single();

  if (!game) {
    notFound();
  }

  const isHost = user?.id === game.host_id;

  return (
    <MainLayout className="h-dvh overflow-hidden flex flex-col p-4 pt-14">
      <DictionaryLoader />
      <div className="flex-1 w-full max-w-6xl mx-auto min-h-0 flex flex-col items-center justify-center gap-4 md:gap-8">
        <div
          className={`flex flex-col ${
            isHost ? "lg:grid lg:grid-cols-2" : ""
          } gap-4 md:gap-8 items-center w-full h-full min-h-0 justify-items-center transition-all duration-500`}
        >
          {isHost && (
            <div className="hidden lg:flex flex-none justify-center w-full animate-in fade-in slide-in-from-left-4 h-full items-center">
              <LobbyInfo code={code} />
            </div>
          )}

          <div
            className={`flex-1 flex flex-col items-center justify-center w-full min-h-0 ${
              isHost ? "h-full overflow-hidden" : "lg:h-auto"
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
