import type { Metadata } from "next";
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
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-sand text-gray-900">
        {children}
      </body>
    </html>
  );
}
