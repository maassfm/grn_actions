import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wahlkampfaktionen – GRÜNE Berlin-Mitte",
  description:
    "Koordination von Wahlkampfaktionen für BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head />
      <body className="font-sans antialiased bg-sand text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
