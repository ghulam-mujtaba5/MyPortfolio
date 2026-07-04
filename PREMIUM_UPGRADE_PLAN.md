# Premium Founder-Engineer Upgrade Plan — ghulammujtaba.com

**Goal:** Evolve the existing site into a premium founder-engineer brand site (recruiters + Megicode leads + authority) without redesigning from zero, without breaking the hero hover animation, and without destroying existing structure, SEO, or theme system.

**Real stack (plan is written for this, not Tailwind):**
Next.js 16 (pages router) · React 19 · CSS Modules (Common/Light/Dark pattern) · `styles/tokens.css` · Framer Motion 12 · Lottie · MongoDB/ISR for projects & articles · custom ThemeContext (`data-theme`).

---

## 0. Design Thesis

The signature visual idea of this site already exists: **the concentric orbit rings** around the portrait (`components/profile-picture-desktop/PortfolioPictureImage.js`). Instead of inventing a new gimmick, the upgrade promotes that ring motif into the brand system:

> **"Everything orbits the builder."** Proof (products, metrics, certifications) orbits around Ghulam; the pipeline **Idea → Design → Build → Launch** is the horizontal axis that everything travels along.

Two recurring motifs, used with restraint:

1. **Orbit rings** — hero only (always-on faint ring + the existing 6-ring hover burst preserved untouched).
2. **Ship-log monospace labels** — section eyebrows, metrics, and stack pills set in `--font-mono` (system mono, zero download cost). This gives "engineer texture" sitewide without any new assets.

The one place of boldness is the hero cockpit. Everything else gets quieter, sharper, more disciplined.

---

## 1. Design Direction (palette, type, signature)

### 1.1 Color — extend `styles/tokens.css`, keep brand blue

Keep `--brand-primary: #4573df` as the identity color. Add:

```css
:root {
  /* Display ink — deep navy authority for headings (light mode) */
  --ink-display: #0f1b33;

  /* Conversion accent — used ONLY for the primary conversion CTA
     ("Start a Project") and the Launch node of the pipeline motif.
     Never for links, borders, or decoration. */
  --cta-accent: #d9480f;        /* white text on this = AA (≈4.9:1) */
  --cta-accent-hover: #c2410c;
  --cta-accent-muted: rgba(217, 72, 15, 0.10);

  /* Dark contrast band (contact section, featured case study) */
  --bg-ink: #0e1526;
  --bg-ink-elevated: #141d33;

  /* Availability signal */
  --signal-available: #16a34a;
}
```

Rules:
- Blue = identity, links, secondary CTAs, focus rings.
- Orange = conversion only. If orange appears more than ~2 times per viewport, it's overused.
- Light-mode-first stays. Dark sections (`--bg-ink`) used exactly twice on homepage: featured case-study spotlight and contact band.

### 1.2 Typography

Current problem (per `PORTFOLIO_AUDIT.md`): 4 font families loaded, tokens list Poppins + Open Sans + Inter + mono.

- **Display:** Poppins — but only weights **600, 700** (subset the Google Fonts request). Keep brand continuity.
- **Body:** consolidate to **one** body family. Recommended: Inter variable (already declared as `--font-sans`); acceptable: keep Open Sans 400/600 and drop everything else. Two families max on the wire.
- **Utility/mono:** `--font-mono` (system stack, free) for eyebrows, metrics, stack pills, timeline dates.

Scale additions to `tokens.css`:

```css
:root {
  --text-display: clamp(2.35rem, 1.2rem + 4.2vw, 3.9rem);   /* hero H1 */
  --text-headline: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);    /* section H2 */
  --text-lede: clamp(1.05rem, 1rem + 0.4vw, 1.25rem);       /* subheads */
  --tracking-display: -0.025em;
  --tracking-mono-label: 0.08em;  /* uppercase mono eyebrows */
}
```

Every section heading adopts the same anatomy: mono eyebrow (`01 · PROOF OF WORK` style only where sequence is real — otherwise plain label) → Poppins headline in `--ink-display` → one-sentence lede in `--text-secondary`.

### 1.3 Backgrounds & depth

- Keep the existing radial-mesh page background in `pages/portfolio/index.js` — it's already the right idea. Extract it to tokens (`--bg-mesh-light` / `--bg-mesh-dark`) so other pages reuse it instead of hardcoding.
- Shadows: add one "premium card" level — `--shadow-card: 0 1px 2px rgba(15,27,51,.06), 0 8px 24px rgba(15,27,51,.08);` and a hover level `--shadow-card-hover: 0 2px 4px rgba(15,27,51,.08), 0 16px 40px rgba(15,27,51,.14);`. Replace ad-hoc shadows in card modules.
- Glass: allowed only on floating hero proof chips and the mobile menu — `backdrop-filter` nowhere else (perf + the brief's "don't overuse blur").

---

## 2. Homepage Redesign Plan (highest priority)

File: `pages/portfolio/index.js`. New section order:

```
1. Hero cockpit           (welcome + portrait — upgraded, hover preserved)
2. Trust strip            (NEW: TrustStrip — real proof chips + availability)
3. What I Build           (NEW: WhatIBuild — 3 outcome cards; reuse/replace ServicesFrame)
4. Proof of Work          (ProjectsPreview → case-study cards)
5. Founder Journey        (NEW: compact timeline; absorbs AboutMe narrative)
6. Capabilities           (SkillFrame regrouped; absorbs Languages)
7. Certifications         (BadgeScroll — compressed, one row, marquee slowed)
8. Insights               (ArticlesPreview → editorial cards)
9. Contact band           (ContactUs on --bg-ink; plexus kept, tuned down)
```

### 2.1 Hero cockpit — `components/welcome/welcome.js` + `PortfolioPictureImage.js`

**Preserve exactly:** the 6 concentric `EllipseWithBackground` rings on hover, the scroll-hide threshold, mobile always-on behavior.

**Add around it:**

- **Always-on base ring:** one faint static ring (opacity ~0.25, existing ellipse style, `aria-hidden`) so the hover burst feels like an activation of something that's already alive, not an unrelated effect.
- **Orbiting proof chips:** 3 small glass chips positioned on the ring's circumference, drifting ±6px on a slow loop (Framer Motion `animate` with `repeat: Infinity, duration: 8–12s`, disabled under reduced motion):
  - `CampusAxis · 260+ universities`
  - `MegiLance · AI + blockchain`
  - `15+ products shipped`
  Desktop only (`display:none` below 980px). Pure `transform` animation.
- **Pipeline line:** under the CTA row, an SVG line with 4 nodes — **Idea → Design → Build → Launch** — path draws on load (`pathLength` 0→1, 1.2s, once). Launch node uses `--cta-accent`. This is the one new "wow" element; it doubles as the narrative spine reused in the Journey timeline.
- **Cursor-reactive depth (cheap version):** the text block and portrait get a ±4px `transform: translate3d` parallax from a single `mousemove` listener on `#home-section` (rAF-throttled, desktop only, off under reduced motion). No 3D library.

**Copy (replaces current strings in `welcome.js`):**

- Eyebrow (mono, uppercase): `FOUNDER · MEGICODE & CAMPUSAXIS`
- H1 (make the *visible* heading the real `<h1>` — currently the h1 is visually hidden and the visible text is an `<h2>`; fix the hierarchy):
  **"I build AI products from idea to launch."**
  with "Ghulam Mujtaba" kept as the greeting line above it (`Hello, I'm GHULAM MUJTABA` stays — it's part of the brand) — or invert: name as H1, thesis as lede. Either way, one visible H1.
- Sub: `Founder of Megicode and CampusAxis. I design and ship full-stack AI products, SaaS platforms, automation systems, and business tools — from concept to production.`
- CTAs: Primary **Start a Project** (`--cta-accent`, opens the existing `WorkWithMeModal`) · Secondary **View Proof of Work** (outline blue, scrolls to `#project-section`) · Tertiary text link **Resume →** (`/resume`).
- Remove the `whileHover={{ scale: 1.05/1.1 }}` on the headline text (reads as a toy). Replace with a 2px brand-blue underline sweep on the name (`background-size` transition).

### 2.2 Trust strip — NEW `components/TrustStrip/TrustStrip.js`

One horizontal band directly under the hero. Compact, single row (wraps to 2 on mobile), mono labels, real proof only:

`Founder — Megicode` · `Built CampusAxis (260+ universities)` · `MegiLance — AI + blockchain platform` · `Clinic management platform (commercial)` · `● Available for roles & projects` (green dot, `--signal-available`)

Styling: hairline top/bottom borders (`--border-subtle`), no cards, no icons — text-only credibility. Entrance: single fade, no stagger.

### 2.3 What I Build — NEW `components/WhatIBuild/` (evolve `ServicesFrame`)

Three outcome cards, equal width, `--shadow-card`:

| Card | For | I build | Proof link |
|---|---|---|---|
| **AI SaaS & MVPs** | founders who need a launch-ready product | full-stack product, AI layer, deployment | → MegiLance case study |
| **Business Platforms** | clinics, agencies, SMEs | portals, bookings, records, billing, dashboards | → Aesthetics Clinic case study |
| **AI Automation & Data Systems** | teams drowning in manual workflows | pipelines, decision support, analytics | → CampusAxis / data work |

Card anatomy: mono label ("FOR FOUNDERS") → title → 2-line problem/solution → 4 stack pills (mono) → proof link with arrow. Hover: `translateY(-4px)` + shadow lift, 200ms. The proof link is the point — every service claim resolves to a shipped thing.

### 2.4 Proof of Work — upgrade `ProjectsPreview` / `Project1.js`

See §5 (project card spec). Homepage shows the top 3 as large case cards + a "View all projects →" link. Section header: eyebrow `PROOF OF WORK`, headline "Products, not just projects."

### 2.5 Founder Journey — NEW `components/Journey/FounderJourney.js`

Horizontal on desktop / vertical on mobile timeline reusing the **pipeline motif** (same SVG node style as hero):

1. `2022 — Software engineering student, COMSATS` (Idea)
2. `2023 — 3+ yrs AI/ML work (Meta projects via Appen)` 
3. `2024 — Built CampusAxis from real student pain` (Design/Build)
4. `2025 — Founded Megicode · shipped client platforms`
5. `2026 — Building MegiLance: AI + blockchain freelancing` (Launch)

Cards reveal on scroll with a 80ms stagger, line draws as you scroll (scroll-linked `pathLength` via `useScroll`). Dates in mono. This absorbs most of the AboutMe narrative on the homepage; `AboutMeSectionLight` shrinks to a 2-sentence intro + portrait or is merged into this section.

### 2.6 Capabilities — restructure `SkillFrame.js`

Keep the 4 curated categories (already good: Full Stack / Mobile & Design / AI & ML / Tools & Cloud) but reframe each as a capability, not a logo list:

- Add a one-line "what this enables" under each label, e.g. AI & ML → *"Models that ship to production, not notebooks."*
- Rename section to **Capabilities** with eyebrow `HOW I BUILD`.
- Cap logos at 4–5 per group (already done). Add optional 5th/6th groups only as text rows (Cloud & Deployment, UX & Product Thinking) — no more icons.
- Fold `Languages` component content into this section (or About page) and remove it as a standalone homepage section — it's one of the weakest premium signals.
- Stack pills: mono font, 1px border, hover fills `--brand-primary-muted` (single 150ms transition).

### 2.7 Certifications — `BadgeScroll`

Keep (real proof: 5 Google certs + Meta cert) but compress: shorter section, one marquee row, slower speed, pause on hover, `aria-hidden` on the duplicated track. Title becomes part of the trust story: "Certified, then verified by shipping."

### 2.8 Insights preview — `ArticlesPreview`

Editorial treatment (see §7.4). Header: eyebrow `THINKING`, headline "Product & Engineering Insights". 3 cards max.

### 2.9 Contact band — `ContactUs`

Full-width `--bg-ink` dark band (the homepage's second and final dark moment). Keep the plexus canvas but reduce: `plexusMaxNodes` 100 → ~60, respect reduced motion (render static dots). Add the 3 intent paths (see §6) as compact chips above the form. Closing line above form: **"Have something serious to build? Let's talk."** + microcopy row: `Remote-ready · Lahore, global work · Replies within 24–48h`.

---

## 3. Component-by-Component UI Improvements

| Component | Change |
|---|---|
| `welcome.js` | Copy + CTA hierarchy per §2.1; remove text scale-on-hover; add pipeline SVG; real H1 |
| `PortfolioPictureImage.js` | **No behavior change.** Add static base ring + orbiting chips as siblings; extract magic numbers (`200` scroll threshold) to constants |
| `WorkWithMeModal.js` | Add intent/budget/timeline fields (see §6.2) so "Start a Project" qualifies leads immediately |
| `NavBar_Desktop` | Add subtle `backdrop-filter` + hairline border on scroll (sticky elevation); active-section indicator; "Start a Project" as nav CTA button (`--cta-accent`, right-aligned) |
| `NavBar_Mobile` | Spring-eased slide-in panel (Framer `AnimatePresence`), staggered link entrance (60ms), glass panel — one of the two allowed blur uses |
| `ScrollReveal.js` | Centralize on `lib/motion.js` presets (§4); default `viewport={{ once: true }}`; ensure reduced-motion renders content instantly (verify — audit flags gaps) |
| `Project1.js` | Full case-card spec (§5) |
| `ArticleCard.js` / `NewArticleCard.js` | Consolidate to ONE card component (there are currently two + 6 css files); editorial layout (§7.4) |
| `Footer` | Convert `onClick` image "links" to real `<a>` (audit BUG); add mono build-info line: `Designed & built by Ghulam Mujtaba · Next.js · Lahore` |
| `SkillFrame.js` | §2.6 |
| `BadgeScroll.js` | §2.7 |
| `ContactUs.js` | §6 |
| `pages/search.js` | Adopt nav/footer/theme (audit P0) — an unstyled page is a brand hole |

**Pattern-level improvement:** new components stop using the triple `Common/Light/Dark` module pattern. Write one module using tokens; theme via `[data-theme="dark"]` overrides inside the same file. (Don't mass-migrate old components — just stop the bleeding.)

---

## 4. Motion Design System

New file: **`lib/motion.js`** — the single source for all Framer Motion values.

```js
// lib/motion.js
export const EASE = [0.22, 1, 0.36, 1];          // decisive out-quint feel
export const DUR = { fast: 0.15, base: 0.3, slow: 0.6 };

export const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } },
};
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR.base } },
};
export const stagger = (delay = 0.08) => ({
  visible: { transition: { staggerChildren: delay } },
});
export const drawLine = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 1.2, ease: EASE } },
};
export const VIEWPORT = { once: true, amount: 0.2 };
```

**Rules (enforced by review, not hope):**
- Animate only `transform` and `opacity`. Never width/height/top/left on scroll.
- Entrances ≤ 600ms, hovers ≤ 200ms, stagger ≤ 5 items then group the rest.
- Every scroll reveal fires **once** (`viewport.once`) — re-triggering reveals read as glitchy.
- Every looping/ambient animation (orbit chips, marquee, plexus, pipeline draw) checks `useReducedMotion()` and renders its static end-state instead.
- Decorative motion elements get `aria-hidden="true"`.
- One orchestrated moment per page (hero load sequence: greeting → name → sub → CTAs → pipeline draw, total ≤ 1.6s). Everything else is quiet.
- Magnetic buttons: primary CTAs only, ±3px translate toward cursor, spring `{ stiffness: 300, damping: 20 }`, desktop only.

---

## 5. Project Card Redesign — case-study cards

### 5.1 Featured case card (top 3: CampusAxis, MegiLance, Aesthetics Clinic)

Large horizontal card (stacks on mobile), alternating image side:

```
┌──────────────────────────────────────────────────────────┐
│  CASE STUDY · 01                        [screenshot      │
│  CampusAxis                              w/ browser      │
│  Academic platform for 260+              chrome frame,   │
│  Pakistani universities                  zooms 1.03 on   │
│                                          card hover]     │
│  Role     Founder & Product Lead                         │
│  Problem  Students lose hours hunting past papers,       │
│           GPA tools, faculty info                        │
│  Built    Past papers · GPA/CGPA · merit calc ·          │
│           faculty insights · resources                   │
│                                                          │
│  [Next.js] [MongoDB] [Node] [+3]     View case study →   │
└──────────────────────────────────────────────────────────┘
```

- Mono eyebrow `CASE STUDY · 01` (numbering is legitimate here — it's a ranked sequence).
- **Role / Problem / Built / Outcome** rows with mono keys — this is what separates "portfolio grid" from "proof."
- Outcome line uses real numbers only (260+ universities, live users, shipped-to-client). No invented metrics.
- Screenshot inside a minimal browser-chrome frame (`border-radius`, dot row) — instantly reads "real product."
- Hover: shadow lift + screenshot `scale(1.03)` (`overflow:hidden` container, transform-only), arrow slides 4px. No expansion accordion — link to the existing `/projects/[slug]` detail page, whose CTA text becomes **View case study** (keep "Live preview" as secondary where a live URL exists).
- MegiLance card's "Built" row shows its workflow: `job post → AI pricing → proposal ranking → escrow → review` (mono, with arrows — pipeline motif again).
- Clinic card is positioned explicitly as **commercial client work**: `Built for a paying client — website, bookings, patient records, billing, staff portal.`

### 5.2 Standard card (PakUni, HealSmart, PulseFocus, MegiCloth)

Compact vertical card: screenshot top (16:10, same chrome frame), title, one-line problem→solution, 3 stack pills, arrow link. Same hover language, smaller amplitude.

### 5.3 Data model

`models/Project.js` likely needs fields: `role`, `problem`, `solution`, `outcome`, `featured` rank. Populate via the existing admin. Fall back gracefully when absent (render nothing, not placeholders).

---

## 6. Contact Redesign (page + homepage band)

### 6.1 Intent router — NEW `components/Contact/IntentPaths.js`

Three cards above the form (page) / chips (homepage band):

1. **Hire me for a role** — Full-stack · AI/ML · Software engineering. *"Open to remote globally, on-site/hybrid in Lahore."* → prefills intent=Hire
2. **Start a project with Megicode** — AI SaaS, platforms, automation, dashboards. → prefills intent=Project (orange accent card — the conversion path)
3. **Discuss product direction** — MVP scope, roadmap, technical clarity for founders. → prefills intent=Consult

Selecting a card scrolls to the form with intent preselected and swaps the conditional field (see below).

### 6.2 Form upgrade — `ContactUs.js` (+ `WorkWithMeModal.js`, same fields)

- Name · Email · **Intent** (segmented control: Hire / Project / Partnership / General) · conditional field: *Role type* (if Hire) or *Budget range* (if Project: `<$1k / $1–5k / $5–15k / $15k+ / Not sure`) · **Timeline** (`ASAP / 1–3 months / Exploring`) · Message.
- Micro-interactions: label floats on focus, 2px `--border-focus` ring, submit button success morph (→ checkmark, 400ms), inline validation on blur (never on keystroke).
- Trust microcopy under submit (mono, small): `● Available now · Lahore → global, remote-ready · Replies within 24–48h · No spam, ever`.
- Direct links row (email/GitHub/LinkedIn from `pages/contact.js`) stays — some people will never fill a form.

---

## 7. Other Pages

### 7.1 Projects page — `pages/projects.js` (757 lines, heavy inline CSS)

- Move the 300+ inline style lines into a CSS module (audit debt; do it while touching the page).
- **Hero:** eyebrow `PROOF OF WORK` + "Products I've shipped" + one-line positioning + count (`15+ projects · 3 platforms · commercial client work`).
- **Featured spotlight:** CampusAxis as a full-width dark (`--bg-ink`) spotlight card at top.
- **Filter chips:** pill row (All / Platforms / AI & Data / Mobile / Client work), mono labels, animated with `AnimatePresence` layout transitions on the grid.
- Explicit non-equal ordering: CampusAxis → MegiLance → Aesthetics Clinic → PakUni → HealSmart → PulseFocus → MegiCloth (use `displayOrder`, already in the model).
- Cards per §5. "Built with" stack rendered on every card.

### 7.2 About page — `pages/about.js`

- Reorder for founder-first: intro → **Founder Journey timeline** (share `FounderJourney` component) → "What I'm building now" (Megicode/MegiLance/CampusAxis status cards) → experience → education *last and short*.
- Real metrics strip: `260+ universities served · 15+ products · 5 Google certs · 3+ yrs AI/ML`.
- End CTA band: "Building something? → Start a project" + "Hiring? → View resume".

### 7.3 Resume page — `pages/portfolio/resume.js`

- Header card: name, target roles line (`Software Engineer · Full Stack · AI/ML`), location + remote-ready, prominent **Download PDF** (`--cta-accent`), quiet "Print" secondary.
- Content: role-focused sections, grouped skills (mirror the 4 capability groups), experience timeline (text, minimal), project highlights linking to case studies.
- Motion: entrance fade only. Add `@media print` styles: hide nav/footer/toggle, black-on-white, no shadows.

### 7.4 Insights — `pages/insights/index.js` + article cards

- Header: **Product & Engineering Insights** — "Lessons from building and shipping real products." (keep "Insights" name).
- **Featured insight:** first/pinned article as a wide editorial card (larger type, no thumbnail crop).
- Editorial card anatomy: category (mono, colored per category) → title (Poppins 600, 2-line clamp) → 1-line dek → footer row `5 min read · Feb 2026`. Hover: title → brand blue + arrow nudge; **no** image zoom here — restraint separates editorial from product cards.
- Filters: same chip system as projects (one shared `FilterChips` component).
- Empty/loading states: 3 skeleton cards with shimmer; empty → "New essays are being written. Meanwhile, see what I've shipped →".

---

## 8. Mobile Improvements

- Hero: portrait (smaller, rings always-on as today) → greeting/H1 → sub → CTAs full-width stacked (primary first) → proof chips as horizontal scroll-snap row. Orbit chips + cursor parallax OFF.
- Trust strip wraps to 2 lines max; drop least-important chip via CSS order/hide.
- Featured case cards stack image-first; "Role/Problem/Built" rows become a tight definition list; tap anywhere = card link (single `<a>` wrapper, no nested links).
- Filter chips: horizontal scroll-snap with edge-fade mask instead of wrapping.
- Tap targets ≥ 44px; form inputs `font-size: 16px` minimum (prevents iOS zoom).
- Section vertical rhythm: `clamp(56px, 10vw, 96px)` between sections — consistent everywhere (replaces per-section ad-hoc padding).
- Mobile menu: glass panel, spring slide, staggered links (§3).
- Plexus canvas on mobile: cap nodes ~40 or render static.

---

## 9. Design System Tokens — additions summary

All additions go in `styles/tokens.css` (§1.1, §1.2 code blocks), plus:

```css
:root {
  --container-max: 1200px;          /* one container width, everywhere */
  --container-pad: clamp(16px, 4vw, 32px);
  --section-gap: clamp(56px, 10vw, 96px);
  --shadow-card: 0 1px 2px rgba(15,27,51,.06), 0 8px 24px rgba(15,27,51,.08);
  --shadow-card-hover: 0 2px 4px rgba(15,27,51,.08), 0 16px 40px rgba(15,27,51,.14);
  --radius-card: 16px;              /* cards: 16px; pills/chips: full; inputs: 10px */
  --focus-ring: 0 0 0 3px rgba(69,115,223,.35);
}
[data-theme="dark"] {
  --ink-display: #eef2f9;
  --shadow-card: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.35);
}
```

Component classes to standardize (new `styles/patterns.module.css` or per-component): `sectionHeader` (eyebrow+headline+lede), `chip`, `stackPill`, `caseCard`, `btnPrimary` / `btnCta` / `btnGhost`, `browserFrame`.

Focus states: every interactive element gets `box-shadow: var(--focus-ring)` on `:focus-visible` — no `outline: none` without replacement.

---

## 10. Implementation Checklist (phased, high-ROI first)

**Phase 1 — Hero + trust (the first impression)**
- [ ] Add tokens (§1, §9) to `tokens.css`
- [ ] Create `lib/motion.js`; wire `ScrollReveal` to it
- [ ] Hero copy + visible H1 + CTA trio in `welcome.js`; remove text scale-hover
- [ ] Pipeline SVG component (`components/AnimatedUI/PipelineLine.js`)
- [ ] Static base ring + orbit chips around `PortfolioPictureImage` (hover burst untouched)
- [ ] `TrustStrip` component + insert under hero
- [ ] Font consolidation: 2 families, subset weights

**Phase 2 — Proof (projects as case studies)**
- [ ] Extend `Project` model (`role/problem/solution/outcome`); fill via admin for top 3
- [ ] Featured case card + standard card in `Project1.js` / `ProjectsPreview`
- [ ] Projects page: hero, spotlight, filter chips, inline-CSS extraction
- [ ] Detail page CTA → "View case study" framing

**Phase 3 — Conversion (contact everywhere)**
- [ ] `IntentPaths` cards + form fields (intent/budget/timeline) in `ContactUs` + `WorkWithMeModal`
- [ ] Trust microcopy + success morph
- [ ] Nav CTA button ("Start a Project")

**Phase 4 — Story & capabilities**
- [ ] `FounderJourney` timeline (home + about)
- [ ] `SkillFrame` capability reframe; retire standalone `Languages` section
- [ ] `BadgeScroll` compression
- [ ] About page reorder

**Phase 5 — Editorial + resume + polish**
- [ ] Insights editorial cards, featured insight, shared `FilterChips`
- [ ] Resume header/download/print styles
- [ ] Mobile pass (§8), section rhythm token everywhere
- [ ] A11y/perf gate: Lighthouse ≥ 95 perf / 100 a11y on home; reduced-motion audit; `pages/search.js` fix; footer link fix

Each phase ships independently — no big-bang.

---

## 11. What to Preserve (do not touch)

- **Hero hover animation** — the 6-ring ellipse burst, its scroll-hide behavior, mobile always-on mode
- Brand blue `#4573df`, light-first theme, existing theme system (`ThemeContext`, `data-theme`, auto/light/dark)
- SEO layer: `components/SEO.js`, all JSON-LD schemas, canonical/redirect structure, sitemap pipeline
- ISR + client-refresh data flow for projects/articles (it's well built — the empty/loading state logic in `ProjectsPreview` is correct, keep it)
- Plexus contact background (tuned, not removed)
- `WorkWithMeModal` flow (extended, not replaced)
- Section IDs (`#home-section`, `#project-section`…) — nav and speakable schema depend on them
- `tokens.css` structure, spacing scale, z-index scale
- Skip link, ARIA labeling patterns, error boundaries, PWA setup

## 12. What to Remove or Simplify

- **Text scale-on-hover** in hero headline (`whileHover scale 1.05/1.1`) → underline sweep
- **Standalone Languages section** on homepage → folded into Capabilities/About
- **2 extra font families** (keep 2 of 4)
- **Duplicate article card components** (`ArticleCard` + `NewArticleCard` → one)
- **Inline styles / JSX style blocks** in `pages/projects.js` (extract while redesigning)
- **Triple Light/Dark/Common CSS module pattern** for all NEW components (tokens + `[data-theme]` instead)
- **Hardcoded colors** wherever a file is touched — swap to tokens opportunistically
- **Duplicate meta tags** (viewport/preconnect declared twice — audit P-item)
- Plexus node count on mobile; marquee speed on badges
- Any "equal grid" presentation of projects — hierarchy is the point

---

*Companion docs: `PORTFOLIO_AUDIT.md` (bug-level fixes — Phase 5 gate references it), `DEV_TASKS.md`.*
