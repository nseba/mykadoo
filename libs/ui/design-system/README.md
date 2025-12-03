# Mykadoo Design System

Comprehensive design system and component library for the Mykadoo gift search platform.

## Features

- 🎨 **Design Tokens** - Complete token system (colors, typography, spacing, shadows)
- 🧩 **Components** - 30+ accessible React components
- 🎯 **Tailwind Integration** - Pre-configured with brand design tokens
- ♿ **Accessibility** - WCAG 2.1 AA compliant
- 📚 **Storybook** - Interactive component documentation
- 🔧 **TypeScript** - Full type safety with strict mode
- 🎭 **Radix UI** - Accessible component primitives
- ✅ **Testing** - Jest + React Testing Library setup

## Installation

```bash
# In the monorepo, the package is already available
yarn install
```

## Usage

### Importing Components

```tsx
import { Button, Input, Card } from '@mykadoo/ui/design-system';

function App() {
  return (
    <Card>
      <Input placeholder="Search for gifts..." />
      <Button variant="primary">Search</Button>
    </Card>
  );
}
```

### Using Design Tokens

```tsx
import { tokens } from '@mykadoo/ui/design-system';

// Access color tokens
const primaryColor = tokens.colors.brand.primary[500]; // #FF6B6B

// Access typography tokens
const fontSize = tokens.typography.fontSize.base; // ['1rem', { lineHeight: '1.5rem' }]

// Access spacing tokens
const spacing = tokens.spacing[4]; // '1rem' (16px)
```

### Tailwind Configuration

The design system includes a Tailwind config that integrates all design tokens:

```js
// tailwind.config.js (in your app)
const designSystemConfig = require('@mykadoo/ui/design-system/tailwind.config.js');

module.exports = {
  ...designSystemConfig,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // Include design-system components
    './node_modules/@mykadoo/ui/design-system/**/*.{js,jsx,ts,tsx}',
  ],
};
```

### Using Styles

Consumers should import the global styles in their app:

```tsx
// In your app's entry point (e.g., app/layout.tsx or main.tsx)
import '@mykadoo/ui/design-system/styles/globals.css';
```

Or import design tokens and use Tailwind:

```tsx
import { tailwindTokens } from '@mykadoo/ui/design-system';

// Use in Tailwind config
module.exports = {
  theme: {
    extend: {
      colors: tailwindTokens.colors,
      fontFamily: tailwindTokens.fontFamily,
      // ... other tokens
    },
  },
};
```

### Utility Functions

```tsx
import { cn } from '@mykadoo/ui/design-system';

// Merge Tailwind classes with conflict resolution
function Button({ className, variant }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-primary-500 text-white',
        variant === 'secondary' && 'bg-secondary-500 text-white',
        className
      )}
    >
      Click me
    </button>
  );
}
```

## Design Tokens

### Colors

```tsx
import { colors } from '@mykadoo/ui/design-system';

// Brand colors
colors.brand.primary[500]    // #FF6B6B (warm coral)
colors.brand.secondary[500]  // #339AF0 (trustworthy blue)

// Neutral colors
colors.neutral[50]  // #F8F9FA (lightest)
colors.neutral[900] // #212529 (darkest)

// Semantic colors
colors.semantic.success[500] // #51CF66
colors.semantic.warning[500] // #FFD43B
colors.semantic.error[500]   // #FF6B6B
colors.semantic.info[500]    // #339AF0
```

### Typography

```tsx
import { typography } from '@mykadoo/ui/design-system';

// Font families
typography.fontFamily.sans // ['Inter', 'system-ui', ...]
typography.fontFamily.mono // ['SF Mono', 'Monaco', ...]

// Font sizes
typography.fontSize.xs   // ['0.75rem', { lineHeight: '1rem' }]
typography.fontSize.base // ['1rem', { lineHeight: '1.5rem' }]
typography.fontSize['5xl'] // ['3rem', { lineHeight: '1' }]

// Font weights
typography.fontWeight.normal   // '400'
typography.fontWeight.semibold // '600'
typography.fontWeight.bold     // '700'
```

### Spacing

```tsx
import { spacing, borderRadius } from '@mykadoo/ui/design-system';

// Spacing scale (4px base grid)
spacing[0]  // '0px'
spacing[4]  // '1rem' (16px)
spacing[8]  // '2rem' (32px)
spacing[12] // '3rem' (48px)

// Border radius
borderRadius.sm      // '0.125rem' (2px)
borderRadius.DEFAULT // '0.25rem' (4px)
borderRadius.lg      // '0.5rem' (8px)
borderRadius.full    // '9999px'
```

### Shadows

```tsx
import { shadows, elevation } from '@mykadoo/ui/design-system';

// Shadow scale
shadows.sm // '0 1px 3px 0 rgb(0 0 0 / 0.1), ...'
shadows.md // '0 4px 6px -1px rgb(0 0 0 / 0.1), ...'
shadows.lg // '0 10px 15px -3px rgb(0 0 0 / 0.1), ...'

// Semantic elevation
elevation.base    // No shadow (flush with background)
elevation.raised  // Slight elevation (cards)
elevation.overlay // Medium elevation (dropdowns, popovers)
elevation.modal   // High elevation (modal dialogs)
```

## Component Library

### Available Components

**Buttons:**
- `Button` - Primary, secondary, tertiary, icon variants
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

**Form Inputs:**
- `Input` - Text input with validation states
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Radio` - Radio button group
- `Toggle` - Switch/toggle input
- `Slider` - Range slider

**Feedback:**
- `Alert` - Success, warning, error, info alerts
- `Toast` - Notification system
- `Progress` - Progress bar
- `Spinner` - Loading spinner
- `Skeleton` - Skeleton loader
- `EmptyState` - Empty state placeholder

**Navigation:**
- `TopNav` - Top navigation bar with responsive menu
- `Breadcrumbs` - Breadcrumb navigation
- `Tabs` - Tab navigation
- `Pagination` - Pagination controls
- `Sidebar` - Sidebar menu
- `BottomNav` - Bottom navigation for mobile

**Content:**
- `Card` - Content card with variants
- `Modal` - Modal dialog
- `Tooltip` - Tooltip component
- `Popover` - Popover menu
- `Accordion` - Collapsible sections
- `Table` - Data table with sorting/filtering
- `Badge` - Badge/tag component
- `Avatar` - User avatar

**Layout:**
- `Container` - Max-width container
- `Grid` - Responsive grid
- `Stack` - Vertical spacing
- `Divider` - Horizontal divider

## Development

### Running Storybook

```bash
yarn nx storybook design-system
```

### Building

```bash
yarn nx build design-system
```

### Testing

```bash
# Run all tests
yarn nx test design-system

# Run with coverage
yarn nx test design-system --coverage

# Watch mode
yarn nx test design-system --watch
```

### Linting

```bash
yarn nx lint design-system
```

## TypeScript

The design system is fully typed with TypeScript strict mode. All components, tokens, and utilities include comprehensive type definitions.

```tsx
import type { ButtonProps, ColorKey, FontSize } from '@mykadoo/ui/design-system';
```

## Accessibility

All components follow WCAG 2.1 AA standards:
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Proper ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast compliance (4.5:1 minimum)
- ✅ Touch target sizes (44×44px minimum)

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Create components in `src/components/{ComponentName}/`
2. Include TypeScript types
3. Write unit tests (>80% coverage)
4. Add Storybook stories
5. Document component API
6. Ensure accessibility compliance

## License

Private - Internal use only

## Resources

- [Brand Guidelines](../../../BRAND-GUIDELINES.md)
- [Logo Usage](./src/assets/LOGO-USAGE.md)
- [Design Tokens](./src/tokens/README.md)
- [Component Docs](./src/components/README.md)

## Version

Current version: 1.0.0
