"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ATTRIBUTIONS } from "@/lib/constants/attributions";
import { InfoBox } from "@nsmr/pixelart-react";
import { useState } from "react";

export function AttributesDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-theme text-lg text-center">
              CREDITS & ATTRIBUTIONS
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {ATTRIBUTIONS.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.category} className="space-y-3">
                    <h3 className="font-display text-secondary uppercase border-b border-border-foreground pb-1">
                      {group.category}
                    </h3>
                    <ul className="space-y-2 font-sans text-popover-foreground text-sm">
                      {group.items.map((item, index) => (
                        <li key={index}>
                          <a
                            href={item.url}
                            title={item.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-primary transition-colors flex items-start gap-2"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                            <span>{item.text}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
            {ATTRIBUTIONS.every((g) => g.items.length === 0) && (
              <p className="text-center text-muted-foreground text-sm italic">
                Aucune attribution pour le moment.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        size="icon-xl"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="transition-all animate-in zoom-in duration-300"
        aria-label="Crédits et attributions"
      >
        <InfoBox className="size-7" />
      </Button>
    </>
  );
}
