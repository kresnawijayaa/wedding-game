# Low-Fidelity Wireframes — Wedding Quest

**Status:** Approved  
**Task:** M0-03  
**Primary viewport:** Mobile portrait 390×844 CSS px  
**Game logical viewport:** 480×720  
**Design direction:** Taman Senja Nusantara

Approved by the product/design owner on 2026-09-15.

These wireframes define hierarchy, behavior, and responsive structure. They do not prescribe final artwork. Example names and content are dummy data.

## 1. Global composition

Layer ownership from back to front:

1. Phaser canvas: world, local player, remote players, NPCs, collisions, and interaction zones.
2. React HUD: status, audio control, interaction prompt, joystick/directional controls, and navigation.
3. React overlays: loading notices, connection notices, toasts, and non-modal guidance.
4. React dialogs: invitation content and RSVP.
5. Nested dialog/lightbox: gallery image or destructive/permission clarification where unavoidable.

The DOM shell exists before Phaser loads. The main navigation and invitation content are never children of the canvas.

## 2. Cover

```text
┌──────────────────────────────────────┐
│ Lewati ke informasi utama            │ ← visible on keyboard focus
│                                      │
│         [illustrated arch/foliage]   │
│                                      │
│              Pernikahan              │
│            AYU  &  RAMA              │
│                                      │
│        Sabtu, 12 Desember 2026       │
│                                      │
│  Kepada                              │
│  Bapak/Ibu/Saudara/i Dimas           │
│                                      │
│  [ Masuk ke taman ]                  │ ← primary
│  [ Lihat informasi undangan ]        │ ← secondary
│                                      │
│  Musik akan dimulai setelah Anda     │
│  memilih masuk.                      │
└──────────────────────────────────────┘
```

Behavior:

- Primary action opens avatar selection; it does not load Phaser before activation.
- Secondary action enters non-game information mode.
- Copy remains readable over a dedicated tinted surface, not directly over unpredictable artwork.
- Guest name wraps safely and cannot push actions below the reachable viewport.

## 3. Avatar selection

```text
┌──────────────────────────────────────┐
│ [← Kembali]                          │
│                                      │
│ Pilih karakter                       │
│ Karakter ini akan menemani Anda      │
│ menjelajahi taman.                   │
│                                      │
│   ┌──────────┐    ┌──────────┐       │
│   │ sprite A │    │ sprite B │       │
│   │  ○ Aruna │    │  ○ Bima  │       │
│   └──────────┘    └──────────┘       │
│   ┌──────────┐    ┌──────────┐       │
│   │ sprite C │    │ sprite D │       │
│   │  ○ Citra │    │  ○ Damar │       │
│   └──────────┘    └──────────┘       │
│                                      │
│ [ Masuk sebagai Aruna ]              │ ← disabled until selected
└──────────────────────────────────────┘
```

- Implement as a labelled radio group; arrow keys move between choices.
- Each choice has visible default, focus, selected, pressed, and disabled states.
- Names are identifiers, not gender labels.

## 4. Loading and game startup

```text
┌──────────────────────────────────────┐
│ Menyiapkan taman…               64%  │
│ ███████████████░░░░░░░░░░            │
│                                      │
│ [soft illustration / loading scene] │
│                                      │
│ Sambil menunggu, Anda tetap dapat    │
│ membuka informasi acara.             │
│                                      │
│ [ Lihat informasi ]                  │
│                                      │
│ Memuat dunia dan karakter            │
└──────────────────────────────────────┘
```

- Show determinate progress when known; otherwise use a non-deceptive indeterminate state.
- After a documented timeout, show the load-error pattern without removing direct navigation.
- Reduced-motion uses a static progress treatment rather than looping decorative movement.

## 5. Mobile game HUD

```text
┌──────────────────────────────────────┐
│ [● 12 tamu]                  [♪ On] │ ← safe-area top
│                                      │
│                                      │
│            PHASER WORLD              │
│                                      │
│          [remote bubble: Halo!]      │
│                  [player]            │
│                                      │
│       ┌──────────────────────┐       │
│       │ Dekat: Galeri        │       │
│       │ [ Buka galeri ]      │       │ ← contextual, 44px+
│       └──────────────────────┘       │
│                                      │
│ [ joystick ]          [Chat] [Aksi] │
│ ──────────────────────────────────── │
│ [Kisah] [Acara] [Galeri] [RSVP] [••]│ ← safe-area bottom
└──────────────────────────────────────┘
```

Rules:

- HUD avoids important collision/interactions near safe-area edges.
- Joystick appears for coarse pointers; keyboard help is available for fine pointers.
- Interaction prompt appears only near an eligible station and names the outcome.
- Chat composer is non-blocking; opening it clears movement.
- `••` opens Gift and Photobooth when five visible navigation items no longer fit accessibly.
- Presence count is omitted—not shown as zero—when realtime is disabled.

## 6. Desktop game shell

```text
┌──────────────────────────────────────────────────────────────────┐
│ Wedding Quest — Ayu & Rama        ● 12 tamu   Musik: On   Bantuan│
├──────────────┬───────────────────────────────────────┬───────────┤
│ Kisah        │                                       │ Chat      │
│ Acara        │              PHASER WORLD             │ [input]   │
│ Galeri       │                                       │ Reaksi    │
│ RSVP         │                    [player]            │ ♡  ✨  👋 │
│ Hadiah       │                                       │           │
│ Photobooth   │         [Enter — Buka galeri]         │ status    │
│              │                                       │ koneksi   │
├──────────────┴───────────────────────────────────────┴───────────┤
│ Gunakan WASD atau tombol panah • Enter untuk berinteraksi        │
└──────────────────────────────────────────────────────────────────┘
```

- Side navigation appears only when content has room; tablet may retain bottom navigation.
- Chat panel can collapse and never reduces the game below its minimum usable size.
- No functionality depends on hover.

## 7. Shared modal frame

```text
┌──────────────────────────────────────┐
│ [section eyebrow]              [×]  │
│ Judul modal                          │
│ Ringkasan atau metadata              │
├──────────────────────────────────────┤
│                                      │
│ Scrollable content owned by React    │
│                                      │
├──────────────────────────────────────┤
│ [secondary action] [primary action]  │ ← sticky only when needed
└──────────────────────────────────────┘
```

- Mobile: bottom sheet/full-height dialog depending on content length.
- Desktop: constrained dialog, maximum readable text measure around 65 characters.
- Focus enters at the heading or first meaningful control, remains trapped, and returns to the trigger.
- Background DOM and game input become inert. Escape closes only this topmost dismissible layer.

## 8. Couple modal — “Kisah Kami”

```text
┌──────────────────────────────────────┐
│ Kisah kami                     [×]  │
│ [portrait Ayu]  Ayu                  │
│ short biography                      │
│                                      │
│              &                       │
│                                      │
│ Rama                 [portrait Rama] │
│ short biography                      │
│ ──────────────────────────────────── │
│ Perjalanan kami                      │
│ year • milestone                     │
│ year • milestone                     │
└──────────────────────────────────────┘
```

Empty biography or timeline sections are omitted cleanly; the modal never displays empty cards.

## 9. Schedule and location modal — “Acara”

```text
┌──────────────────────────────────────┐
│ Acara                          [×]  │
│ Sabtu, 12 Desember 2026              │
│                                      │
│ 09.00 WIB  Akad Nikah                │
│ 11.00 WIB  Resepsi                   │
│                                      │
│ Gedung Taman Senja                   │
│ Jalan Contoh No. 12, Jakarta         │
│                                      │
│ [ Buka petunjuk arah ]               │
│ [ Salin alamat ]                     │
└──────────────────────────────────────┘
```

- Times always include `WIB`.
- Map links open safely in a new browser context with a meaningful accessible label.
- If a map link is missing, the full selectable address remains available.

## 10. Gallery and lightbox

```text
┌──────────────────────────────────────┐
│ Galeri                         [×]  │
│ Kenangan pilihan                    │
│ ┌───────────┐ ┌───────────────────┐ │
│ │ photo 1   │ │ photo 2           │ │
│ └───────────┘ └───────────────────┘ │
│ ┌───────────────────┐ ┌───────────┐ │
│ │ photo 3           │ │ photo 4   │ │
│ └───────────────────┘ └───────────┘ │
│                                      │
│ Memuat foto berikutnya…              │
└──────────────────────────────────────┘

Lightbox
┌──────────────────────────────────────┐
│ Foto 2 dari 12                 [×]  │
│                                      │
│            [full image]              │
│                                      │
│ [← Sebelumnya]      [Berikutnya →]  │
│ Caption foto                         │
└──────────────────────────────────────┘
```

- Thumbnails lazy-load and preserve intrinsic aspect ratio to avoid layout shift.
- Lightbox provides previous/next buttons, keyboard arrows, a close button, index text, and meaningful alt text.
- Empty state: `Galeri sedang dipersiapkan` with a return action; no broken placeholders.

## 11. RSVP and wishes modal

```text
┌──────────────────────────────────────┐
│ Konfirmasi kehadiran           [×]  │
│ Untuk Dimas • Kuota maksimal 2      │
│                                      │
│ Apakah Anda akan hadir?              │
│ ( ) Ya, saya akan hadir              │
│ ( ) Maaf, saya tidak dapat hadir     │
│                                      │
│ Jumlah yang hadir                    │
│ [ − ]             1             [ + ]│
│                                      │
│ Ucapan (opsional)                    │
│ [                                  ] │
│ 0/500                                │
│                                      │
│ [ Kirim konfirmasi ]                 │
└──────────────────────────────────────┘
```

States:

- Existing RSVP pre-fills the form and changes the action to `Simpan perubahan`.
- Inline errors sit below the relevant labelled field and receive focus on failed submission.
- Loading keeps values visible and prevents duplicate submission.
- Success replaces the form header with a brief confirmation and provides `Ubah jawaban`.
- Network failure preserves input and provides `Coba kirim lagi`.
- Deadline passed shows the saved response read-only plus configured contact guidance.

## 12. Gift modal — “Tanda Kasih”

```text
┌──────────────────────────────────────┐
│ Tanda kasih                    [×]  │
│ Kehadiran dan doa Anda sudah sangat │
│ berarti bagi kami.                   │
│                                      │
│ Bank Contoh                          │
│ 1234 5678 9012                       │
│ a.n. Ayu Contoh                      │
│ [ Salin nomor rekening ]             │
│                                      │
│ E-wallet Contoh                      │
│ 0812••••5678                         │
│ [ Salin nomor e-wallet ]             │
│                                      │
│ Data ini tidak pernah diproses       │
│ sebagai pembayaran oleh situs.       │
└──────────────────────────────────────┘
```

- Copy actions announce success without exposing values to analytics or logs.
- Missing gift methods produce a warm informational state rather than an empty container.

## 13. Wishes board — “Ucapan”

```text
┌──────────────────────────────────────┐
│ Ucapan untuk kami              [×]  │
│ [ Tulis ucapan ]                     │
│ ──────────────────────────────────── │
│ Dimas                                │
│ “Semoga selalu berbahagia…”          │
│                                      │
│ Sari                                 │
│ “Selamat menempuh hidup baru…”       │
│                                      │
│ [ Muat ucapan berikutnya ]           │
└──────────────────────────────────────┘
```

- Wishes are durable invitation content and separate from ephemeral realtime chat.
- Guest-authored text is sanitized, rendered as plain text, and shown only when its moderation state permits.
- Empty state explains that the guest can become the first sender and links to the RSVP/wish form.
- Loading uses text-shaped skeletons; failure provides retry without dismissing already loaded wishes.

## 14. Chat composer and reactions

```text
┌──────────────────────────────────────┐
│ Sapa tamu lain                 [×]  │
│ Pesan muncul sementara dan tidak     │
│ disimpan.                            │
│ [ Tulis pesan…                     ] │
│ 0/120              [ Kirim sapaan ] │
│                                      │
│ Reaksi cepat                         │
│ [♡] [✨] [👋] [🎉]                   │
└──────────────────────────────────────┘
```

- Opening the composer clears movement; sending or closing restores focus safely.
- Rate limit state states when sending can be retried.
- Blocked content is explained without repeating the rejected message.
- If disconnected, input is disabled and `Koneksi terputus—mencoba menyambung kembali` is shown.

## 15. Photobooth

```text
Intro
┌──────────────────────────────────────┐
│ Photobooth                     [×]  │
│ [frame preview illustration]         │
│ Foto diproses di perangkat Anda dan │
│ tidak dikirim ke server.             │
│ [ Aktifkan kamera ]                  │
└──────────────────────────────────────┘

Camera
┌──────────────────────────────────────┐
│ Photobooth                     [×]  │
│ ┌──────────────────────────────────┐ │
│ │         live camera             │ │
│ │         frame overlay           │ │
│ └──────────────────────────────────┘ │
│ [ Ambil foto ]                       │
└──────────────────────────────────────┘

Preview
┌──────────────────────────────────────┐
│ Hasil foto                     [×]  │
│ ┌──────────────────────────────────┐ │
│ │        local capture            │ │
│ └──────────────────────────────────┘ │
│ [ Ambil ulang ] [ Unduh foto ]      │
└──────────────────────────────────────┘
```

- Permission is requested only from `Aktifkan kamera`.
- Closing stops the media stream and discards the capture after an explicit, clear warning only when necessary.
- Unsupported/denied states never loop permission prompts.

## 16. Non-game information mode

```text
┌──────────────────────────────────────┐
│ Ayu & Rama                    [Menu] │
│ Sabtu, 12 Desember 2026              │
│                                      │
│ Kisah kami                           │
│ [summary content]                    │
│                                      │
│ Acara                                │
│ [time, venue, map action]            │
│                                      │
│ Galeri                               │
│ [responsive preview]                 │
│                                      │
│ [ Konfirmasi kehadiran ]             │
│                                      │
│ [ Coba masuk ke taman ]              │
└──────────────────────────────────────┘
```

This is a first-class accessible page, not merely an error screen. It may use inline sections instead of repeated dialogs, while sharing the same content components and contracts.

## 17. Loading, empty, error, and degraded states

```text
┌──────────────────────────────────────┐
│ [context illustration or icon]      │
│                                      │
│ Clear state title                    │
│ What happened and why, when known.  │
│ What the guest can do next.          │
│                                      │
│ [ Specific primary action ]          │
│ [ Safe fallback action ]             │
└──────────────────────────────────────┘
```

| State | Primary message | Primary action | Guaranteed fallback |
|---|---|---|---|
| Invitation loading | `Menyiapkan undangan…` | None until timeout | Skeleton preserving navigation area |
| Game loading | `Menyiapkan taman…` | `Lihat informasi` | Direct information mode |
| Game failed | `Taman belum dapat dibuka` | `Coba lagi` | `Lihat informasi undangan` |
| Offline | `Anda sedang offline` | `Coba sambungkan lagi` | Previously loaded read-only content |
| Realtime disconnected | `Koneksi tamu terputus` | Background retry | Local game and content |
| Realtime disabled | No warning banner | None | Local game |
| Camera denied | `Kamera belum diizinkan` | `Lihat cara mengizinkan` | Close photobooth |
| Camera unsupported | `Photobooth tidak tersedia di perangkat ini` | `Kembali ke undangan` | All other invitation features |
| Gallery empty | `Galeri sedang dipersiapkan` | `Kembali` | Other content |
| RSVP save failed | `Konfirmasi belum tersimpan` | `Coba kirim lagi` | Preserved form values |
| Link invalid/revoked | `Tautan undangan tidak dapat digunakan` | Configured host contact | No guest data disclosed |
| Invitation expired | `Masa akses undangan telah berakhir` | Configured host contact | No game initialization |
| Unpublished | `Undangan sedang dipersiapkan` | `Coba lagi nanti` | No private content disclosed |

Errors use text and icons, never color alone. Error copy answers what happened and what the guest can do next; it does not blame the guest or use humor.

## 18. Responsive and accessibility rules

- Base design starts at 320 CSS px and must remain usable at 200% browser zoom.
- Touch targets are at least 44×44 CSS px; visible controls may be smaller only when their hit area remains compliant.
- Safe-area insets protect the top HUD, bottom navigation, joystick, and action button.
- At content-driven breakpoints, bottom navigation may become a side rail and bottom sheets may become centered dialogs.
- Coarse-pointer devices receive joystick/directional controls; fine-pointer devices receive keyboard hints. Screen size alone never chooses the input mode.
- Body text is at least 1rem with a readable measure; decorative display typography is never used for long-form content or form labels.
- Focus rings maintain at least 3:1 contrast against adjacent colors.
- Body text targets WCAG AA 4.5:1; controls and meaningful graphics target 3:1.
- Optional movement and spatial transitions are removed or replaced with short fades under `prefers-reduced-motion`.
- The canvas has a meaningful description and an adjacent direct-navigation alternative.

## 19. Visual baseline for the later high-fidelity phase

- Dominant surface: warm parchment/cream.
- Primary: deep leaf green.
- Accent: restrained terracotta and muted gold.
- Neutrals are warm-tinted; no pure black or pure white.
- Use an editorial display face paired with a highly readable body face; final font selection belongs in the visual-design implementation task and must be performance-tested.
- Use a 4-point spacing system and varied rhythm rather than equal padding everywhere.
- Decorative motifs remain subordinate to content and are omitted when they harm contrast or loading budgets.

## 20. Review checklist

- [ ] Cover provides game and direct-information paths.
- [ ] Avatar selection supports touch and keyboard.
- [ ] Game HUD fits safe areas and does not obscure interaction.
- [ ] Couple, schedule, gallery/lightbox, RSVP, wishes, gift, chat, and photobooth layouts are represented.
- [ ] Loading, empty, error, offline, permission, unsupported, unpublished, expired, and revoked states are represented.
- [ ] Mobile, desktop, keyboard, screen-reader, and reduced-motion behavior is specified.
- [ ] React/Phaser ownership and input-lock behavior match the typed bridge contract.
- [ ] Product owner approves the flow and low-fidelity hierarchy before visual implementation.
