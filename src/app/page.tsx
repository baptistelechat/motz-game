import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-12 min-h-dvh">
        <div className="text-center space-y-6">
          <h1 className="font-pixel text-8xl text-[#39FF14] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase">
            MOTZ-GAME
          </h1>
          <p className="font-vt323 text-4xl text-white tracking-wider">
            Chaque lettre compte
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-xs md:max-w-2xl justify-center items-center">
          <Button className="w-full md:w-64 h-20 md:h-16 text-2xl md:text-xl bg-[#39FF14] text-black border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none">
            CRÉER PARTIE
          </Button>
          <Button
            variant="secondary"
            className="w-full md:w-64 h-20 md:h-16 text-2xl md:text-xl bg-white text-black border-4 border-black shadow-hard hover:bg-gray-100 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-none"
          >
            REJOINDRE
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
