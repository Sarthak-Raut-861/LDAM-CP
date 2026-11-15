import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "MediGlow — Smart Medicine Reminder System | IoT Healthcare Dispenser",
  description: "Production-quality responsive web application for an IoT-based Smart Medicine Dispenser with ESP32 DevKit V1, DS3231 RTC, four 74HC595 shift registers and 28 red LEDs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950">
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

