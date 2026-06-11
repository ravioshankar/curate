---
name: curate-development-journey
description: Guide Codex through the iQRate/Curate Expo app development journey with consistent repo inspection, validation, communication, and follow-through. Use when planning, implementing, reviewing, or summarizing feature work in this repository, especially when the user wants better guidance across ongoing development.
---

# Curate Development Journey

## Working Loop

1. Start by identifying the requested product area: collection dashboard, data collection, valuation, profile/settings, storage, build/release, or docs.
2. Read the nearest route, screen, component, store, service, and type files before editing. Prefer existing patterns over new architecture.
3. Name the active risk early: compile breakage, data model mismatch, native dependency, navigation, persistence, visual polish, or release packaging.
4. Make scoped changes that preserve user work. Avoid broad cleanup unless it directly supports the request.
5. Validate at the narrowest useful level first, then broader checks when the touched area is healthy enough.
6. Report what changed, what was verified, and any known repo-wide blockers separately.

## Repo Map

- App routes live in `app/`, with tab navigation in `app/(tabs)/_layout.tsx`.
- Primary screens live in `src/screens/`.
- Shared UI lives in `src/components/` and root `components/`.
- Redux stores live in `src/store/`.
- Storage and migration code live in `src/services/`.
- Core data collection types live in `src/types/data-collection.ts`.
- Project notes and roadmaps live in root markdown files and `docs/`.

## Validation Preference

- For single-file UI edits, run targeted ESLint on the edited file.
- For type or service changes, run `npx tsc --noEmit` and expect to separate new failures from known data-collection debt.
- For Expo config or dependencies, run `npx expo-doctor`.
- For dependency security checks, run `npm audit --audit-level=moderate`.

## Communication Style

Keep updates short and concrete. Mention when a failure is pre-existing instead of implying the current change caused it. When choosing between product directions, state the assumption and continue unless the choice is risky or irreversible.
