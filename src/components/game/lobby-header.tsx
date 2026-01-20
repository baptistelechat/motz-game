"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy } from "@nsmr/pixelart-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface LobbyHeaderProps {
  code: string;
}

export function LobbyHeader({ code }: LobbyHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    setRoomUrl(`${window.location.origin}/room/${code}`);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col items-center gap-4 py-8 md:py-10 px-8 md:px-6 max-w-md mx-auto w-full bg-foreground text-primary-foreground">
      <QRCode value={roomUrl} size={150} bgColor="transparent" />
      <span className="text-5xl font-bold tracking-widest">{code}</span>
      <Button
        size="xl"
        onClick={handleCopy}
        className="w-full md:w-64"
        variant={copied ? "secondary" : "default"}
      >
        <Copy className="size-5 md:size-7" />
        {copied ? "LIEN COPIÉ !" : "COPIER LE LIEN"}
      </Button>
    </Card>
  );
}
