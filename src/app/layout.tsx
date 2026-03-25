import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wahlkampfaktionen – GRÜNE Berlin-Mitte",
  description:
    "Koordination von Wahlkampfaktionen für BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head />
      <body className="font-sans antialiased bg-white text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
