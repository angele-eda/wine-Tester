# Design QA — File Converter

- Source visual truth: `C:\Users\원대\Downloads\convertfiles24-file-converter.html` and `C:\Users\원대\Downloads\convertfiles24-file-converter-dark.html`
- Implementation screenshots: `qa/file-converter-light.png`, `qa/file-converter-dark.png`, `qa/file-converter-mobile.png`
- Desktop viewport: 1440 × 1000 CSS px; mobile viewport: 390 × 844 CSS px
- States checked: Korean light, Korean dark, mobile dark, empty and selected-file conversion states

## Visual comparison

The implementation follows the supplied editorial composition: restrained warm background, compact header, centered format diagram, single focused conversion card, three-column benefit section, and a minimal footer. The dark theme uses the supplied near-black surfaces, warm neutral borders, blue focus states, and white primary typography.

The mobile layout preserves the same hierarchy while collapsing format controls and benefits without horizontal overflow. Navigation reduces to brand, language, and theme controls so the converter remains usable at 390px.

## Interaction verification

- Image input to JPG, PNG, WebP, and PDF produced real downloadable files with valid signatures.
- Two-page PDF input to JPG, PNG, and WebP produced real ZIP downloads containing page images.
- PDF input to PDF produced a real PDF download.
- Mobile PNG to JPG conversion and download passed at 390 × 844.
- File validation enforces one JPG, PNG, WebP, or PDF file up to 25MB.
- Disabled, active, success, error, replacement, theme, and language states were checked.
- Browser console errors: none.
- Horizontal overflow: none.
- External runtime dependencies: none; PDF libraries are served locally.

## Scope verification

Only `/convert/` and the locally vendored PDF helper were changed. The other five legacy tool pages were not modified.

## Findings

- P1 fixed: the initial download control could become visible before conversion because component styling overrode the native `hidden` state.
- P2 fixed: externally hosted fonts and PDF helper could emit network errors or prevent image-to-PDF conversion offline. The font request was removed and the PDF helper is now local.
- P3 fixed: placeholder text-glyph benefit icons were replaced with source-consistent inline SVG icons.
- No actionable P0, P1, or P2 findings remain.

final result: passed
