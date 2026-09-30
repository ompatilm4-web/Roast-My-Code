import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import UserHistoryModal from "@/components/UserHistoryModal";
import SettingsModal from "@/components/SettingsModal";

export const metadata: Metadata = {
  title: "RoastMyCode — AI Code Auditor & Sarcastic Critic",
  description:
    "Brutally honest, weirdly helpful feedback on your GitHub repos, raw code snippets, and tech resumes — paired with senior architect blueprints.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-100 min-h-screen selection:bg-flame-orange/30 selection:text-white">
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
