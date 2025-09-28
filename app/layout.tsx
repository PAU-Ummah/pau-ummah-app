import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PageProgressBar } from "@/components/mosque/PageProgressBar";
import { FloatingButtons } from "@/components/mosque/FloatingButtons";
import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAU Muslim Ummah",
  description:
    "Experience the vibrant Muslim community at Pan Atlantic University with prayer times, programmes, and a dynamic media feed.",
  metadataBase: new URL("https://pau-ummah.app"),
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "PAU Muslim Ummah",
    description:
      "Stay updated with PAU Muslim community events, prayer schedules, and inspiring media moments.",
    url: "https://pau-ummah.app",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>
          <TooltipProvider>
            <PageProgressBar />
            {children}
            <FloatingButtons />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
