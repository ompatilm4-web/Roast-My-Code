import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import UserHistoryModal from "@/components/UserHistoryModal";
import SettingsModal from "@/components/SettingsModal";

export const metadata: Metadata = {
  title: "RoastMyCode — AI Code Critic & Architecture Reviewer",
  description:
    "Honest, high-signal feedback on GitHub repositories, code snippets, and technical resumes with actionable senior architecture blueprints.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-zinc-200 min-h-screen antialiased">
        <AuthProvider>
          {children}
          <AuthModal />
          <UserHistoryModal />
          <SettingsModal />
        </AuthProvider>
      </body>
    </html>
  );
}
