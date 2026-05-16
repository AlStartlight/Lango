# Current Issues — Number Name Module Console Errors

## Overview

The `number-name` editor module currently has multiple React runtime and rendering issues causing unstable gameplay behavior, React warnings, duplicated UI rendering, and unsafe state updates during render cycles.

The issues primarily affect:

- `TapNumberPhase`
- `SpeedQuizPhase`
- `MasteryPhase`
- `ModuleProvider`

These problems can cause:

- Unexpected rerenders
- UI duplication
- Incorrect game state updates
- Infinite render risks
- Broken React reconciliation
- Reduced performance
- Future incompatibility with strict React rendering behavior

---

# Affected Files

- `app/components/editor/number-name/module-context.tsx`
- `app/components/editor/number-name/number-name-module.tsx`
- `app/components/editor/number-name/tap-number-phase.tsx`
- `app/components/editor/number-name/speed-quiz-phase.tsx`
- `app/components/editor/number-name/mastery-phase.tsx`

---

# ISSUE 01 — setState During Render (TapNumberPhase)

## Error

```txt
Cannot update a component (`ModuleProvider`) while rendering a different component (`TapNumberPhase`)