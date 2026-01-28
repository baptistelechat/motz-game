"use client";

import { Alert, Check, Close, InfoBox, Loader } from "@nsmr/pixelart-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-4 group-[.toaster]:border-black !shadow-[6px_6px_0px_0px_#000000] group-[.toaster]:rounded-none group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:text-lg data-[type=error]:!border-destructive data-[type=error]:!text-destructive data-[type=success]:!border-allow-foreground data-[type=success]:!text-allow-foreground data-[type=warning]:!border-theme-foreground data-[type=warning]:!text-theme-foreground",
          title: "group-[.toast]:text-lg group-[.toast]:font-bold",
          description:
            "group-[.toast]:text-md group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[2px_2px_0px_0px_#000000] group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[2px_2px_0px_0px_#000000] group-[.toast]:rounded-none",
        },
      }}
      icons={{
        success: <Check className="size-5" />,
        info: <InfoBox className="size-5" />,
        warning: <Alert className="size-5" />,
        error: <Close className="size-5" />,
        loading: <Loader className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
