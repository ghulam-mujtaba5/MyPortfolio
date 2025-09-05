# UI/UX Guidelines

Last updated: 2025-08-12

## 1. Principles

- Clarity first: simple layouts, clear hierarchy, concise copy.
- Consistency: use tokens for color, spacing, typography.
- Accessibility: meet WCAG 2.1 AA; keyboard-friendly, focus visible.
- Performance: lazy-load heavy components, optimize images.
- Responsiveness: design mobile-first, scale gracefully to desktop.

## 2. Information Architecture

- Primary sections: Home (Portfolio), Projects, Resume, Contact, Privacy.
- Secondary: Softbuilt sub-site.
- Use breadcrumbs only for deep hierarchies (blogs/admin later).

## 3. Navigation

- Desktop: sticky top bar, clear active state.
- Mobile: hamburger menu, lock body scroll when open.
- Keyboard: Tab order logical, Escape closes menus.

## 4. Layout & Grid

- Content container max width 1200px.
- Grid: 12 cols, 24px gutters; mobile single column.
- Spacing scale: 4px base; use tokens (xs/s/m/l/xl/2xl).

## 5. Typography

- Headings: Poppins; Body: Inter/Open Sans.
- Line height 1.5 for paragraphs; truncate long lines at ~70–90 chars.
- Use semantic headings and ARIA landmarks.

## 6. Color & States

- Use tokens for backgrounds, text, primary, accent, muted.
- Interactive states: hover, focus, active; disabled styles distinct.
- Dark mode equivalents via [data-theme="dark"].

## 7. Components

- Buttons: medium radius, clear contrast, focus ring.
- Cards: subtle shadow, 16px radius, padding tokens.
- Forms: label every input, show errors inline.
- Lists/Grids: responsive breakpoints; progressive enhancement.

## 8. Motion

- Use framer-motion sparingly; respect prefers-reduced-motion.
- Duration 150–250ms for small transitions; easing standard.

## 9. Images & Media

- Use Next.js Image for optimization; responsive sizes.
- Provide alt text; avoid text baked into images.

## 10. SEO

- Use `components/SEO.js` with specific title/description/canonical per page.
- Unique meta for Projects and future Blogs.

## 11. Testing & QA

- Visual checks on mobile, tablet, desktop.
- Keyboard-only navigation run.
- Lighthouse: Performance/Accessibility/Best Practices/SEO >= 90.

## 12. Governance

- Changes to patterns require PR with screenshots and accessibility notes.

## 13. Loading Patterns

- Prefer subtle, inline loaders over blocking spinners.
- Use `components/LoadingAnimation/InlineSpinner.js` for compact inline/ring loaders.
- Screen reader friendly: when in buttons or near text, keep the spinner `aria-hidden` (this wrapper does so by default) and update visible text to reflect state (e.g., "Saving…").
- Sizes: use `sizePx={14–20}` depending on density; default is 16.

Examples

1) Button with saving state

```jsx
import InlineSpinner from "@/components/LoadingAnimation/InlineSpinner";

<button disabled={saving} className="btn">
  {saving && <InlineSpinner sizePx={16} />}
  <span style={{ marginLeft: saving ? 6 : 0 }}>{saving ? "Saving…" : "Save"}</span>
</button>
```

2) Header/title fetch indicator

```jsx
<h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
  Items
  {loading && (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <InlineSpinner sizePx={16} />
      <span className="muted">Loading…</span>
    </span>
  )}
</h1>
```

3) Table cell/row pending

```jsx
<td style={{ minWidth: 40 }}>
  {rowLoading ? <InlineSpinner sizePx={14} /> : value}
</td>
```

Notes

- For fullscreen or content-blocking states, use `components/LoadingAnimation/LoadingAnimation.js` with `fullscreen` and optional stars/backdrop.
- A live demo of patterns exists at `/temp-loading` (dev-only link in Admin sidebar).
