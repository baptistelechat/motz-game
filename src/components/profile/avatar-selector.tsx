"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { AVATAR_COLORS } from "@/lib/constants/avatar";
import { ANIMALS } from "@/lib/constants/pseudo";
import { cn } from "@/lib/utils";
import { Check } from "@nsmr/pixelart-react";
import { AvatarDisplay } from "./avatar-display";

interface AvatarConfig {
  animal: string;
  color: string;
}

interface AvatarSelectorProps {
  value: AvatarConfig;
  onChange: (value: AvatarConfig) => void;
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Couleur</Label>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {AVATAR_COLORS.map((color) => (
            <Button
              key={color}
              type="button"
              variant="outline"
              onClick={() => onChange({ ...value, color })}
              className={cn(
                "w-full aspect-square cursor-pointer focus:outline-none",
              )}
              style={{ backgroundColor: color }}
              aria-label={`Choisir la couleur ${color}`}
            >
              {value.color === color && (
                <Check className="size-5 md:size-7 text-background drop-shadow-md" />
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Avatar</Label>
        <Select
          value={value.animal}
          onValueChange={(animal) => {
            if (animal) onChange({ ...value, animal });
          }}
        >
          <SelectTrigger>
            <div className="flex items-center gap-4">
              <AvatarDisplay
                animal={value.animal}
                color={value.color}
                size="sm"
                className="border-2 border-white"
              />
              <span className="text-lg font-display uppercase">
                {value.animal}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {ANIMALS.sort().map((animal) => (
              <SelectItem key={animal} value={animal}>
                <div className="flex items-center gap-4 w-full">
                  <AvatarDisplay
                    animal={animal}
                    color={value.color}
                    size="sm"
                    className="border-2 border-white"
                  />
                  <span className="font-display uppercase flex-1">
                    {animal}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
