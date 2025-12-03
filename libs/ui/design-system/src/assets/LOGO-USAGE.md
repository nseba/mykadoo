# Mykadoo Logo Usage Guidelines

Complete guidelines for using the Mykadoo logo and brand assets.

## Logo Variations

### Primary Logo (Full Color)
- **File:** `logos/mykadoo-logo-full-color.svg`
- **Use:** Primary logo for all light backgrounds
- **Colors:** Coral (#FF6B6B), Blue (#339AF0), Dark Gray (#343A40)

### Icon Only (Color)
- **File:** `logos/mykadoo-icon-color.svg`
- **Use:** App icons, favicons, social media profiles
- **Size:** Square format (1:1 ratio)

### Monochrome Logo
- **File:** `logos/mykadoo-logo-monochrome.svg`
- **Use:** Black and white printing, faxes, single-color applications
- **Color:** Neutral 900 (#212529)

### White Logo
- **File:** `logos/mykadoo-logo-white.svg`
- **Use:** Dark backgrounds, photography overlays
- **Color:** White (#FFFFFF) with subtle transparency for ribbon details

## Clear Space

**Minimum clear space = height of the logo**

```
┌─────────────────────────────┐
│          CLEAR SPACE        │
│  ┌─────────────────────┐   │
│  │   [MYKADOO LOGO]    │   │
│  └─────────────────────┘   │
│          CLEAR SPACE        │
└─────────────────────────────┘
```

- No other elements should appear within the clear space
- Applies to all logo variations (full, icon, monochrome, white)
- Measured from the outermost edge of the logo

## Minimum Sizes

### Print
- **Full Logo:** 20mm width minimum
- **Icon Only:** 10mm width/height minimum

### Digital
- **Full Logo:** 120px width minimum
- **Icon Only:** 32px width/height minimum
- **Favicon:** 16px (use simplified version in `favicons/favicon.svg`)

## Favicon Sizes

All favicons are generated from the SVG source:
- **16×16px** - Browser tab
- **32×32px** - Standard bookmark
- **48×48px** - Windows site icon
- **64×64px** - Windows taskbar
- **128×128px** - Chrome webstore
- **180×180px** - iOS home screen (apple-touch-icon)
- **192×192px** - Android home screen
- **512×512px** - High-resolution displays

**Source File:** `favicons/favicon.svg` (scalable)

## Background Usage

### Light Backgrounds
- ✅ Use: Full color logo
- ✅ Use: Monochrome logo
- ❌ Avoid: White logo

### Dark Backgrounds
- ✅ Use: White logo
- ❌ Avoid: Full color logo (insufficient contrast)
- ❌ Avoid: Monochrome logo

### Photography
- ✅ Use: White logo with drop shadow if needed
- ✅ Use: Logo on solid color overlay (coral or blue with 80% opacity)
- ❌ Avoid: Logo directly on busy/low-contrast photos

## Color Variations

### Acceptable Background Colors
- ✅ White (#FFFFFF)
- ✅ Neutral 50-100 (#F8F9FA to #F1F3F5)
- ✅ Primary 50 (#FFF5F5)
- ✅ Secondary 50 (#E7F5FF)

### Dark Backgrounds (Use White Logo)
- ✅ Neutral 800-900 (#343A40 to #212529)
- ✅ Any dark photography

## Social Media Profiles

### Profile Images
- **File:** `social/social-profile-square.svg`
- **Size:** 400×400px (exported to PNG at various resolutions)
- **Format:** Square (1:1 ratio)
- **Background:** Coral (#FF6B6B) with white icon
- **Export Sizes:** 400px, 200px, 100px

### Cover Images
- **File:** `og-images/og-template.svg`
- **Size:** 1200×630px (Open Graph standard)
- **Use:** Facebook, LinkedIn, Twitter/X cards
- **Background:** Light gradient (coral to blue tints)

### Email Headers
- **File:** `social/email-header.svg`
- **Size:** 600×150px
- **Use:** Email newsletters, automated emails
- **Background:** Light gradient

## DON'Ts

### ❌ Never Do This:
1. **Change brand colors** - Always use exact hex values
2. **Distort or rotate logo** - Maintain original proportions
3. **Add effects** - No drop shadows, bevels, or gradients to the logo itself
4. **Place logo on busy backgrounds** - Ensure sufficient contrast
5. **Recreate or redraw logo** - Always use official files
6. **Place logo too small** - Respect minimum sizes
7. **Ignore clear space** - Maintain breathing room
8. **Use low-resolution files** - Always use SVG when possible, or high-res PNGs

### ❌ Color Modifications:
- Don't change the coral to red
- Don't change the blue to purple
- Don't use gradients on the logo
- Don't use patterns or textures

### ❌ Layout Issues:
- Don't stretch or compress
- Don't rotate at odd angles
- Don't place upside down (obviously!)
- Don't outline the logo

## File Formats

### Primary Format: SVG
- Scalable to any size without quality loss
- Perfect for web, print, and app development
- Smallest file size
- **Use when:** Possible (99% of cases)

### Secondary Format: PNG
- Transparent background
- Multiple resolutions (1x, 2x, 3x for retina)
- **Use when:** SVG not supported (rare cases)
- **Resolutions:**
  - Small: 120px, 240px, 360px (width)
  - Medium: 240px, 480px, 720px
  - Large: 480px, 960px, 1440px

### WebP (Modern Browsers)
- Better compression than PNG
- Transparent background support
- **Use when:** Optimizing for web performance
- Same resolutions as PNG

### Print Format: PDF
- Vector format for professional printing
- CMYK color space for offset printing
- **Use when:** Sending to print vendors

## Accessibility

### Contrast Requirements
- Logo on white background: ✅ Passes WCAG AA (7.8:1 for gray text)
- Logo on light backgrounds: ✅ Ensure 3:1 minimum contrast
- Icon alone: ✅ Ensure recognizable at small sizes

### Alt Text
```html
<!-- Full logo -->
<img src="logo.svg" alt="Mykadoo - Find the Perfect Gift" />

<!-- Icon only -->
<img src="icon.svg" alt="Mykadoo logo icon" />
```

## Export Settings

### SVG Export
- Remove unnecessary metadata
- Optimize paths
- Keep viewBox attribute
- Ensure proper `xmlns` declaration

### PNG Export (from SVG)
```bash
# Using Inkscape CLI (example)
inkscape logo.svg --export-type=png --export-width=240 --export-filename=logo@1x.png
inkscape logo.svg --export-type=png --export-width=480 --export-filename=logo@2x.png
inkscape logo.svg --export-type=png --export-width=960 --export-filename=logo@3x.png
```

### WebP Export
```bash
# Convert PNG to WebP
cwebp logo@1x.png -o logo@1x.webp -q 90
cwebp logo@2x.png -o logo@2x.webp -q 90
```

## Usage Examples

### HTML (Responsive)
```html
<picture>
  <source type="image/webp" srcset="logo@1x.webp 1x, logo@2x.webp 2x, logo@3x.webp 3x">
  <source type="image/png" srcset="logo@1x.png 1x, logo@2x.png 2x, logo@3x.png 3x">
  <img src="logo@1x.png" alt="Mykadoo - Find the Perfect Gift" width="200" height="48">
</picture>
```

### CSS Background
```css
.logo {
  background-image: url('/assets/logo.svg');
  background-repeat: no-repeat;
  background-size: contain;
  width: 200px;
  height: 48px;
}
```

### React Component
```tsx
import Logo from './assets/logo.svg?react';

function Header() {
  return <Logo className="w-[200px] h-[48px]" />;
}
```

## Questions?

For logo usage questions or to request custom variations, contact:
- **Design Team:** design@mykadoo.com
- **Brand Guidelines:** See [BRAND-GUIDELINES.md](../../../BRAND-GUIDELINES.md)

## Version History

- **1.0.0** (2025-01-03) - Initial logo and brand assets
