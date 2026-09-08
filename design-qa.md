# PDF Split Design QA

- Source visual truth: user-provided PDF Merge screenshot `codex-clipboard-8d53c277-cbb7-4ed7-873e-2c9b457772d0.png`
- Implementation: `http://127.0.0.1:4674/split-pdf/?lang=ko`
- Implementation screenshot: Codex in-app browser inline capture (persistent screenshot path unavailable from this browser surface)
- Viewport: 1280 × 720 CSS px, desktop, dark and light themes
- Source/implementation density: same browser CSS scale; no density normalization required
- State: two-page PDF loaded, page 2 extracted, download ready

**Full-view comparison evidence**

- The implementation reuses the File Converter/PDF Merge header, hero proportions, format diagram, 620px work card, privacy note, completed-action color, features, and footer.
- The PDF-specific controls are limited to two split methods and one conditional page-range input.

**Focused region comparison evidence**

- The work-card region was inspected at 1280 × 720 after loading `converter-two-pages.pdf`.
- All-pages mode generated a 1.9 KB ZIP and exposed a working download.
- Range mode with page `2` generated an 870 B PDF and exposed a working download.
- Invalid page `3` correctly displayed the localized range error for the two-page source.

**Findings**

- No actionable P0/P1/P2 visual or interaction differences remain.
- Typography: shared IBM Plex Sans/Sora stack, hierarchy, weights, and compact field labels match the reference family.
- Spacing/layout: shared hero, card, radius, section gaps, button height, and footer rhythm match the reference.
- Colors/tokens: shared light/dark surfaces, borders, calm completed blue, green download color, and muted text tokens are reused.
- Image/assets: no raster imagery is required; existing brand and document marks are reused.
- Copy/content: split-specific copy is available in English, Korean, Japanese, and Spanish.

**Primary interactions tested**

- Two-page PDF selection and page-count/size detection
- Every-page split to ZIP and download
- Page-range extraction to PDF and download
- Out-of-range validation
- Light/dark theme switching
- Horizontal overflow check at 1280 × 720: none
- Browser console errors during successful flows: none

**Comparison history**

- First implementation pass passed the desktop design comparison without P0/P1/P2 drift.

**Follow-up Polish**

- None required for this compact first release.

final result: passed
