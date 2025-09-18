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
  title: "Pan Atlantic University Mosque",
  description:
    "Experience the vibrant Muslim community at Pan Atlantic University with prayer times, programmes, and a dynamic media feed.",
  metadataBase: new URL("https://pau-ummah.app"),
  openGraph: {
    title: "Pan Atlantic University Mosque",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} bg-background font-sans text-foreground antialiased`}>
        <Providers>
          <TooltipProvider delayDuration={200}>
            <PageProgressBar />
            {children}
            <FloatingButtons />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
