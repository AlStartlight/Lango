"use client";

import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Button } from "../ui/button";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  rightSlot?: React.ReactNode;
}

export function EditorNavbar({ sidebarOpen, onToggleSidebar, rightSlot }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-[#333]">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:bg-[#333]"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 flex justify-center" />

      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}