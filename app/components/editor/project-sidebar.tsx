"use client";

import { X, Plus, Hash, BookOpen, BookPlus, PencilLine, Mic, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ModuleEntry {
  id: string;
  icon: typeof Hash;
  title: string;
  description: string;
  status: "ready" | "coming-soon";
  color: string;
}

const LEARNING_MODULES: ModuleEntry[] = [
  {
    id: "number-name",
    icon: Hash,
    title: "Number Name",
    description: "Numbers in your target language",
    status: "ready",
    color: "#d2ff5e",
  },
  {
    id: "lesson-planner",
    icon: BookOpen,
    title: "Lesson Planner",
    description: "Structured lesson plans",
    status: "coming-soon",
    color: "#7c3aed",
  },
  {
    id: "vocabulary",
    icon: BookPlus,
    title: "Vocabulary Builder",
    description: "Spaced repetition words",
    status: "coming-soon",
    color: "#3b82f6",
  },
  {
    id: "grammar",
    icon: PencilLine,
    title: "Grammar Practice",
    description: "Verbs, structure & rules",
    status: "ready",
    color: "#f59e0b",
  },
  {
    id: "speaking",
    icon: Mic,
    title: "Speaking Practice",
    description: "Pronunciation & fluency",
    status: "coming-soon",
    color: "#ef4444",
  },
];

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string | null;
  onSelectModule: (id: string | null) => void;
}

export function ProjectSidebar({ isOpen, onClose, activeModule, onSelectModule }: ProjectSidebarProps) {
  const readyCount = LEARNING_MODULES.filter((m) => m.status === "ready").length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 w-72 bg-[#1a1a1a] border-r border-[#333] z-50 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#333] shrink-0">
          <h2 className="text-white font-medium">Projects</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-[#333]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-[#333] bg-transparent px-2 shrink-0">
            <TabsTrigger
              value="my-projects"
              className="text-white data-[state=active]:bg-[#333] data-[state=active]:text-white"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="text-white data-[state=active]:bg-[#333] data-[state=active]:text-white"
            >
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 mt-0 overflow-y-auto min-h-0">
            <div className="py-2 px-2 space-y-0.5">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <Sparkles className="h-3 w-3 text-[#d2ff5e]" />
                <span className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
                  Learning Modules
                </span>
                <span className="text-[10px] text-white/20 ml-auto">{readyCount} ready</span>
              </div>

              {LEARNING_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isReady = mod.status === "ready";
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => isReady && onSelectModule(isActive ? null : mod.id)}
                    disabled={!isReady}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isActive
                        ? "bg-[#d2ff5e]/10 text-[#d2ff5e]"
                        : isReady
                          ? "text-white/60 hover:bg-[#2a2a2a] hover:text-white/80"
                          : "text-white/20"
                    }`}
                  >
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                      style={{ backgroundColor: isReady ? `${mod.color}15` : "#1a1a1a" }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: isReady ? mod.color : "#333" }}
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">{mod.title}</div>
                      <div className="text-[10px] text-white/30 truncate">
                        {mod.description}
                      </div>
                    </div>
                    {!isReady && (
                      <span className="text-[9px] text-white/20 bg-[#252525] px-1.5 py-0.5 rounded shrink-0">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 p-4 mt-0">
            <div className="flex flex-col items-center justify-center h-full text-muted-text">
              <p className="text-sm">No shared projects</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-[#333] shrink-0">
          <Button
            className="w-full"
            variant="default"
            onClick={() => {
              const firstReady = LEARNING_MODULES.find((m) => m.status === "ready");
              if (firstReady) onSelectModule(firstReady.id);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}