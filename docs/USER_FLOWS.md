# User Flows — Wedding Quest

**Status:** Approved  
**Task:** M0-03  
**Design direction:** Taman Senja Nusantara  
**Source:** `docs/PRODUCT_BRIEF.md`, `CR-001`, and `.impeccable.md`

Approved by the product/design owner on 2026-09-15.

## Acceptance criteria

- The valid-link guest journey covers cover, avatar selection, game entry, direct navigation, stations, RSVP, realtime, and photobooth.
- Essential information remains reachable before and without Phaser.
- Invalid, expired, revoked, unpublished, offline, realtime-disabled, permission-denied, and unsupported-device paths have deterministic outcomes.
- A station action and direct navigation open the same React-owned content state.
- Modal opening disables game input; modal closing restores focus and input safely.
- Keyboard, touch, reduced-motion, and screen-reader alternatives are represented.

## 1. Primary guest flow

```mermaid
flowchart TD
    A[Open personal invitation link] --> B{Link and publication valid?}
    B -- No --> C[Show protected error state]
    B -- Yes --> D[Cover with guest greeting]
    D --> E{Guest chooses path}
    E -- View information --> F[Accessible direct navigation]
    E -- Enter venue --> G[Choose one of four avatars]
    G --> H[Explicit enter action]
    H --> I[Load Phaser and optional audio]
    I --> J{Game ready?}
    J -- Yes --> K[Explore venue]
    J -- No --> L[Explain failure and offer retry]
    L --> F
    K --> M[Approach station]
    M --> N[Open shared React content]
    F --> N
    N --> O{Selected content}
    O --> P[Couple]
    O --> Q[Schedule and location]
    O --> R[Gallery]
    O --> S[RSVP and wishes]
    O --> T[Gift]
    O --> U[Photobooth]
```

The direct-information action is visible on the cover and remains available during game loading. Entering the venue is never required to read essential information or submit RSVP.

## 2. Invitation access states

```mermaid
flowchart TD
    A[Request invitation URL] --> B{Token present?}
    B -- No --> C[Invitation unavailable]
    B -- Yes --> D{Token valid and not revoked?}
    D -- No --> E[Link invalid or no longer active]
    D -- Yes --> F{Wedding published?}
    F -- No --> G[Invitation not published]
    F -- Yes --> H{Invitation expired?}
    H -- Yes --> I[Invitation period ended]
    H -- No --> J[Render cover and essential navigation]
```

Error responses must not reveal whether another guest exists, show sequential IDs, or expose token values. Every unavailable state provides a safe retry or contact-the-host instruction configured per deployment.

## 3. Game lifecycle and fallback

```mermaid
stateDiagram-v2
    [*] --> Cover
    Cover --> AvatarSelection: Enter venue
    AvatarSelection --> Loading: Confirm avatar
    Loading --> Playing: GAME_READY
    Loading --> LoadError: GAME_ERROR or timeout
    LoadError --> Loading: Try again
    LoadError --> NonGame: View invitation
    Playing --> ModalOpen: Station or direct navigation
    NonGame --> ModalOpen: Direct navigation
    ModalOpen --> Playing: Close, if game ready
    ModalOpen --> NonGame: Close, if no game
    Playing --> Degraded: Realtime unavailable
    Degraded --> Playing: Reconnected
    Playing --> [*]: Leave or destroy
```

Lifecycle rules:

- Loading Phaser starts only after an explicit enter action.
- Direct navigation works in `Cover`, `Loading`, `LoadError`, `Playing`, and `Degraded` states.
- Opening a modal sends `SET_INPUT_ENABLED: false` and clears active movement.
- Closing restores focus to the trigger and enables input only when no other blocking overlay remains.
- Blur, visibility change, pointer cancellation, and teardown clear movement.
- Re-entry creates one Phaser instance and one canvas only.

## 4. Shared content navigation

All entry points resolve to one React-owned content identifier:

| Entry point | Input | Result |
|---|---|---|
| Bottom navigation | Tap/click or keyboard activation | Open selected content modal |
| Nearby station | Action button, `Enter`, or configured game action key | Emit station ID, map to the same modal |
| Deep link | Valid content route/hash | Open the same modal after invitation validation |
| Non-game fallback | Accessible section link | Open the same content; no Phaser dependency |

If two interaction zones overlap, Phaser chooses the nearest eligible station deterministically. React owns the modal stack and Escape closes only the topmost dismissible layer.

## 5. RSVP flow

```mermaid
flowchart TD
    A[Open RSVP] --> B{Existing response?}
    B -- Yes --> C[Pre-fill active response]
    B -- No --> D[Empty form]
    C --> E[Choose attendance]
    D --> E
    E --> F{Attending?}
    F -- Yes --> G[Choose party size within quota]
    F -- No --> H[Party size becomes zero]
    G --> I[Optional wish]
    H --> I
    I --> J[Review and send]
    J --> K{Valid and before deadline?}
    K -- No --> L[Inline error with correction]
    K -- Yes --> M[Idempotent save]
    M --> N{Save succeeds?}
    N -- Yes --> O[Confirmation and edit option]
    N -- No --> P[Preserve input and offer retry]
```

The submit label is outcome-specific: `Kirim konfirmasi` for the first response and `Simpan perubahan` for an update. No optimistic success is shown before the durable write succeeds.

## 6. Realtime and ephemeral chat

```mermaid
flowchart TD
    A[Game ready] --> B{Realtime flag enabled?}
    B -- No --> C[Single-player; no error interruption]
    B -- Yes --> D[Authorize wedding-scoped session]
    D --> E{Connected?}
    E -- Yes --> F[Presence and remote avatars]
    F --> G[Send text up to 120 chars or quick reaction]
    G --> H{Validation and rate limit pass?}
    H -- Yes --> I[Show bubble for about 8 seconds]
    H -- No --> J[Explain blocked or rate-limited action locally]
    E -- No --> K[Compact offline status]
    K --> L[Bounded reconnect with jitter]
    L --> E
```

Chat has no visible history and is not stored in PostgreSQL. A connection failure never opens a blocking modal. The operator can disable chat globally or block a session server-side.

## 7. Photobooth flow

```mermaid
flowchart TD
    A[Open photobooth] --> B{Feature and camera supported?}
    B -- No --> C[Unsupported fallback]
    B -- Yes --> D[Explain local-only processing]
    D --> E[Guest chooses Activate camera]
    E --> F{Permission granted?}
    F -- No --> G[Permission-denied guidance]
    F -- Yes --> H[Live preview]
    H --> I[Capture]
    I --> J[Photo preview with frame]
    J --> K{Guest choice}
    K -- Retake --> H
    K -- Download --> L[Generate and download locally]
    K -- Close --> M[Discard local capture and stop camera]
    L --> M
```

The camera stream stops on close, navigation away, visibility loss where appropriate, or teardown. No capture, thumbnail, or biometric/media payload is sent to the server.

## 8. Keyboard and assistive-technology flow

1. A skip link moves focus directly to invitation information.
2. Cover actions and avatar choices are reachable in logical DOM order.
3. Avatar selection uses a labelled single-choice group with arrow-key behavior.
4. Direct navigation remains available without interacting with the canvas.
5. Modal focus moves to its heading or first meaningful control, stays trapped, and returns to the invoking control when closed.
6. Status updates use appropriately polite live regions; decorative game changes are not announced continuously.
7. Reduced-motion removes optional spatial transitions and reduces nonessential game effects.
8. At 200% zoom, essential content reflows without horizontal scrolling except intrinsically scrollable gallery regions.

## 9. Exit and recovery rules

| Event | Required behavior |
|---|---|
| Pointer cancel, window blur, or hidden document | Clear movement immediately |
| Modal opens | Clear movement, disable local input, preserve game instance |
| Modal closes | Restore trigger focus and re-enable input if safe |
| Realtime disconnects | Keep game/content working and show compact status |
| Camera permission denied | Keep modal usable, explain browser setting, provide close action |
| Phaser load fails | Keep direct information navigation and offer retry |
| Invitation request fails | Show safe error copy and retry without leaking token details |
| Browser back | Close top content layer first; do not duplicate game/canvas |
