"use client";

import {
  Hash,
  BookOpen,
  BookPlus,
  PencilLine,
  Mic,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ModuleEntry {
  id: string;
  icon: typeof Hash;
  title: string;
  description: string;
  status: "ready" | "coming-soon";
  color: string;
}

const MODULES: ModuleEntry[] = [
  {
    id: "number-name",
    icon: Hash,
    title: "Number Name",
    description: "Learn to read, write, and pronounce numbers 0–1,000,000+ in your target language through interactive flashcards and listening games.",
    status: "ready",
    color: "#d2ff5e",
  },
  {
    id: "lesson-planner",
    icon: BookOpen,
    title: "Lesson Planner",
    description: "Create structured lesson plans with learning objectives, activities, and assessments tailored to your level.",
    status: "coming-soon",
    color: "#7c3aed",
  },
  {
    id: "vocabulary",
    icon: BookPlus,
    title: "Vocabulary Builder",
    description: "Build your lexicon with spaced repetition, context-rich examples, and native-speaker audio.",
    status: "coming-soon",
    color: "#3b82f6",
  },
  {
    id: "grammar",
    icon: PencilLine,
    title: "Grammar Practice",
    description: "Master sentence structure, verb conjugations, and grammar rules through targeted exercises.",
    status: "coming-soon",
    color: "#f59e0b",
  },
  {
    id: "speaking",
    icon: Mic,
    title: "Speaking Practice",
    description: "Improve pronunciation and fluency with AI-powered speech recognition and feedback.",
    status: "coming-soon",
    color: "#ef4444",
  },
];

interface WelcomeDashboardProps {
  onSelectModule: (id: string) => void;
}

export function WelcomeDashboard({ onSelectModule }: WelcomeDashboardProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#1a1a1a]">
      <div className="px-8 pt-12 pb-8 border-b border-[#252525]">
        <div className="flex items-center gap-2 text-[#d2ff5e] mb-3">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Learning Studio
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Welcome to your <span className="text-[#d2ff5e]">Lango Editor</span>
        </h1>
        <p className="text-sm text-white/50 mt-2 max-w-lg leading-relaxed">
          Choose a learning project below or select one from the sidebar to begin building your language skills.
        </p>
      </div>

      <div className="flex-1 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
            Available Projects
          </h2>
          <span className="text-xs text-white/30">
            {MODULES.filter((m) => m.status === "ready").length} ready ·{" "}
            {MODULES.filter((m) => m.status === "coming-soon").length} coming soon
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isReady = mod.status === "ready";
            return (
              <button
                key={mod.id}
                onClick={() => isReady && onSelectModule(mod.id)}
                disabled={!isReady}
                className="group relative flex flex-col items-start gap-3 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] p-5 text-left transition-all duration-200 hover:border-[#3a3a3a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#2a2a2a] disabled:hover:bg-[#1e1e1e]"
              >
                {!isReady && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[10px] font-medium text-white/30">
                    Soon
                  </span>
                )}

                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `${mod.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: mod.color }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {isReady && (
                  <div className="flex items-center gap-1 text-xs font-medium text-[#d2ff5e] opacity-0 group-hover:opacity-100 transition-opacity">
                    Open project
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
