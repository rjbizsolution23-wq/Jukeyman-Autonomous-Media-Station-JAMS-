import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jukeyman AGI Music Studio (JAMS)",
  description: "Professional music production with 110 AI agents across 11 departments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden bg-black">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <main className="flex-1 overflow-auto ml-64 mb-8">
                {children}
              </main>

              {/* Status Bar */}
              <StatusBar />
            </div>
            
            {/* Toast Notifications */}
            <Toaster position="top-right" theme="dark" />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

