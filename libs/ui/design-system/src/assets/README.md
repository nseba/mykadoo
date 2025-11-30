# Mykadoo Brand Assets

This directory contains all official Mykadoo brand assets including logos, icons, favicons, and social media graphics.

## Directory Structure

```
assets/
├── logos/               # Logo variations
│   ├── mykadoo-logo-full.svg          # Full color logo (primary)
│   ├── mykadoo-icon.svg               # Icon only
│   ├── mykadoo-logo-monochrome.svg    # Black version
│   └── mykadoo-logo-white.svg         # White version for dark backgrounds
├── favicons/            # Favicon files
│   ├── favicon.svg                    # Modern browsers
│   ├── icon-192.svg                   # PWA, Android
│   └── icon-512.svg                   # High-res displays, iOS
├── og-images/           # Open Graph social media images
│   └── og-default.svg                 # Default 1200×630px OG image
├── social/              # Social media profile images (empty - to be added)
└── LOGO-GUIDELINES.md   # Comprehensive logo usage guidelines
```

## Quick Start

### Using Logos in Code

```typescript
import LogoFull from '@mykadoo/design-system/assets/logos/mykadoo-logo-full.svg';
import LogoIcon from '@mykadoo/design-system/assets/logos/mykadoo-icon.svg';
import LogoWhite from '@mykadoo/design-system/assets/logos/mykadoo-logo-white.svg';

// In your component
<img src={LogoFull} alt="Mykadoo" />
```

### Using in Next.js

```tsx
import Image from 'next/image';
import logo from '@mykadoo/design-system/assets/logos/mykadoo-logo-full.svg';

export default function Header() {
  return (
    <Image src={logo} alt="Mykadoo" width={200} height={48} priority />
  );
}
```

### Favicons in HTML

```html
<!-- In your HTML <head> -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
<link rel="manifest" href="/manifest.json">
```

### Open Graph Meta Tags

```html
<!-- Social media sharing -->
<meta property="og:image" content="https://mykadoo.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Mykadoo - AI-Powered Gift Search Engine">
```

## Asset Specifications

### Logos
- **Format:** SVG (vector, scalable)
- **Colors:**
  - Primary: Coral #FF6B6B
  - Text: Dark Gray #212121
  - White: #FFFFFF (dark backgrounds)
- **Sizes:** Scalable (minimum 120px width for full logo)

### Favicons
- **Formats:** SVG, PNG (to be generated), ICO (to be generated)
- **Sizes:**
  - 16×16px (browser tabs)
  - 32×32px (browser tabs, retina)
  - 192×192px (PWA, Android)
  - 512×512px (PWA, iOS, high-res)

### Open Graph Images
- **Format:** SVG (source), PNG (export required)
- **Size:** 1200×630px (standard for all social platforms)
- **Aspect Ratio:** 1.91:1
- **File Size:** < 5MB (aim for <500KB)

## Generating Raster Assets

The SVG assets are the source of truth. To generate PNG/ICO versions:

### Using Sharp (Node.js)

```typescript
import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('favicon.svg');

// Generate PNG favicons
await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile('favicon-32.png');

await sharp(svg)
  .resize(192, 192)
  .png()
  .toFile('icon-192.png');
```

### Using ImageMagick (CLI)

```bash
# Convert SVG to PNG
convert -background none favicon.svg -resize 32x32 favicon-32.png

# Create ICO from multiple PNGs
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico

# Convert to WebP
cwebp -q 80 og-default.png -o og-default.webp
```

### Using Online Tools
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimize SVGs
- [Favicon Generator](https://realfavicongenerator.net/) - Generate all favicon sizes
- [CloudConvert](https://cloudconvert.com/) - Convert between formats

## Logo Usage Guidelines

**IMPORTANT:** Please read [LOGO-GUIDELINES.md](./LOGO-GUIDELINES.md) before using any logo assets.

Key rules:
- ✅ Maintain minimum clear space (1× heart icon height)
- ✅ Use on backgrounds with sufficient contrast (4.5:1 minimum)
- ✅ Keep original proportions
- ❌ Do not alter colors
- ❌ Do not distort or rotate
- ❌ Do not add effects

## Accessibility

All logo usage must maintain:
- **Contrast Ratio:** 4.5:1 minimum for text/logos
- **Alt Text:** Always provide descriptive alt text
  - Logo: "Mykadoo"
  - Logo with tagline: "Mykadoo - AI-Powered Gift Search Engine"
- **Scalability:** SVGs scale without quality loss

## File Naming Convention

- `mykadoo-logo-{variant}.svg` - Logos
- `mykadoo-icon.svg` - Icon only
- `icon-{size}.svg` - Favicons
- `og-{variant}.svg` - Open Graph images

## Future Assets (To Be Created)

- [ ] Email header templates (600px width)
- [ ] Social media cover images (Facebook, Twitter, LinkedIn)
- [ ] App store graphics (iOS, Android)
- [ ] Marketing templates (banners, ads)
- [ ] PNG/ICO exports of current SVGs
- [ ] Brand pattern/texture assets

## Contributing

To add new brand assets:
1. Design assets following brand guidelines
2. Export as SVG (optimized with SVGOMG)
3. Place in appropriate directory
4. Update this README
5. Update LOGO-GUIDELINES.md if needed
6. Generate raster versions if required

## Resources

- [Logo Guidelines](./LOGO-GUIDELINES.md) - Complete logo usage guide
- [Design Tokens](../tokens/README.md) - Color, typography, spacing
- [Brand Guidelines](../../docs/brand-guidelines.md) - Full brand identity
- [Figma Design System](https://figma.com/mykadoo-design-system) - Source files

## License

All Mykadoo brand assets are proprietary and may not be used without permission.
© 2024 Mykadoo. All rights reserved.

---

**Questions?** Contact the design team at design@mykadoo.com
