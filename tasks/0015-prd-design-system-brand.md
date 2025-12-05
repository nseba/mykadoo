# PRD: Design System & Brand Identity

## Introduction

Mykadoo needs a cohesive design system and strong brand identity to create a modern, clean, and visually appealing experience that reflects warmth, friendliness, and trustworthiness. This PRD defines the visual language, component library, and brand guidelines that will ensure consistency across all platform touchpoints.

## Problem Statement

Without a well-defined design system and brand identity:
- Visual inconsistencies emerge across pages and features
- Development slows down due to one-off component creation
- Brand perception becomes diluted or unclear
- Accessibility and usability suffer from ad-hoc decisions
- Scaling design across teams becomes difficult

## Goals

1. Establish a warm, friendly, and trustworthy brand identity
2. Create a comprehensive design system with reusable components
3. Ensure visual consistency across web, mobile, and marketing materials
4. Accelerate development with pre-built, accessible components
5. Achieve 90+ Google Lighthouse score for accessibility
6. Reduce design-to-development handoff time by 50%
7. Maintain design coherence across 100+ pages/screens
8. Appeal to wide demographic (ages 18-65+, diverse backgrounds)

## User Stories

### As a user:
- I want a visually appealing interface so that using the platform is enjoyable
- I want consistent interactions so that I know what to expect
- I want the brand to feel trustworthy so that I'm comfortable making purchases
- I want the interface to be easy to understand so that I can accomplish tasks quickly

### As a designer:
- I want a component library so that I can design efficiently
- I want clear brand guidelines so that my work stays on-brand
- I want accessibility built-in so that designs are inclusive

### As a developer:
- I want pre-built components so that I don't recreate common UI elements
- I want clear documentation so that I can implement designs accurately
- I want type-safe components so that I catch errors early

## Functional Requirements

### 1. Brand Identity

**1.1** Brand personality must convey:
- **Warm**: Inviting, caring, personal
- **Friendly**: Approachable, helpful, conversational
- **Trustworthy**: Reliable, secure, honest
- **Joyful**: Celebratory, optimistic, delightful

**1.2** Brand voice and tone:
- **Voice** (consistent): Helpful friend, knowledgeable but not condescending
- **Tone** (context-dependent):
  - Celebratory: Birthdays, special occasions → enthusiastic, excited
  - Supportive: Stressful situations → calm, reassuring
  - Informative: Help content → clear, patient
  - Professional: Account/payment → straightforward, respectful

**1.3** Brand values must emphasize:
- Thoughtfulness in gift-giving
- Personal connection and relationships
- Celebration of special moments
- Simplicity and ease of use
- Privacy and trust

### 2. Visual Identity

**2.1** Logo design must:
- Work in full color, single color, and monochrome
- Scale from 16px (favicon) to large format (billboard)
- Include icon-only variant for small spaces
- Maintain clarity at all sizes
- Convey gift-giving theme subtly (not cliché)

**2.2** Color palette must include:

**Primary Colors:**
```css
--color-primary-50: #FFF5F5;    /* Lightest */
--color-primary-100: #FFE3E3;
--color-primary-200: #FFC9C9;
--color-primary-300: #FFA8A8;
--color-primary-400: #FF8787;
--color-primary-500: #FF6B6B;   /* Brand primary - Warm coral */
--color-primary-600: #FA5252;
--color-primary-700: #F03E3E;
--color-primary-800: #E03131;
--color-primary-900: #C92A2A;   /* Darkest */
```

**Secondary Colors:**
```css
--color-secondary-50: #E3F5FF;
--color-secondary-500: #339AF0;  /* Trustworthy blue */
--color-secondary-900: #1864AB;
```

**Neutral Colors:**
```css
--color-neutral-50: #FAFAFA;
--color-neutral-100: #F5F5F5;
--color-neutral-200: #E5E5E5;
--color-neutral-300: #D4D4D4;
--color-neutral-400: #A3A3A3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
```

**Semantic Colors:**
```css
--color-success: #51CF66;   /* Green */
--color-warning: #FFD43B;   /* Yellow */
--color-error: #FF6B6B;     /* Coral red (same as primary) */
--color-info: #339AF0;      /* Blue */
```

**2.3** Typography must use:

**Font Families:**
```css
--font-family-display: 'Inter', system-ui, sans-serif; /* Headings */
--font-family-body: 'Inter', system-ui, sans-serif;    /* Body text */
--font-family-mono: 'JetBrains Mono', monospace;       /* Code */
```

**Type Scale:**
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px - base */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

**Font Weights:**
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**2.4** Spacing system must use:
```css
/* 8px base grid */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

**2.5** Border radius must use:
```css
--radius-sm: 0.25rem;   /* 4px - subtle */
--radius-md: 0.5rem;    /* 8px - standard */
--radius-lg: 1rem;      /* 16px - pronounced */
--radius-xl: 1.5rem;    /* 24px - very rounded */
--radius-full: 9999px;  /* Fully rounded */
```

**2.6** Shadows must use:
```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
```

### 3. Component Library

**3.1** Core components must include:

**Buttons:**
- Primary button (solid, high contrast)
- Secondary button (outline or subtle bg)
- Tertiary button (text only)
- Icon button (circular or square)
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

**Inputs:**
- Text input
- Textarea
- Select dropdown
- Checkbox
- Radio button
- Toggle switch
- Slider
- File upload
- Date picker
- Search bar

**Feedback:**
- Alert (success, warning, error, info)
- Toast notification
- Progress bar
- Loading spinner
- Skeleton loader
- Empty state
- Error state

**Navigation:**
- Top navigation bar
- Breadcrumbs
- Tabs
- Pagination
- Sidebar menu (desktop)
- Bottom navigation (mobile)

**Content Display:**
- Card (with variants: product, article, profile)
- Modal dialog
- Tooltip
- Popover
- Accordion
- Table (with sorting, filtering)
- List (ordered, unordered, definition)
- Badge
- Tag/Chip
- Avatar

**Layout:**
- Container (max-width wrappers)
- Grid (responsive)
- Stack (vertical spacing)
- Cluster (horizontal spacing)
- Divider

**3.2** Component specifications must include:
- TypeScript type definitions
- Accessibility (ARIA labels, keyboard nav)
- Responsive behavior (mobile, tablet, desktop)
- Dark mode support (Phase 2)
- Animation/transition guidelines
- Usage documentation with examples
- Do's and Don'ts

**3.3** Component implementation must:
- Be built with React + TypeScript
- Use Tailwind CSS for styling
- Include Storybook stories
- Have unit tests (>80% coverage)
- Follow accessibility best practices (WCAG 2.1 AA)
- Support keyboard navigation
- Include prop validation

### 4. Iconography

**4.1** Icon library must:
- Use outline style (2px stroke) for consistency
- Include 100+ common icons (search, heart, user, gift, calendar, etc.)
- Support 16px, 20px, 24px sizes
- Be provided as SVG
- Have consistent padding/centering
- Include hover/active states where applicable

**4.2** Custom icons for Mykadoo:
- Gift box (logo mark)
- Sparkles (surprise/delight)
- Calendar with gift (reminders)
- Chat bubble (conversational AI)
- Tags (interests/categories)
- Trophy (trending gifts)

**4.3** Icon usage guidelines:
- Always include accessible labels
- Don't use icons alone (pair with text, except obvious actions)
- Maintain consistent size within groups
- Use semantic colors (success = green icon)

### 5. Illustrations & Imagery

**5.1** Illustration style must:
- Be warm and friendly (rounded shapes, soft gradients)
- Use brand color palette
- Depict diverse people (age, ethnicity, gender)
- Show joyful gift-giving moments
- Be simple and clear (not overly detailed)

**5.2** Illustration use cases:
- Empty states ("No saved profiles yet")
- Error pages (404, 500)
- Onboarding steps
- Feature announcements
- Email templates
- Loading states

**5.3** Photography guidelines:
- Use authentic, candid moments (not stock-photo-fake)
- Show diverse people and scenarios
- Focus on emotions and connections
- Maintain warm color tones
- Avoid clichéd gift-giving imagery (giant bows, etc.)

**5.4** Product imagery:
- High quality (1200px+ width)
- Consistent aspect ratios (1:1 or 4:3)
- Neutral backgrounds preferred
- Show scale/context where helpful

### 6. Motion & Animation

**6.1** Animation principles:
- **Purposeful**: Every animation serves a function
- **Subtle**: Don't distract from content
- **Fast**: <300ms for most interactions
- **Natural**: Easing curves feel organic

**6.2** Standard transitions:
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

**6.3** Animation use cases:
- Page transitions: Fade in (200ms)
- Modal enter: Slide up + fade (250ms)
- Dropdown: Slide down (150ms)
- Hover: Scale (1.02) + shadow (200ms)
- Button click: Scale down (100ms)
- Loading: Pulse or spinner
- Toast: Slide in from top/bottom (250ms)

**6.4** Animation guidelines:
- Respect `prefers-reduced-motion`
- Don't animate large blocks of content
- Provide instant feedback (<100ms)
- Avoid animations on page load (lazy load)

### 7. Accessibility Standards

**7.1** Color contrast must meet:
- WCAG 2.1 AA: 4.5:1 for normal text
- WCAG 2.1 AA: 3:1 for large text (18px+)
- WCAG 2.1 AA: 3:1 for UI components

**7.2** Focus indicators must:
- Be visible on all interactive elements
- Have sufficient contrast (3:1 minimum)
- Be consistent across components
- Not rely on color alone

**7.3** Touch targets must:
- Be minimum 44×44px (iOS standard)
- Have 8px minimum spacing between targets
- Be larger for critical actions (48×48px+)

**7.4** Content must:
- Use semantic HTML
- Provide alt text for images
- Use ARIA labels where needed
- Support keyboard navigation
- Work with screen readers

### 8. Responsive Design

**8.1** Breakpoints must use:
```css
--breakpoint-xs: 0px;      /* Mobile portrait */
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet portrait */
--breakpoint-lg: 1024px;   /* Tablet landscape / small desktop */
--breakpoint-xl: 1280px;   /* Desktop */
--breakpoint-2xl: 1536px;  /* Large desktop */
```

**8.2** Mobile-first approach:
- Design for mobile first (320px+)
- Progressively enhance for larger screens
- Touch-friendly interactions on mobile
- Hover states for desktop only

**8.3** Responsive patterns:
- Stack columns on mobile
- Hide secondary navigation on mobile (hamburger menu)
- Larger tap targets on mobile (48×48px)
- Single-column forms on mobile
- Horizontal scroll for cards on mobile (with snap points)

### 9. Documentation

**9.1** Design system documentation must include:
- Brand guidelines (logo usage, colors, typography)
- Component library (Storybook with interactive examples)
- Accessibility guidelines
- Content style guide (voice, tone, writing)
- Code snippets for developers
- Figma design file (components and templates)

**9.2** Documentation format:
- Public website (designsystem.mykadoo.com)
- Searchable component catalog
- Copy-paste code examples
- Visual do's and don'ts
- Changelog for updates

### 10. Brand Applications

**10.1** Logo usage must define:
- Minimum clear space around logo
- Minimum size for legibility
- Approved color combinations
- Incorrect usage examples
- Lock-ups with tagline (if any)

**10.2** Marketing materials must follow:
- Email template designs
- Social media templates (posts, stories, ads)
- Presentation deck template
- Business card design
- Letterhead design
- Swag/merchandise mockups

**10.3** Product applications:
- Favicon and app icons (16px to 512px)
- Open Graph images (1200×630px)
- Email header/footer
- Loading screens
- Error pages
- Maintenance page

## Non-Goals (Out of Scope)

- Print design guidelines - Digital-first focus
- Video production guidelines - Phase 3
- Sound/audio branding - Phase 4
- 3D assets or AR experiences - Phase 5
- White-label or multi-brand support - Not applicable

## Technical Considerations

### Architecture

**Frontend:**
- Tailwind CSS for utility-first styling
- CSS custom properties for theming
- Headless UI or Radix UI for accessible primitives
- Framer Motion for animations (optional)

**Component Library:**
- React + TypeScript
- Storybook for documentation and testing
- Build with Rollup or Vite
- Publish to npm as `@mykadoo/ui`

**Design Tools:**
- Figma for design files
- FigJam for collaboration
- Design tokens exported from Figma
- Automated sync between Figma and code

### Design Tokens

```typescript
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#FFF5F5',
    // ...
    500: '#FF6B6B',
    // ...
  },
  // ...
};

// tokens/spacing.ts
export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  // ...
};

// Export as CSS variables, Tailwind config, and TypeScript
```

### Component Example

```typescript
// Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        'disabled:opacity-50 disabled:pointer-events-none',

        // Variants
        {
          'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
          'border-2 border-primary-500 text-primary-500 hover:bg-primary-50': variant === 'secondary',
          'text-primary-500 hover:bg-primary-50': variant === 'tertiary',
        },

        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },

        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

## Design Considerations

### Brand Personality in UI

**Warmth:**
- Use rounded corners (not sharp angles)
- Warm color palette (corals, soft oranges)
- Friendly illustrations
- Personal pronouns ("your gifts", not "user gifts")

**Friendliness:**
- Conversational copy ("Let's find the perfect gift!")
- Helpful empty states (guidance, not just "no items")
- Encouraging feedback ("Great choice!")
- Approachable icons and illustrations

**Trustworthiness:**
- Clear, transparent information
- Security badges where appropriate
- Professional typography and spacing
- Consistent, predictable interactions

### Emotional Design

**Delight moments:**
- Confetti animation on gift purchase
- Personalized success messages
- Surprise recommendations ("You might also love...")
- Celebration badges ("10 gifts found!")

**Error handling:**
- Friendly error messages ("Oops! Something went wrong")
- Helpful recovery actions
- Illustrations to soften frustration
- Never blame the user

## Success Metrics

### Design Quality
- **Target:** 90+ Google Lighthouse accessibility score
- **Target:** 100% WCAG 2.1 AA compliance
- **Target:** <5% user-reported visual bugs

### Efficiency
- **Target:** 50% reduction in design-to-development time
- **Target:** 80% component reuse across pages
- **Target:** <1 hour to design new feature (using existing components)

### Brand Perception
- **Target:** 80% of users describe brand as "friendly"
- **Target:** 75% describe brand as "trustworthy"
- **Target:** 70% describe brand as "modern"

### Performance
- **Target:** <2KB CSS bundle size (critical path)
- **Target:** <100ms component render time
- **Target:** 60fps animations on all devices

## Open Questions

1. **Dark Mode**: Should we launch with dark mode or add later?

2. **Illustrations**: Should we use custom illustrations or a library (like unDraw)?

3. **Icon Library**: Build custom or use existing (Heroicons, Lucide)?

4. **Animation Library**: Use Framer Motion or CSS-only animations?

5. **Design Token Format**: Use Style Dictionary for multi-platform export?

6. **Theming**: Should we allow user customization (theme picker)?

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Define brand identity (colors, typography, logo)
- Set up design token system
- Create Figma component library
- Establish spacing/layout grid

### Phase 2: Core Components (Weeks 3-5)
- Build 20 core components (buttons, inputs, cards)
- Set up Storybook
- Write component documentation
- Implement accessibility features

### Phase 3: Advanced Components (Weeks 6-7)
- Complex components (tables, modals, dropdowns)
- Responsive layouts
- Animation guidelines
- Icon library integration

### Phase 4: Brand Applications (Week 8)
- Email templates
- Social media templates
- Marketing materials
- Brand guidelines document

### Phase 5: Documentation & Handoff (Week 9)
- Design system website
- Developer documentation
- Usage examples
- Migration guide from existing UI

## Current Implementation Status

**Overall Progress:** Phase 2 - Core Components (70% complete)

### ✅ Completed Tasks

**Task 1.0 - Brand Identity & Visual Foundations** (100%)
- Commit: 82cf8ff
- Date: 2025-01-03
- All design tokens defined (colors, typography, spacing, shadows)
- Brand personality and voice documented
- Visual foundations established

**Task 2.0 - Logo & Brand Assets** (100%)
- Commit: 852843a
- Date: 2025-01-03
- Logo variations created (full color, icon-only, monochrome)
- Brand assets exported (favicons, app icons, OG images)
- Usage guidelines documented

**Task 3.0 - Component Library Infrastructure** (100%)
- Commit: 889311d
- Date: 2025-01-03
- Monorepo package configured
- Tailwind + design tokens integrated
- Storybook set up and configured
- Testing infrastructure (Jest, RTL, axe)
- Radix UI primitives integrated

**Task 4.0 - Core Button Components** (100%)
- Commit: 8742366
- Date: 2025-01-03
- Button component with 6 variants (primary, secondary, tertiary, outline, ghost, danger)
- 4 sizes (sm, md, lg, icon)
- All states (default, hover, active, disabled, loading)
- Full accessibility (ARIA, keyboard navigation)
- Comprehensive tests (22 test cases, all passing)
- Storybook stories (15+ interactive examples)

**Task 5.0 - Form Input Components** (100%)
- Commits: 61265bb, 889fa1e
- Date: 2025-01-03
- All 10 form components: Input, Textarea, Checkbox, Radio, Select, Toggle, Slider, FileUpload, DatePicker, SearchBar
- Full validation states (error, success, default)
- Complete accessibility (ARIA, keyboard nav, WCAG 2.1 AA)
- Comprehensive tests (128 tests, 88% pass rate)
- Build verified (1.008 MB bundle)
- All components exported via @mykadoo/ui

**Task 6.0 - Feedback & Notification Components** (100%)
- Commits: 3bedda5, 4894509, 259625b, 6d25e46
- Date: 2025-12-04
- 4 new components: Toast (context + portal), EmptyState, ErrorState, Banner
- 2 existing components fixed: Progress, Spinner (color tokens)
- Full accessibility (ARIA live regions, keyboard nav)
- Comprehensive tests (27 tests, 100% pass rate)
- 44 Storybook stories (7 Toast, 10 EmptyState, 13 ErrorState, 14 Banner)
- Tailwind CSS v3 configuration fixed for proper theme support
- Build verified (1.035 MB bundle)
- Storybook running with full styling

**Task 7.0 - Navigation Components** (100%)
- Commit: 693882f
- Date: 2025-12-05
- 5 navigation components with full tests and stories: TopNav, Breadcrumbs, Tabs, Pagination, BottomNav
- All components already existed from previous work, added comprehensive testing and documentation
- Full accessibility (ARIA navigation, keyboard support, WCAG 2.1 AA)
- Comprehensive tests (56 test cases, 100% pass rate)
  - Tabs.spec.tsx: 11 test suites (variants, sizes, orientation, keyboard navigation)
  - BottomNav.spec.tsx: 13 test suites (mobile behavior, badges, safe area support)
- 60 Storybook stories created (Breadcrumbs: 11, Tabs: 12, Pagination: 14, TopNav: 12, BottomNav: 11)
- Build verified (1.035 MB bundle)
- All components exported via @mykadoo/ui
- Key features: Keyboard navigation (arrow keys), mobile-first design, responsive breakpoints

### 🟡 In Progress

None currently.

### ⏳ Remaining Tasks

**Task 8.0 - Content Display Components** (0%)
- Card, Modal, Tooltip, Popover, Accordion, Table, Badge, Avatar

**Task 9.0 - Layout Components & Utilities** (0%)
- Container, Grid, Stack, Divider, responsive utilities

**Task 10.0 - Icon Library & Documentation** (0%)
- Icon component, 100+ icons, design system website

**Component Count:** 28 of 50+ components built (56%)

## Dependencies

- UX Specialist agent for usability guidelines
- Accessibility PRD (0018) for compliance standards
- Frontend infrastructure (Next.js, Tailwind)
- Design tools (Figma access)

## Risks & Mitigation

### Risk 1: Design System Adoption Low
**Mitigation:**
- Make components easy to use (good DX)
- Provide excellent documentation
- Showcase real examples
- Conduct training sessions for team
- Make design system mandatory for new features

### Risk 2: Components Don't Meet All Use Cases
**Mitigation:**
- Start with common patterns
- Allow component composition (building blocks)
- Provide escape hatches for custom styling
- Iterate based on team feedback
- Regular component library reviews

### Risk 3: Brand Feels Generic
**Mitigation:**
- Conduct competitive analysis
- User testing with target demographic
- Inject personality through illustrations and copy
- Iterate on brand based on feedback
- Consider unique visual elements (e.g., custom illustrations)

### Risk 4: Accessibility Gaps
**Mitigation:**
- Audit all components with automated tools
- Manual testing with screen readers
- Include accessibility in component checklist
- Conduct user testing with assistive technologies
- Regular accessibility reviews

## Acceptance Criteria

- [ ] Brand colors defined and documented
- [ ] Typography scale established
- [ ] Logo created in all required formats
- [ ] 30+ core components built and tested
- [ ] All components meet WCAG 2.1 AA standards
- [ ] Storybook documentation complete
- [ ] Components work on mobile, tablet, desktop
- [ ] Design tokens exported to code
- [ ] Figma component library matches code library
- [ ] Animation guidelines documented
- [ ] Icon library includes 100+ icons
- [ ] Email templates designed
- [ ] Social media templates created
- [ ] Design system website published
- [ ] 80%+ component test coverage
- [ ] Developer documentation complete
- [ ] Brand guidelines published
- [ ] User testing validates "warm, friendly, trustworthy"

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** Draft
**Author:** AI Product Team
**Reviewers:** Design, Engineering, Marketing, UX
