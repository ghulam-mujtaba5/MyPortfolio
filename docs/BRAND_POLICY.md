# Brand Policy Guide

Last updated: 2025-08-12

## 1. Brand Essence
- Mission: Present a credible, modern, and technical personal brand for Ghulam Mujtaba.
- Values: Clarity, technical depth, reliability, and accessibility.
- Voice & Tone: Professional, concise, confident, friendly.

## 2. Logo & Iconography
- Logo: If a personal logo/monogram exists, maintain minimum 24px height on web.
- Clear Space: Maintain padding equal to 0.5× logo height around all sides.
- Backgrounds: Prefer solid neutrals; for imagery, ensure min 4.5:1 contrast for text overlays.
- Favicon: `public/favicon.ico` and social `og-image.png` required.

## 3. Color System (current usage)
- Primary: Brand Blue `#4573df` (seen in buttons, headings, accents)
- Accent (occasional): Green `#33a552` (e.g., 404 gradient)
- Light Theme: Background `#ffffff`, Text `#222`/`#333`/`#000`, Borders `#e3e6ea`
- Dark Theme: Background `#1d2127`, Text `#ffffff`/`#e5e5e5`/`#cccccc`
- Links: Default `#4573df`, Hover `#005bb5`
- Component Grays: `#e8ebee`, `#272c34`
- Note: Global tokens are deferred for now (no `styles/tokens.css` import).

## 4. Typography
- Headings: Poppins (300–500). H1 36–48px, H2 28–32px, H3 22–24px.
- Body: Inter or Open Sans 16–18px, 1.5 line-height.
- Display: Manrope for emphasis and stat blocks.
- Do not mix more than 2 families per page.

## 5. Layout & Spacing
- Grid: 12-column responsive with 24px gutters.
- Container max width: 1200px for main content.
- Spacing scale: 4px base; common steps 4/8/12/16/24/32/48/64.
- Border radius: 8–16px on cards; buttons 8–12px.

## 6. Imagery & Illustration
- Use consistent color grading; avoid oversaturated contrasts.
- Prefer SVG icons; keep stroke widths consistent (1.5–2px).
- Optimize images, use Next.js Image where possible.

## 7. Accessibility
- Color contrast at least AA (4.5:1 for text < 18pt).
- Visible focus ring. Avoid color-only distinctions.
- Motion: Respect `prefers-reduced-motion`.
- Semantics: Headings order, alt text for images.

## 8. Content Guidelines
- Keep copy concise; leverage bullets.
- Use consistent terminology for technologies and roles.
- Include clear CTAs (View Code, Live Demo, Contact).

## 9. Do/Don’t
- Do: Use tokens, consistent spacing, clear hierarchy, accessible colors.
- Don’t: Introduce new ad-hoc colors, cram text, or remove focus outlines.

## 10. Governance
- Changes to brand elements require review (PR) with before/after screenshots.
- Maintain this guide in `docs/BRAND_POLICY.md` and update tokens accordingly.
