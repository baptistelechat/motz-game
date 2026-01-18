import { CaptchaGuard } from "@/components/auth/captcha-guard";
import { AuthProvider } from "@/components/providers/auth-provider";
import { InstallApp } from "@/components/pwa/install-app";
import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#121220",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Motz Game",
  description: "A retro-style word game",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Motz Game",
  },
};

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "block",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "block",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${pressStart2P.variable} ${vt323.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <CaptchaGuard>{children}</CaptchaGuard>
          <InstallApp />
        </AuthProvider>
      </body>
    </html>
  );
}
