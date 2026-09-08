# PDF Merge Design QA

- Source visual truth: `http://127.0.0.1:4674/convert/?lang=ko` (existing File Converter page)
- Implementation: `http://127.0.0.1:4674/pdf-merge/?lang=ko`
- Implementation screenshot: Codex in-app browser inline capture (the browser surface does not expose a persistent screenshot path)
- Viewport: 1280 × 720 CSS px, desktop, light theme
- Source/implementation density: browser CSS pixels at the same desktop density; no normalization required
- State: two PDFs selected, merge completed, download ready

**Full-view comparison evidence**

- Header, hero typography, centered format diagram, 620px work card, privacy notice, primary and download buttons, feature section, and footer reuse the File Converter stylesheet and layout.
- The PDF-specific work card adds only the file order list and controls required for merging.

**Focused region comparison evidence**

- The work-card region was inspected after selecting `sample-a.pdf` and `sample-b.pdf`. File count, total size, per-file size, order controls, enabled merge button, success message, and blob download link rendered correctly.
- A separate focused crop was not needed because all core controls were legible in the 1280 × 720 browser capture.

**Findings**

- No actionable P0/P1/P2 visual differences remain.
- Typography: inherited from the same IBM Plex Sans/Sora stack and matching weights used by File Converter.
- Spacing/layout: the hero, card width, padding, radii, feature spacing, and footer rhythm match the source structure.
- Colors/tokens: the same light/dark surface, line, blue, success, and muted tokens are reused.
- Image/assets: no raster imagery is required; the existing brand and UI marks are reused.
- Copy/content: all text is PDF-merge-specific and available in English, Korean, Japanese, and Spanish.

**Primary interactions tested**

- Two-file selection and file metadata rendering
- File order controls and merge-button enablement
- Real client-side PDF merge with a generated blob download link
- Language switching and dark-theme switching
- Horizontal overflow check at 1280 × 720: none
- Browser console errors: none during the successful merge flow

**Comparison history**

- Initial pass found completed-status text remained Korean after switching to Japanese (P2).
- Fixed by retaining result size and rebuilding the success message whenever the language changes.
- Post-fix code and syntax verification confirm the localized success-state path is present.

**Follow-up Polish**

- Mobile controls are intentionally text-based for clarity; no P3 changes are required now.

final result: passed
