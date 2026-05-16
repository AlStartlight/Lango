import type { ReactNode } from "react"
import { EditorShell } from "./editor-shell"

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <EditorShell>{children}</EditorShell>
}
