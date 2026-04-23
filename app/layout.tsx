import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "GMR Aerocity Smart Assistant | AeroBot",
  description: "Official intelligent concierge assistant for GMR Aerocity Delhi — India's premier Global Business District.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
