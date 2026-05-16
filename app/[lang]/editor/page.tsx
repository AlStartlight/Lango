"use client";

import { useModule } from "@/components/editor/number-name/module-context";
import { NumberNameModule } from "@/components/editor/number-name/number-name-module";
import { GrammarModule } from "@/components/editor/grammar/grammar-module";
import { WelcomeDashboard } from "@/components/editor/welcome-dashboard";
import type { ReactNode } from "react";

const FULLSCREEN_MODULES = new Set(["number-name", "grammar"]);

const MODULE_VIEWS: Record<string, ReactNode> = {
  "number-name": <NumberNameModule lang="en" />,
  "grammar": <GrammarModule lang="en" />,
};

function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1a1a1a] text-white/30 gap-4">
      <div className="text-5xl">🚧</div>
      <p className="text-sm font-medium text-white/50">{title}</p>
      <p className="text-xs text-white/20">This learning module is under development.</p>
    </div>
  );
}

export default function EditorPage() {
  const { activeModule, setActiveModule } = useModule();

  if (!activeModule) {
    return <WelcomeDashboard onSelectModule={setActiveModule} />;
  }

  const isFullscreen = FULLSCREEN_MODULES.has(activeModule);

  return (
    <div
      key={activeModule}
      className={`animate-fade-in-up ${isFullscreen ? "h-full w-full overflow-hidden" : "h-full"}`}
    >
      {MODULE_VIEWS[activeModule] ?? <ModulePlaceholder title={activeModule} />}
    </div>
  );
}
