# Accessibility Testing Checklist

A comprehensive checklist for ensuring WCAG 2.1 AA compliance in Mykadoo.

## Quick Reference

| Test Type | Tool | Command |
|-----------|------|---------|
| Unit Tests | jest-axe | `yarn nx test web --testPathPattern=a11y` |
| E2E Tests | Playwright + axe | `npx playwright test accessibility.spec.ts` |
| Lighthouse | Lighthouse CI | `lhci autorun` |
| Manual | Screen Reader | See [Manual Testing](#manual-testing) |

## Automated Testing

### 1. Run Unit Tests
```bash
yarn nx test web --testPathPattern=a11y
```

### 2. Run E2E Accessibility Tests
```bash
npx playwright test apps/web/e2e/accessibility.spec.ts
```

### 3. Run Lighthouse Audit
```bash
# Install Lighthouse CI globally
npm install -g @lhci/cli

# Run audit
lhci autorun
```

### 4. Run axe DevTools (Browser Extension)
1. Install [axe DevTools](https://www.deque.com/axe/browser-extensions/)
2. Open page in browser
3. Open DevTools → axe DevTools tab
4. Click "Scan ALL of my page"
5. Review and fix violations

## Manual Testing

### Keyboard Navigation Checklist

- [ ] Can navigate all interactive elements with Tab key
- [ ] Can activate buttons/links with Enter key
- [ ] Can toggle checkboxes with Space key
- [ ] Tab order follows visual layout (left-to-right, top-to-bottom)
- [ ] Focus indicator is always visible (3px+ outline)
- [ ] No keyboard traps (can always Tab out of components)
- [ ] Skip link works (visible on focus, jumps to main content)
- [ ] Modals trap focus and return focus on close
- [ ] Escape key closes modals/menus

### Screen Reader Testing

#### VoiceOver (macOS)
```bash
# Enable: Cmd + F5
# Navigate: VO keys (Ctrl + Option) + arrows
# Rotor: VO + U
# Stop speaking: Ctrl
```

Checklist:
- [ ] Page title is announced on load
- [ ] Headings are announced with levels (H1, H2, etc.)
- [ ] Images have descriptive alt text
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Live regions announce dynamic updates
- [ ] Buttons/links have descriptive names
- [ ] Tables have proper headers

#### NVDA (Windows)
```bash
# Download from nvaccess.org
# Toggle: Insert + Q
# Navigate: Arrow keys
# Forms mode: Insert + Space
```

#### TalkBack (Android)
```bash
# Enable: Settings → Accessibility → TalkBack
# Navigate: Swipe left/right
# Activate: Double-tap
```

### Color Contrast Checklist

- [ ] Normal text: 4.5:1 contrast ratio
- [ ] Large text (18pt+): 3:1 contrast ratio
- [ ] UI components: 3:1 contrast ratio
- [ ] Focus indicators: 3:1 contrast ratio
- [ ] Test with color blindness simulators

Tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Visual Checklist

- [ ] Text can be resized to 200% without loss of content
- [ ] Content reflows at 320px width (no horizontal scroll)
- [ ] No color-only indicators (add icons/text)
- [ ] Animations respect prefers-reduced-motion
- [ ] Touch targets are 44x44px minimum
- [ ] Spacing between targets is 8px minimum

## WCAG 2.1 AA Requirements

### 1. Perceivable

#### 1.1 Text Alternatives
- [x] All images have alt text
- [x] Decorative images have empty alt=""
- [ ] Complex images have long descriptions
- [ ] Icons have aria-label or sr-only text

#### 1.2 Time-based Media
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] No auto-play media

#### 1.3 Adaptable
- [x] Semantic HTML structure
- [x] Proper heading hierarchy
- [ ] Meaningful sequence preserved
- [ ] Input purpose identified (autocomplete)

#### 1.4 Distinguishable
- [x] Color not sole indicator
- [ ] Audio control available
- [x] Text contrast 4.5:1
- [x] Text resizable to 200%
- [ ] Images of text avoided
- [x] Reflow at 320px
- [ ] Non-text contrast 3:1
- [ ] Text spacing adjustable
- [ ] Content on hover/focus dismissible

### 2. Operable

#### 2.1 Keyboard Accessible
- [x] All functionality keyboard accessible
- [ ] No keyboard traps
- [ ] Keyboard shortcuts documented

#### 2.2 Enough Time
- [ ] Timing adjustable
- [ ] Pause/stop/hide for moving content
- [ ] No timing for essential actions

#### 2.3 Seizures
- [ ] No flashing content (3 flashes/second max)

#### 2.4 Navigable
- [ ] Skip link to main content
- [x] Page titles descriptive
- [x] Focus order logical
- [x] Link purpose clear
- [ ] Multiple ways to find pages
- [x] Headings descriptive
- [x] Focus visible

#### 2.5 Input Modalities
- [ ] Pointer gestures have alternatives
- [ ] Pointer cancellation supported
- [x] Label in name matches visible label
- [ ] Motion actuation has alternatives

### 3. Understandable

#### 3.1 Readable
- [x] Language of page identified
- [ ] Language of parts identified

#### 3.2 Predictable
- [x] No unexpected context changes on focus
- [x] No unexpected context changes on input
- [x] Consistent navigation
- [x] Consistent identification

#### 3.3 Input Assistance
- [x] Error identification
- [x] Labels or instructions
- [x] Error suggestion
- [ ] Error prevention (reversible/confirmed)

### 4. Robust

#### 4.1 Compatible
- [x] Valid HTML
- [x] Name, role, value available
- [x] Status messages programmatically determinable

## Priority Matrix

### Critical (Fix Immediately)
| Issue | WCAG | Impact |
|-------|------|--------|
| Missing alt text | 1.1.1 | Screen reader users can't understand images |
| Color contrast | 1.4.3 | Low vision users can't read text |
| Missing form labels | 1.3.1 | Screen reader users can't identify inputs |
| Keyboard traps | 2.1.2 | Keyboard users get stuck |

### High (Fix This Sprint)
| Issue | WCAG | Impact |
|-------|------|--------|
| Missing skip link | 2.4.1 | Keyboard users must tab through header |
| Focus not visible | 2.4.7 | Keyboard users can't see position |
| Heading hierarchy | 1.3.1 | Screen reader navigation broken |
| Missing page titles | 2.4.2 | Users don't know current page |

### Medium (Fix Next Sprint)
| Issue | WCAG | Impact |
|-------|------|--------|
| Missing landmarks | 1.3.1 | Screen reader navigation limited |
| Touch target size | 2.5.5 | Mobile users have difficulty tapping |
| Animation control | 2.3.1 | Motion sensitivity triggers |

### Low (Backlog)
| Issue | WCAG | Impact |
|-------|------|--------|
| Video captions | 1.2.2 | Deaf users can't understand video |
| Error prevention | 3.3.4 | Users can't undo mistakes |

## Reporting Violations

When documenting accessibility issues, include:

1. **WCAG Criterion**: e.g., "1.4.3 Contrast (Minimum)"
2. **Severity**: Critical / High / Medium / Low
3. **Location**: Page URL and element selector
4. **Current State**: What's happening now
5. **Expected State**: What should happen
6. **User Impact**: Who is affected and how
7. **Remediation**: How to fix it

Example:
```markdown
## Issue: Low contrast on secondary button

- **WCAG**: 1.4.3 Contrast (Minimum) - Level AA
- **Severity**: High
- **Location**: /pricing - "Learn More" buttons
- **Current**: Gray (#999) on white (#fff) = 2.85:1
- **Expected**: Minimum 4.5:1 contrast ratio
- **Impact**: Low vision users cannot read button text
- **Fix**: Change text color to #666 (5.74:1 ratio)
```

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Deque University](https://dequeuniversity.com/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
