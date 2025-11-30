# Mykadoo Logo Usage Guidelines

## Logo Variations

### Primary Logo (Full Color)
**File:** `logos/mykadoo-logo-full.svg`
- **Use:** Main logo for light backgrounds
- **Color:** Heart icon in Coral (#FF6B6B), wordmark in dark gray (#212121)
- **Best for:** Website headers, marketing materials, presentations

### Icon Only
**File:** `logos/mykadoo-icon.svg`
- **Use:** Small spaces, app icons, social media avatars
- **Color:** Coral (#FF6B6B)
- **Best for:** Favicons, profile pictures, compact layouts

### Monochrome Version
**File:** `logos/mykadoo-logo-monochrome.svg`
- **Use:** Single-color applications
- **Color:** Black (#212121)
- **Best for:** Print, fax, watermarks, limited color contexts

### White Version
**File:** `logos/mykadoo-logo-white.svg`
- **Use:** Dark backgrounds
- **Color:** White (#FFFFFF)
- **Best for:** Dark mode UI, photo overlays, dark marketing materials

## Clear Space

Maintain a minimum clear space around the logo equal to the height of the heart icon in all directions. This ensures the logo has breathing room and maintains its visual impact.

**Minimum clear space:** Height of the heart icon (approximately 24px in the base size)

## Minimum Sizes

To maintain legibility and visual impact:

- **Full logo:** Minimum width of 120px (digital), 1.5 inches (print)
- **Icon only:** Minimum size of 32×32px (digital), 0.5 inches (print)

**Never scale below these minimums.** Use the icon-only version for very small sizes.

## Color Usage

### Primary Usage
- Full color logo on white or light backgrounds
- White logo on dark backgrounds or photos
- Icon in coral (#FF6B6B) with sufficient contrast

### Acceptable Variations
- Monochrome black on light backgrounds
- Monochrome white on dark backgrounds
- Always maintain contrast ratio of at least 4.5:1 for accessibility

### Don'ts
❌ Do not use logo on busy backgrounds without sufficient contrast
❌ Do not change the logo colors
❌ Do not add effects (gradients, shadows, outlines)
❌ Do not rotate or distort the logo
❌ Do not place logo on colors that don't provide sufficient contrast

## Background Usage

### Recommended Backgrounds
✅ White (#FFFFFF)
✅ Light neutral (#FAFAFA, #F5F5F5)
✅ Dark gray or black (#212121, #000000) with white logo
✅ Solid colors with sufficient contrast

### Backgrounds to Avoid
❌ Busy patterns or images without contrast treatment
❌ Similar colors to logo (coral, red, pink tones)
❌ Low-contrast backgrounds

## Modifications

**DO NOT:**
- Alter the proportions
- Rearrange elements
- Add new elements
- Change fonts
- Apply filters or effects
- Recreate or redraw the logo

If you need a variation not provided, contact the design team.

## File Formats

- **SVG:** Primary format for all digital uses (scalable, high quality)
- **PNG:** For raster requirements (transparent background available)
- **WebP:** For web optimization
- **ICO:** For favicons only

## Favicons

Multiple sizes are provided for different devices and contexts:
- `favicon.svg` - Modern browsers (scalable)
- `icon-192.svg` - PWA, Android
- `icon-512.svg` - High-res displays, iOS

## Open Graph Images

**File:** `og-images/og-default.svg`
- **Size:** 1200×630px (Facebook/LinkedIn/Twitter standard)
- **Use:** Social media sharing, link previews
- **Customize:** Update text for specific pages/campaigns

## Exporting Assets

### To PNG
Use a tool like SVGOMG, Inkscape, or your design software to export SVGs to PNG at the required resolutions:
- 1x (base)
- 2x (retina displays)
- 3x (high-density displays)

### To WebP
Convert PNG exports to WebP for web optimization:
```bash
# Example using cwebp (ImageMagick alternative)
cwebp -q 80 input.png -o output.webp
```

### To ICO
For favicon.ico, combine multiple PNG sizes (16×16, 32×32, 48×48):
```bash
# Example using ImageMagick
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

## Contact

For logo-related questions, custom variations, or design assets:
- Design Team: design@mykadoo.com
- Brand Guidelines: /docs/brand-guidelines.pdf

---

**Last Updated:** 2024-11-30
**Version:** 1.0
