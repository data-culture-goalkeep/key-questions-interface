import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Inter,
  Lora,
  Nunito,
  Questrial,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Brand redesign type system: Fraunces for display/hero headings (used
// sparingly, via the `font-display` utility — see globals.css), IBM Plex
// Mono for KQ/indicator codes (replaces Geist Mono as --font-mono).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const questrial = Questrial({
  variable: "--font-questrial",
  weight: "400",
  subsets: ["latin"],
});

// "Google Sans" itself isn't published on Google Fonts (it's Google's
// in-house proprietary face) — Inter is the closest openly-licensed
// stand-in for this style-guide comparison, and is labelled as such in
// the UI rather than presented as the real thing.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Key Questions Navigator",
  description: "Review, map, and prioritise key questions for dashboard design.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${lora.variable} ${spaceGrotesk.variable} ${questrial.variable} ${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
