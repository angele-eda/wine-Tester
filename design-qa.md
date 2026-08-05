# Design QA — Mobile Menu and Back-to-Top Control

- Source visual truth: `C:\Users\원대\Downloads\Screenshot_20260805_175035_Chrome.jpg`
- Implementation screenshots: `qa/mobile-menu-overlay-light.png`, `qa/mobile-menu-overlay-dark.png`
- Viewport: 360 × 720 CSS px for final light capture; dark behavior verified at 390 × 844
- Source pixels: 1080 × 2160 including mobile Chrome UI; implementation: 360 × 720 at device scale factor 1
- Normalization: compared the app-owned open-menu region; source browser chrome was excluded from fidelity judgments
- State: hamburger menu open, light and dark themes

## Full-view comparison evidence

The right-side menu remains an opaque panel while the page behind it is lightly darkened without blur. A dedicated 72px menu header removes the empty upper area without changing the panel width, top offset, navigation order, language control, or page layout.

## Focused region comparison evidence

The open menu occupies 240px at a 360px viewport, matching the existing two-thirds mobile rule. Computed styles confirm a full-viewport `rgba(0, 0, 0, 0.35)` overlay and no backdrop blur in both themes. The panel computes to opaque white in light mode and `rgb(15, 23, 42)` in dark mode.

The new header computes to 72px high with `rgb(243, 247, 255)` and `rgb(220, 230, 245)` as its light background and lower border. Dark mode uses `rgb(24, 36, 59)`, visibly lighter than the `rgb(15, 23, 42)` panel. Menu content begins 24px below the header.

## Required fidelity surfaces

- Fonts and typography: existing menu typography, wrapping, sizes, weights, and hierarchy are unchanged.
- Spacing and layout rhythm: existing panel dimensions, padding, top offset, border radius, and navigation spacing are unchanged.
- Colors and visual tokens: the revised 35% overlay, removed blur, and panel colors are exact; the shadow is `-12px 0 32px rgba(15, 23, 42, .18)`.
- Image quality and asset fidelity: the existing brand logo and Material Symbols icons are unchanged; no new raster or substitute assets were introduced.
- Copy and content: all existing localized menu labels and controls are unchanged.

## Interaction verification

- Tapping the overlay closes the menu.
- Tapping the header X closes the menu and returns keyboard focus to the hamburger button.
- Korean privacy navigation renders as `개인정보 보호` with `notranslate` and `translate="no"` to prevent Chrome mistranslation.
- Navigation and language-control vertical padding is reduced from 12px to 10px (about 16.7%).
- Opening the menu adds the `mobile-menu-open` state and sets HTML/body overflow to hidden.
- Closing the menu removes the state and restores body overflow to visible.
- Escape, navigation-link, theme, and language close behavior remain connected through the existing menu state function.
- No horizontal overflow at 360px.
- Browser console errors: none.
- The mobile-only back-to-top control stays hidden before 500px, appears as a 44 × 44px circle after the threshold, and sits 18px from the visual right/bottom edges.
- Opening the menu or a dialog hides the control; closing the overlay restores it when the page remains beyond the threshold.
- Activating the control smoothly returns the document to `scrollY: 0`, then hides it again.
- The localized accessible label is available in English, Korean, Japanese, and Spanish.

## Findings

No actionable P0, P1, or P2 findings remain.

## Comparison history

- Initial implementation passed the visual and interaction comparison; no P0/P1/P2 fixes were required.

## Follow-up polish

- P3: none required.

final result: passed
