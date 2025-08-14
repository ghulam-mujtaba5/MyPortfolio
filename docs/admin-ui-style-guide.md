# Admin UI Style Guide

This guide documents the conventions used across the Admin Portal for consistent, accessible, and theme-aware UI.

## Core Principles
- Use three CSS modules per component/page: base/common, light, and dark.
- Consume design tokens from `styles/tokens.css` and CSS variables.
- No inline styles; prefer class names only.
- All actions use shared button utilities for structure/variants.
- Ensure accessibility: proper roles, `aria-*`, focus management, and `aria-live` where needed.

## Theming Pattern
- Import modules in each component/page:
  - `*.common.module.css` for structural/layout styles
  - `*.light.module.css` and `*.dark.module.css` for theme colors & micro-interactions
- Select theme using `ThemeContext` (`useTheme()`):
  ```js
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const styles = { ...commonStyles, ...themeStyles };
  ```

## Buttons and Icon Buttons
- Structure comes from `styles/utilities.module.css`.
- Variants:
  - Primary: `utilities.btn utilities.btnPrimary`
  - Secondary: `utilities.btn utilities.btnSecondary`
  - Danger: `utilities.btn utilities.btnDanger`
- Icon-only buttons add: `utilities.btnIcon` and include an accessible label (via `aria-label`, `title`, or visually hidden text).

Examples:
```jsx
// Text + icon
<button className={`${utilities.btn} ${utilities.btnPrimary}`}>
  <Icon name="plus" />
  Create
</button>

// Icon-only
<button
  className={`${utilities.btn} ${utilities.btnIcon} ${utilities.btnDanger}`}
  aria-label="Delete"
>
  <Icon name="trash" />
</button>
```

## Modals
- Use shared `components/Admin/Modal/Modal` for confirmations.
- Provide `initialFocusRef` for focus management and restore focus on close.
- Provide `confirmText`/`cancelText` and ensure keyboard support.

## Accessibility Checklist
- Inputs have associated `<label>` or `aria-label`.
- Use `aria-live` for async status updates (e.g., save/delete/export).
- Keyboard focus is visible (`:focus-visible`) and logical.
- Respect `prefers-reduced-motion` in light/dark modules for micro-interactions.

## Patterns to Avoid
- Bespoke button classes (e.g., `iconButton`, `buttonPrimary`, `primaryBtn`, `pagerButton`).
- Inline styles or Tailwind utility strings within Admin pages.

## File Locations
- Tokens: `styles/tokens.css`
- Utilities: `styles/utilities.module.css`
- Theme context: `context/ThemeContext.js`

## Example Pages Using These Conventions
- Articles list: `pages/admin/articles/index.js`
- Article preview: `pages/admin/articles/preview/[slug].js`
- Projects list: `pages/admin/projects/index.js`
- Analytics: `pages/admin/analytics/index.js`
- Users: `pages/admin/users.js`

## Visual QA Checklist
- Verify light/dark parity for buttons, hover, active, and focus-visible.
- Confirm disabled states for pagination/action buttons.
- Confirm icon-only buttons have accessible labels.
- Confirm modals trap focus and restore on close.

---
For questions or updates to these conventions, edit this document and keep examples aligned with live code.


## Migration Checklist (for contributors)
- [ ] Replace bespoke button classes with utilities:
  - Text buttons: `utilities.btn + variant`
  - Icon-only: `utilities.btn utilities.btnIcon + variant`
- [ ] Remove any now-unused button styles from the component/page CSS modules.
- [ ] Ensure three-module theming is present (base/common, light, dark) and imported.
- [ ] Use tokens (`styles/tokens.css`) for spacing, radius, colors, shadows.
- [ ] Confirm focus-visible and hover/active states in light and dark.
- [ ] Provide `aria-label`/title for icon-only buttons and screen-reader text where appropriate.
- [ ] For modals, use `components/Admin/Modal/Modal` with `initialFocusRef`, `confirmText`, `cancelText`.
- [ ] Remove inline styles; use classes only.
- [ ] Run a quick visual regression check for light/dark parity.
