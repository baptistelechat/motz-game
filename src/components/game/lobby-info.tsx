"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy } from "@nsmr/pixelart-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface LobbyInfoProps {
  code: string;
}

export function LobbyInfo({ code }: LobbyInfoProps) {
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    setRoomUrl(`${window.location.origin}/room/${code}`);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    toast.success("Lien copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-row md:flex-col items-center gap-4 py-4 md:py-6 px-4 md:px-6 max-w-md mx-auto w-full bg-foreground text-primary-foreground justify-center">
      <QRCode value={roomUrl} size={150} bgColor="transparent" />
      <div className="flex flex-col items-center gap-2 md:gap-4">
        <span className="text-4xl md:text-5xl font-bold tracking-widest">
          {code}
        </span>
        <Button
          size="lg"
          onClick={handleCopy}
          className="w-full md:w-64"
          variant={copied ? "secondary" : "default"}
        >
          <Copy className="size-5" />
          {copied ? "COPIÉ !" : "COPIER"}
        </Button>
      </div>
    </Card>
  );
}
