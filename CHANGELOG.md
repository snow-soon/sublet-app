# Roomie — Changelog

## v0.1.0 — March 4, 2026

---

### Features Added

- **Dual Auth Flow** — Role selection screen + separate Login/Signup for Seekers and Room Owners
- **Seeker Dashboard** — Tinder-style swipe cards showing room listings (price, dates, location, room type, furnished, utilities, gender pref, rules)
- **Owner Dashboard** — Swipe cards showing people looking for rooms (budget, dates, gender pref, lifestyle tags)
- **Detail Modal** — Slide-up sheet on each card with full listing/seeker info; dismissible via swipe-down gesture
- **Multi-Image Carousel** — Cards support multiple photos; tap left/right edges to browse (like Tinder)
- **Swipe Animations** — LIKE/NOPE stamps with card fly-off animation on both gesture swipe and button tap

---

### UI / Branding

- **Renamed app** from "SubMatch" → **Roomie** across all screens
- **Redesigned Auth screens** — white background, pink accents, dark text, clean modern aesthetic
  - `RoleSelectionScreen`, `SeekerAuthScreen`, `OwnerAuthScreen` all updated
- **Bigger cards** — `CARD_HEIGHT` increased from 65% → 75% of screen; `CARD_WIDTH` edge-to-edge (−24px)
- **Proportional text scaling** — apartment name (27px), price (26px), address (15px), dates (14px) all bumped up
- **Larger action buttons** — Like/Nope buttons 66×66px with wider spacing
- **Larger detail button** — 44×44px with clearer border

---

### Animation & Performance

- **Modal overlay fade** — grey dimming background now smoothly fades in/out (was instant before)
  - Uses `Animated.timing` + `overlayOpacity` animated value
  - `onShow` callback ensures animation starts only after Modal mounts
- **Drag-linked overlay** — overlay opacity tracks finger position during swipe-down dismiss
- **Spring → Timing** — replaced `Animated.spring` with `Animated.timing` (350ms open, 280ms close) for predictable 60fps
- **Image tap zones** — expanded from 35% → 45% width on each side; full card height
- **Tap vs Hold** — image navigation uses `onPress` (tap+release only), not `onPressIn`
- **Button swipe animation** — tapping Like/Nope buttons now plays the fly-off animation instead of instantly removing

---

### Bugs Fixed

- React Hooks ordering error from conditional `useRef` placement
- `Animated.timing` type error with `Animated.add`
- Modal jank on swipe-down dismiss (overlay cutting out)
- Image carousel lag on rapid taps
- Detail button unresponsive due to z-index layering conflict
- Shadow not appearing on modal open (race condition with Modal mount timing)

---

### Files Modified

| File | Changes |
|------|---------|
| `App.tsx` | Card sizing, animations, modals, branding, carousel, action buttons |
| `RoleSelectionScreen.tsx` | White/pink theme, "Roomie" branding |
| `SeekerAuthScreen.tsx` | White/pink theme, dark text, pink accents |
| `OwnerAuthScreen.tsx` | White/pink theme, matching Seeker auth style |
