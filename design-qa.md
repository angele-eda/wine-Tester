# Design QA — Unified Converter Workspaces

- Source visual truth: `qa/source-image-crop.png` (`/image-crop/?lang=ko`)
- Implementation screenshots: `qa/implementation-pdf-merge.png`, `qa/implementation-file-converter.png`
- Viewport: 1280 × 900 CSS px, device scale factor 1
- Source and implementation pixels: 1280 × 900
- State: Korean, light theme, empty file-selection state

## Full-view comparison evidence

The six legacy workspaces now follow the image-crop page composition: centered tool eyebrow/title/copy, a 1040px two-column work panel, a large file-selection surface on the left, and output settings plus a private-processing note and primary action on the right. Header width, warm background, border treatment, radius, and restrained shadow follow the same tokens.

## Focused region comparison evidence

The file-selection region was checked at desktop and mobile widths. It uses the same blue Material icon, clear selection title, blue file-selection control, supporting copy, and dashed neutral border as the image-crop reference. The right column uses the same 390px track, compact field rhythm, green lock treatment, and full-width blue action button with a right arrow.

## Required fidelity surfaces

- Fonts and typography: Sora is used for primary headings and IBM Plex Sans for interface copy; heading size, weight, letter spacing, and hierarchy match the reference.
- Spacing and layout rhythm: panel width is 1040px, right track is 390px, desktop cards use 28px padding, and mobile collapses to one column without horizontal overflow.
- Colors and visual tokens: warm light background, white surfaces, neutral borders, brand blue actions, and green privacy icon reuse the reference tokens.
- Image quality and asset fidelity: no raster imagery was introduced; standard Material Symbols are used for tool and action icons.
- Copy and content: all six routes have concise Korean/English titles, descriptions, file-selection labels, output headings, and private-processing copy.

## Interaction verification

- File Converter, Merge PDF, Split PDF, Compress PDF, PDF to JPG/PNG, and JPG/PNG to PDF all completed real-file download tests after the UI change.
- The full 12-tool regression suite passed with valid ICO, ZIP, JPG, PNG, WebP, and PDF signatures where applicable.
- File inputs, drag/drop targets, settings controls, disabled/enabled action states, and downloads retain their original IDs and behavior.
- Browser console errors during the conversion suite: none.

## Findings and comparison history

- P2 fixed: the first version retained legacy hero copy, narrower panels, and emoji-heavy drop areas. It was replaced with route-specific concise copy, a reference-width panel, Material icons, and a consistent file-selection button.
- P2 fixed: the injected privacy note initially shared a flex row with the merge action. It now sits above the primary action as a full-width vertical block.
- No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- P3: secondary per-tool controls intentionally keep their functional labels, because those settings differ by converter.

final result: passed
