## Summary

<!-- Describe the changes in this PR -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage improvement

## Related Issues

<!-- Link to related issues: Fixes #123, Closes #456 -->

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed

## Accessibility Checklist

**Required for all UI changes:**

- [ ] **Color contrast**: Text meets 4.5:1 ratio (normal) or 3:1 (large text)
- [ ] **Keyboard navigation**: All interactive elements accessible via Tab/Enter/Space
- [ ] **Focus indicators**: Visible focus ring on all interactive elements
- [ ] **Alt text**: Images have meaningful alt text (or empty alt for decorative)
- [ ] **Labels**: Form inputs have associated labels (htmlFor/id or aria-label)
- [ ] **ARIA**: Appropriate ARIA attributes used (aria-label, aria-describedby, roles)
- [ ] **Touch targets**: Interactive elements are at least 44x44px on mobile
- [ ] **Screen reader**: Tested with VoiceOver/NVDA (or documented why not needed)
- [ ] **Reduced motion**: Animations respect prefers-reduced-motion preference
- [ ] **Heading hierarchy**: Proper h1 -> h2 -> h3 structure maintained

**Automated checks:**

- [ ] axe-core tests pass (`yarn nx test web --testPathPattern=a11y`)
- [ ] Lighthouse accessibility score >= 90
- [ ] No new accessibility violations in CI

## Screenshots/Videos

<!-- Add screenshots or videos for UI changes -->

## Deployment Notes

<!-- Any special deployment instructions -->

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published
