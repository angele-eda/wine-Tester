// Future ConvertFiles24 topics, used after the eight October 2026 pilot dates.
// Rotate across product areas and use date-stamped slugs for idempotent publishing.
const ARTICLES = [
  ["How to Compress Photos for Email Without Making Them Blurry", "compress-photos-for-email", "/image-compress/"],
  ["When to Use PNG Instead of JPG for Web Images", "png-vs-jpg-for-web", "/jpg-png/"],
  ["How to Resize Photos for Online Forms and Applications", "resize-photos-for-applications", "/image-resize/"],
  ["Fixing Stretched Images After Changing Width and Height", "fix-stretched-images", "/image-resize/"],
  ["How to Reduce PDF File Size Before Sharing", "reduce-pdf-size-before-sharing", "/pdf-compress/"],
  ["A Simple Checklist Before Combining PDF Documents", "checklist-before-merging-pdfs", "/pdf-merge/"],
  ["How to Keep the Correct Page Order in a Combined PDF", "keep-pages-in-order-merged-pdf", "/pdf-merge/"],
  ["What to Check Before Converting PDFs to Images", "convert-pdf-to-images-checklist", "/pdf-jpg/"],
  ["Choosing Video Compression Settings for Mobile Sharing", "video-compression-for-mobile-sharing", "/video-tools/"],
  ["Why Video Bitrate Matters More Than File Extension", "video-bitrate-vs-extension", "/video-tools/"],
  ["How to Prepare Large Videos for Online Uploads", "prepare-large-videos-for-upload", "/video-tools/"],
  ["Common Causes of Blurry Video After Compression", "why-compressed-videos-look-blurry", "/video-tools/"],
  ["MP3 Bitrate Explained for Voice Recordings", "mp3-bitrate-for-voice-recordings", "/audio-tools/"],
  ["WAV and MP3: Which Is Better for Sharing Audio?", "wav-vs-mp3-for-sharing", "/audio-tools/"],
  ["How to Make Audio Attachments Smaller", "smaller-audio-attachments", "/audio-tools/"],
  ["Avoiding Quality Loss When Converting Audio Files", "avoid-audio-conversion-quality-loss", "/audio-tools/"],
  ["QR Code Size and Contrast: Make Codes Easier to Scan", "qr-code-size-and-contrast", "/qr-code/"],
  ["A QR Code Testing Checklist Before Printing", "qr-code-testing-before-print", "/qr-code/"],
  ["Why Some QR Codes Stop Working and How to Avoid It", "why-qr-codes-fail", "/qr-code/"],
  ["How to Share a Website Link With a QR Code", "share-links-with-qr-code", "/qr-code/"],
  ["How to Choose Image Dimensions for Faster Websites", "image-dimensions-for-websites", "/image-resize/"],
  ["Image Compression Mistakes That Hurt Text Readability", "image-compression-text-readability", "/image-compress/"],
  ["How to Prepare PDFs for Reliable Printing", "prepare-pdf-for-printing", "/pdf-merge/"],
  ["Splitting a PDF: Page Ranges and Common Mistakes", "split-pdf-page-range-mistakes", "/pdf-split/"],
  ["Email Attachment Limits: Practical File Preparation Tips", "email-attachment-limits-tips", "/image-compress/"],
  ["Why Resizing Is Not the Same as Image Compression", "image-resize-versus-compress", "/image-compress/"],
  ["Picking the Best Image Format for a Screenshot", "best-image-format-for-screenshots", "/jpg-png/"],
  ["How to Make Product Photos Smaller for Online Stores", "product-photo-compression", "/image-compress/"],
  ["How to Organize Several PDFs Into One Document", "organize-pdfs-before-merging", "/pdf-merge/"],
  ["Video Resolution vs File Size: A Practical Guide", "video-resolution-versus-size", "/video-tools/"],
  ["Troubleshooting Audio That Sounds Distorted After Conversion", "audio-distortion-after-conversion", "/audio-tools/"],
  ["How to Check Whether Your QR Code Scans on Different Phones", "qr-code-cross-device-testing", "/qr-code/"],
];

module.exports = function futureTopic(date, weekday) {
  if (date < "2026-11-02" || !["Mon", "Thu"].includes(weekday)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const weeks = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 10, 2)) / (7 * 86400000));
  const ordinal = weeks * 2 + (weekday === "Thu" ? 1 : 0);
  const item = ARTICLES[((ordinal % ARTICLES.length) + ARTICLES.length) % ARTICLES.length];
  return {
    title: item[0],
    slug: item[1] + "-" + date.replaceAll("-", ""),
    toolUrl: "https://convertfiles24.com" + item[2],
  };
};
