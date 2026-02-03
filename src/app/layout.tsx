import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const lufga = localFont({
  src: [
    {
      path: "./fonts/LufgaThin.woff",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/LufgaThinItalic.woff",
      weight: "100",
      style: "italic",
    },
    {
      path: "./fonts/LufgaExtraLight.woff",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/LufgaExtraLightItalic.woff",
      weight: "200",
      style: "italic",
    },
    {
      path: "./fonts/LufgaLight.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/LufgaLightItalic.woff",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/LufgaRegular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/LufgaItalic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/LufgaMedium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/LufgaMediumItalic.woff",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/LufgaSemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/LufgaSemiBoldItalic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/LufgaBold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/LufgaBoldItalic.woff",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/LufgaExtraBold.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/LufgaExtraBoldItalic.woff",
      weight: "800",
      style: "italic",
    },
    {
      path: "./fonts/LufgaBlack.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/LufgaBlackItalic.woff",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-lufga",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notova",
  description: "A modern note-taking application",
  metadataBase: new URL("https://notova.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lufga.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
