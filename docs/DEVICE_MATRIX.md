# Browser and Device Support Matrix — Wedding Quest

**Status:** Approved  
**Task:** M0-04  
**Baseline date:** 2026-09-15  
**Primary locale/timezone:** Indonesian (`id-ID`), WIB (`Asia/Jakarta`)

Approved by the product/technical owner on 2026-09-15.

## 1. Support policy

Wedding Quest uses a rolling browser policy because Chromium and Firefox now ship frequently. At each release candidate:

- Test the latest stable major and the immediately previous stable major for Chrome, Edge, and Firefox desktop.
- Test the latest stable Safari/WebKit line and the previous supported Safari/WebKit line.
- Record exact four-part browser builds in test evidence; this document records the baseline available when M0-04 was written.
- Support Chrome on Android 10 or newer. Android versions older than 10 receive best-effort non-game content only and are not release-gate targets.
- Support Safari on current Apple-supported iPhone software represented by iOS 26.x, plus the previous supported WebKit line represented by iOS 18.6.
- Treat in-app browsers as best effort. If WebGL, camera, audio, storage, or realtime capabilities are restricted, show the non-game invitation and a clear `Buka di browser` instruction when detectable.
- Never block essential invitation content solely because a game, realtime, audio, or camera capability is unavailable.

Baseline stable majors verified on 2026-09-15:

| Browser | Current baseline | Previous baseline | Notes |
|---|---:|---:|---|
| Chrome desktop/Android | 153 | 152 | Chrome 153 launched on 2026-09-08; exact patch varies by staged rollout |
| Microsoft Edge desktop | 153 | 152 | Edge 153 stable released on 2026-09-10 |
| Firefox desktop | 155 | 154 | Firefox 155 released on 2026-09-01 |
| Safari | 26.6 | 18.6 | Safari 27 remained beta at baseline; validate again before release |

Exact versions are reference snapshots, not permanent minimums. The rolling policy above controls future releases.

## 2. Release-gate matrix

Priority meanings:

- **P0:** Must pass before production release.
- **P1:** Important compatibility coverage; critical invitation flow must pass, while game/photobooth may use documented fallback.
- **Best effort:** Not a release blocker; essential content should still render when standards support permits.

| Priority | Platform | Browser/engine | Required coverage | Primary input |
|---|---|---|---|---|
| P0 | Android 10+ | Chrome latest and previous stable major | Full invitation, Phaser, audio, realtime, RSVP, photobooth where camera is available | Coarse touch |
| P0 | iOS 26.x | Safari 26.x | Full invitation, Phaser, audio, realtime, RSVP, camera permission, photobooth download | Coarse touch + VoiceOver |
| P0 | iOS 18.6 | Safari 18.6 | Full invitation with feature-detected fallback for unsupported APIs | Coarse touch + VoiceOver |
| P0 | Windows 11 | Chrome latest/previous | Full invitation and keyboard/pointer game controls | Keyboard + fine pointer |
| P0 | Windows 11 | Edge latest/previous | Full invitation and keyboard/pointer game controls | Keyboard + fine pointer |
| P0 | Windows 11 | Firefox latest/previous | Full invitation and keyboard/pointer game controls | Keyboard + fine pointer |
| P0 | macOS Sonoma or newer | Safari 26.x/18.6 as available | Full invitation and keyboard/pointer game controls | Keyboard + fine pointer + VoiceOver smoke test |
| P1 | Android 10+ | Samsung Internet current stable | Critical content, RSVP, game smoke test, and graceful capability fallback | Coarse touch |
| P1 | Android tablet | Chrome current stable | Responsive layout, touch controls, portrait/landscape transition | Coarse touch |
| P1 | iPadOS | Safari current stable | Responsive layout, touch controls, camera capability, portrait/landscape | Coarse touch |
| P1 | iOS 26.x | Chrome current | Critical content and game smoke test; underlying platform engine constraints still apply | Coarse touch |
| Best effort | Android below 10, outdated browsers, embedded social-media webviews | Available browser | Safe error or non-game information when technically possible | Varies |

Windows 10 is not a P0 desktop target because Microsoft support ended before this baseline. It may receive best-effort behavior through a supported browser, but no release gate depends on it.

## 3. Physical device classes

Actual serial numbers and ownership belong in private test evidence, not this document.

| ID | Class | Minimum representative profile | Purpose | Required |
|---|---|---|---|---|
| D-AND-LOW | Lower-bound Android | Android 10, 4 GB RAM, 720×1600-class display, mid/low-range GPU | Memory pressure, load time, FPS floor, touch cancellation | P0 |
| D-AND-MID | Common mid-range Android | Android 14+, 6 GB RAM, 1080p-class display | Primary quality and performance baseline | P0 |
| D-IOS-SMALL | Small iPhone | iPhone SE 2nd generation class, supported iOS/Safari, 375×667 CSS viewport class | Small viewport, safe area, keyboard, VoiceOver, camera | P0 |
| D-IOS-BASE | Baseline current iPhone | iPhone 11 class or newer on iOS 26.x | Current Safari, performance, audio, camera, realtime | P0 |
| D-WIN | Ordinary Windows laptop | Windows 11, 1366×768 or larger, integrated graphics | Desktop Chromium/Firefox, keyboard, pointer | P0 |
| D-MAC | Supported Mac | macOS Sonoma or newer, 1440×900-class viewport | Safari/WebKit and VoiceOver smoke test | P0 before production; hosted device lab allowed |
| D-TABLET | Tablet | Android tablet or iPad, approximately 768 CSS px wide | Responsive adaptation and orientation | P1 |

If a physical device is unavailable locally, a hosted real-device service may provide compatibility evidence, but final performance/FPS evidence must come from physical hardware without emulator CPU throttling as its sole proof.

## 4. Viewport and orientation matrix

| Viewport/profile | Orientation | Expected layout | Gate |
|---|---|---|---|
| 320×568 CSS px | Portrait | Compact cover/HUD; all essential content and controls remain reachable | P0 layout/accessibility |
| 360×640 CSS px | Portrait | Lower-bound Android game and modal layout | P0 |
| 390×844 CSS px | Portrait | Primary mobile composition | P0 |
| 412×915 CSS px | Portrait | Large Android composition | P0 |
| 667×375 CSS px | Landscape | Usable compact game, no clipped modal actions, orientation guidance allowed | P0 usability |
| 844×390 CSS px | Landscape | Usable game and content without forced rotation | P0 usability |
| 768×1024 CSS px | Portrait | Tablet adaptation | P1 |
| 1024×768 CSS px | Landscape | Tablet adaptation | P1 |
| 1366×768 CSS px | Landscape | Minimum desktop shell | P0 |
| 1440×900 CSS px | Landscape | Primary desktop composition | P0 |

Layout breakpoints remain content-driven. These viewport sizes are test probes, not CSS breakpoint requirements.

## 5. Capability expectations

| Capability | Required behavior when supported | Required fallback when unavailable/restricted |
|---|---|---|
| JavaScript | Full experience | Server-rendered safe unavailable message where practical |
| WebGL/Canvas | Phaser venue | Direct non-game invitation; retry and browser guidance |
| WebSocket | Presence, remote players, chat, reactions | Local game; compact connection state; no blocked content |
| Camera/MediaDevices | Local photobooth after explicit action | Permission/unsupported guidance; no repeated prompt loop |
| Web Audio | Music after explicit action | Silent experience with control state explaining unavailability |
| Local download | Save local photobooth output | Show device/browser-specific share/save guidance when available |
| Pointer events | Joystick and touch controls | Directional buttons/keyboard as appropriate |
| Keyboard | Movement and accessible navigation | Touch remains independent; never keyboard-only |
| Reduced motion preference | Reduced DOM/game effects | Manual reduced-motion control if preference cannot be detected |

Capabilities are feature-detected. User-agent sniffing may be used only for narrowly documented browser workarounds and never as the primary support decision.

## 6. Network and performance profiles

| Profile | Down/up | Latency | Use |
|---|---:|---:|---|
| Cached 4G | 9/3 Mbps | 80 ms RTT | Cover usable ≤3 seconds after edge caching |
| Constrained 4G | 4/1 Mbps | 150 ms RTT | Game-ready target ≤5 seconds with initial payload budget |
| Realtime adverse | 4/1 Mbps | 250 ms RTT with jitter and 2% packet loss | Interpolation, reconnect, and degraded-mode validation |
| Offline transition | Connection drops after load | N/A | Input cleanup, status, cached content, and retry behavior |

Performance gates from the implementation plan remain authoritative:

- Initial compressed game payload target ≤4 MB.
- Decoded texture-memory target ≤80 MB on mobile.
- Normal runtime target 50–60 FPS.
- Sustained FPS below 45 on D-AND-MID is a release blocker.
- No duplicate canvas/listeners or continued movement/network processing while hidden.
- Largest gallery media is excluded from initial cover/game preload.

## 7. Accessibility coverage

P0 verification includes:

- Keyboard-only flow on current Chrome or Edge and Firefox desktop.
- VoiceOver smoke test on iPhone Safari and macOS Safari.
- Browser zoom at 200% on desktop.
- Text resizing and narrow viewport reflow.
- `prefers-reduced-motion` behavior.
- High-contrast focus indicators and non-color state communication.
- Dialog focus trap/restore and deterministic Escape behavior.
- Canvas description plus direct-navigation alternative.
- Touch targets of at least 44×44 CSS px.

Automated accessibility checks supplement but do not replace screen-reader and keyboard testing.

## 8. Automated browser coverage

Playwright projects should eventually cover:

- Chromium desktop at the project-pinned Playwright version.
- Firefox desktop at the project-pinned Playwright version.
- WebKit desktop at the project-pinned Playwright version.
- Mobile viewport/touch emulation for fast regression feedback.

Emulation is acceptable for CI layout and functional regression. It does not replace the P0 physical-device performance, touch, camera, audio, or mobile Safari checks.

## 9. Release evidence template

```text
Release candidate:
Date:
Device ID/class:
Physical or hosted-real-device:
OS exact version:
Browser exact version:
Viewport/orientation:
Input mode:
Network profile:
Critical flow result:
FPS/load/memory result where applicable:
Accessibility checks:
Fallback checks:
Evidence link:
Tester:
```

## 10. Review cadence

- Reconfirm browser majors and Apple stable/beta status at each release candidate.
- Review the matrix monthly during active development.
- Add a browser/device only when analytics, user reports, business need, or a Change Request justifies it.
- Removing a P0 target requires evidence and product/technical-owner approval.
- Record exceptions and known issues in release test evidence; do not silently weaken a gate.

## 11. Sources checked for this baseline

- Google Chrome release cadence and Chrome 153 launch: <https://developer.chrome.com/blog/chrome-two-week-start>
- Google Chrome Android requirement (Android 10+): <https://support.google.com/chrome/answer/95346/download-and-install-google-chrome-android>
- Microsoft Edge stable release notes: <https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel>
- Mozilla Firefox 155 release notes: <https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/155>
- Apple Safari release notes and Safari 26.6/27 beta status: <https://developer.apple.com/documentation/safari-release-notes>
- Apple iOS 26 compatible devices: <https://support.apple.com/guide/iphone/iphone-models-compatible-with-ios-26-iphe3fa5df43/ios>
