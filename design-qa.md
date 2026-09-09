# PDF Compress Design QA

- Source visual truth: deployed File Converter and PDF Merge design family, based on the user-selected PDF Merge screenshot `codex-clipboard-8d53c277-cbb7-4ed7-873e-2c9b457772d0.png`
- Implementation: `http://127.0.0.1:4674/compress-pdf/?lang=ko`
- Implementation screenshot: Codex in-app browser inline capture; persistent screenshot path unavailable
- Viewport: desktop browser default, CSS density 1x
- State: two-page PDF loaded, balanced compression completed

**Findings**

- No actionable P0/P1/P2 differences remain. The shared header, hero, 620px work card, settings, privacy note, actions, features, footer, typography, spacing, radii, light/dark tokens, and copy hierarchy match the established tool-page design.
- No new raster imagery is required. The existing brand asset is reused.
- The PDF-specific warning clearly explains that raster compression may remove searchable text.

**Primary interactions tested**

- Two-page PDF selection and page-count/size detection
- Balanced compression to a real PDF blob
- Download filename `converter-two-pages-compressed.pdf`
- Console errors: none
- Light/dark and responsive rules reuse the verified shared tool-page system

**Comparison history**

- First implementation pass had a mismatched text brand mark; it was replaced visually with the existing favicon brand asset.
- Post-fix interaction capture showed the shared layout with no blocking visual drift.

**Follow-up Polish**

- Test compression ratio with a large image-heavy PDF; tiny PDFs can become larger because of PDF/JPEG overhead.

final result: passed

## PDF Organize QA — 2026-09-09

- Source visual truth: approved ConvertFiles24 PDF Merge/File Converter single-card design family.
- Implementation: `http://127.0.0.1:4674/pdf-organize/?lang=ko`
- Implementation screenshot: Codex in-app browser inline capture, desktop 1265 × 712 CSS px, 1x density.
- State: Korean dark mode, two-page PDF loaded, first page rotated, order changed, organized output created.

**Comparison evidence**

- The shared header, centered hero, format diagram, calm-blue primary action, green download action, 720px work card, features, and footer follow the approved PDF tool hierarchy.
- Fonts and typography reuse the established display/UI stacks and optical weights. Spacing, radii, shadows, border tokens, and dark-mode contrast are consistent with PDF Merge.
- Material Symbols are used for page movement, rotation, removal, privacy, and actions; no placeholder or custom-drawn visual assets are present.
- Focused page cards preserve readable thumbnails and controls. The grid collapses from three to two columns on narrow screens and the list scrolls vertically after 430px.

**Primary interactions tested**

- Two-page PDF recognized and rendered as two thumbnails.
- First page rotated 90 degrees and moved after the second page.
- Organized PDF blob created (1.1 KB), download control exposed, download event completed.
- Browser console errors: none.

**Findings**

- No actionable P0/P1/P2 differences remain.

**Follow-up Polish**

- Drag-and-drop page reordering may be added later; the current arrow controls are clearer on mobile and fully functional.

final result: passed

## QR Code Generator QA — 2026-09-09

- Source visual truth: the approved ConvertFiles24 File Converter/JPG-to-PDF single-card design already deployed in this repository.
- Implementation: `http://127.0.0.1:4674/qr-code/?lang=ko`
- Implementation screenshot: Codex in-app browser inline capture; desktop viewport 1265 × 712 CSS px at 1x density.
- State: Korean, dark theme, generated-result interaction separately tested.

**Full-view comparison evidence**

- Header, centered hero, compact format diagram, 620px work card, feature section, and footer use the same shared stylesheet and visual hierarchy as the approved tool family.
- Typography uses the same UI/display stack, weights, and muted hierarchy. Spacing, border radii, background tokens, and calm blue action color match the existing tool pages.
- The first capture exposed Material Symbols as text; the Material Symbols library was then loaded explicitly. The post-fix capture shows real link, QR, language, theme, lock, arrow, and download icons.
- No raster imagery is needed for this utility. The brand asset and established icon library are reused.

**Focused interaction evidence**

- URL input generated a 512 × 512 PNG QR code with the selected four-unit quiet margin.
- Download href is a real PNG data URL (12,742 characters), not a fake toast or delayed placeholder.
- EN/KO/JA/ES copy, light/dark mode, disabled empty state, character count, size and margin controls were checked.
- Browser console errors: none.
- Responsive CSS collapses the two setting columns and tightens the format diagram below 620px.

**Findings**

- No actionable P0/P1/P2 differences remain.

**Follow-up Polish**

- A future iteration could add SVG export, but it is outside the requested simple PNG workflow.

final result: passed

## Remaining Tool Rollout QA — 2026-09-09

- JPG/PNG to PDF: two PNG files produced a real two-page `images.pdf` (48.3 KB) locally and in production; no console errors.
- Image to ICO: 256px PNG produced a real ICO (93.0 KB); download action exposed; no console errors.
- Favicon generator: 256px PNG produced a real ZIP package (325.5 KB); download action exposed; no console errors.
- Image compression: PNG produced a downloadable result (56.5 KB); no console errors. Tiny PNG fixtures may not shrink because the tool preserves the smaller original.
- Image crop: PNG produced a cropped downloadable result (11.7 KB); no console errors.
- Image resize: query-language precedence was corrected so `?lang=ko` overrides an older stored language.
- HEIC to JPG: existing real `heic2any` pipeline and file validation retained; a genuine HEIC fixture was not available in the repository for an end-to-end conversion.
- Shared image tools now use the same centered 620px single-card hierarchy, border, shadow, controls, responsive width, features, and footer rhythm as the approved File Converter family.

final result: passed
