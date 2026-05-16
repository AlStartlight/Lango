"use client";

import { useState, useEffect, startTransition } from "react";
import { UserButton } from "@clerk/nextjs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ModuleProvider, useModule } from "@/components/editor/number-name/module-context";
import { GrammarProvider } from "@/components/editor/grammar/module-context";
import type { ReactNode } from "react";

function UserButtonSlot() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => startTransition(() => setMounted(true)), []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-full bg-[#2a2a2a] animate-pulse" />;
  }

  return (
    <div className="flex items-center">
      <UserButton
        appearance={{
          variables: {
            colorPrimary: "#ff6b35",
            colorForeground: "#1a1714",
            colorBackground: "#ffffff",
            borderRadius: "0.5rem",
          },
          elements: {
            avatarBox: "size-8",
          },
        }}
      />
    </div>
  );
}

function EditorContent({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeModule, setActiveModule } = useModule();

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1a1a]">
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        rightSlot={<UserButtonSlot />}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      <main className="flex flex-1 pt-14">{children}</main>
    </div>
  );
}

export function EditorShell({ children }: { children: ReactNode }) {
  return (
    <ModuleProvider>
      <GrammarProvider>
        <EditorContent>{children}</EditorContent>
      </GrammarProvider>
    </ModuleProvider>
  );
}
