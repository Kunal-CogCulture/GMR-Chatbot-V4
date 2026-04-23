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
  title: "Aero AI Concierge | GMR Aerocity Smart Assistant",
  description: "You are Aero AI Concierge, the official intelligent assistant for GMR Aerocity Delhi — India's premier Global Business District located at Indira Gandhi International Airport. You assist visitors, business travelers, guests, and tenants with everything related to GMR Aerocity.",
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
        <p className="text-center text-xs text-gray-300 mt-4">Powered by GMR Aerocity × Aero AI Concierge</p>
      </body>
    </html>
  );
}
