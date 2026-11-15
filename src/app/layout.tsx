import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "MediGlow — Your Health, Right on Time. | Smart IoT Medication Dispenser",
  description: "Production-quality responsive web application for an IoT-based Smart Medicine Dispenser with ESP32 DevKit V1, DS3231 RTC, four 74HC595 shift registers and 28 red LEDs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#030712] text-slate-100 selection:bg-teal-500 selection:text-white">
        <AuthProvider>
          <AppProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
