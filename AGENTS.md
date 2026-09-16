# Wedding Quest Development Guardrails

These instructions apply to every contributor and coding agent working in this repository.

## Source of truth

Before making changes, read `docs/IMPLEMENTATION_PLAN.md`, especially:

- Sections 1–8.
- The active milestone in section 9.
- Quality, security, and Definition of Done sections.

The implementation plan takes precedence over ad-hoc technical preferences. User instructions take precedence when they explicitly change the plan; record such changes before implementation.

## Required workflow

1. Identify the active milestone and task ID.
2. Restate the relevant acceptance criteria in the working notes or PR.
3. Check dependencies and existing implementation before editing.
4. Keep changes limited to the selected task.
5. Test in proportion to risk.
6. Record test evidence, decisions, risks, and task status.
7. Do not mark work complete until the plan's Definition of Done is satisfied.

## Change control

- Do not add product scope without a Change Request.
- Do not change a major framework, state-management approach, realtime transport, database, or architectural boundary without an ADR.
- If implementation evidence contradicts the plan, stop and amend the plan explicitly instead of silently diverging.
- Preserve backward compatibility for published invitation links and versioned theme manifests unless an approved migration says otherwise.

## Architectural boundaries

- Phaser owns world rendering, movement, camera, collision, NPCs, and proximity detection.
- React owns cover UI, HUD, navigation, dialogs, forms, gallery, dashboard, and accessible alternatives.
- React and Phaser communicate only through the typed event bridge.
- Wedding content must not be hard-coded into game scenes or theme geometry.
- Theme-specific coordinates and assets belong in a validated, versioned manifest.
- Realtime transport and persistence logic must not live inside Phaser scenes.
- Presence and player positions are ephemeral and must not be continuously stored in PostgreSQL.
- Essential invitation information must remain accessible without playing the game.

## Quality rules

- Do not leave loading, empty, error, offline, or permission-denied states unspecified.
- Clear movement on pointer cancellation, blur, visibility change, and modal opening.
- Lazy-load Phaser and nonessential media according to the performance budget.
- Validate and sanitize all guest-authored or uploaded content.
- Never log secrets, signed guest tokens, gift/payment data, or unnecessary message bodies.
- Add or update tests for every changed behavior.
- Avoid unrelated refactors in feature changes.

## Required completion report

Every completed task must report:

```text
Task ID:
Outcome:
Acceptance criteria satisfied:
Tests and results:
Performance/accessibility/security impact:
Files or modules changed:
Plan/ADR/CR updates:
Remaining risks or follow-ups:
```

## Installation

When the application repository is created:

1. Place this file at repository root as `AGENTS.md`.
2. Place the implementation plan at `docs/IMPLEMENTATION_PLAN.md`.
3. Commit both before feature development begins.
