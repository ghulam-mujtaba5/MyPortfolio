# Color Consistency Guide

This guide establishes a unified color system for the portfolio to ensure visual consistency across all pages while maintaining the intended UI/UX design.

## Core Brand Colors

### Primary Brand Color: Blue
The primary brand color used throughout the app is a professional blue:

| Token Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| `--brand-primary` | `#4573df` | `#4f8cff` | Primary buttons, links, accents |
| `--brand-primary-hover` | `#3b5fc7` | `#5a96ff` | Hover states |
| `--brand-primary-active` | `#2f4db5` | `#6ba0ff` | Active/pressed states |
| `--brand-primary-muted` | `rgba(69, 115, 223, 0.1)` | `rgba(79, 140, 255, 0.15)` | Subtle backgrounds |

### Semantic Colors

| Token Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| `--success` | `#10b981` | `#10b981` | Success messages, positive actions |
| `--warning` | `#f59e0b` | `#f59e0b` | Warning states, cautions |
| `--danger` | `#dc2626` | `#ef4444` | Errors, destructive actions |
| `--info` | `#0891b2` | `#06b6d4` | Informational states |

## Background Colors

### Light Mode Backgrounds
| Token Name | Value | Usage |
|------------|-------|-------|
| `--bg-page` | `#f7f9fc` | Main page background |
| `--bg-elevated` | `#ffffff` | Cards, modals, elevated surfaces |
| `--bg-subtle` | `#e8ebee` | Secondary sections, form backgrounds |
| `--bg-muted` | `#f2f5f9` | Muted areas, disabled states |

### Dark Mode Backgrounds
| Token Name | Value | Usage |
|------------|-------|-------|
| `--bg-page` | `#0b0f14` | Main page background |
| `--bg-elevated` | `#19212c` | Cards, modals, elevated surfaces |
| `--bg-subtle` | `#151b24` | Secondary sections |
| `--bg-muted` | `#11161d` | Muted areas |

## Text Colors

### Light Mode Text
| Token Name | Value | Usage |
|------------|-------|-------|
| `--text-primary` | `#1f2937` | Main content, headings |
| `--text-secondary` | `#4b5563` | Secondary text, descriptions |
| `--text-muted` | `#6b7280` | Placeholder, hints, metadata |

### Dark Mode Text
| Token Name | Value | Usage |
|------------|-------|-------|
| `--text-primary` | `#e6edf3` | Main content, headings |
| `--text-secondary` | `#b8c5d3` | Secondary text, descriptions |
| `--text-muted` | `#94a7ba` | Placeholder, hints, metadata |

## Border Colors

| Token Name | Light Mode | Dark Mode | Usage |
|------------|------------|-----------|-------|
| `--border-default` | `#dbe2ea` | `#263241` | Standard borders |
| `--border-subtle` | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.08)` | Subtle separators |
| `--border-focus` | `#4573df` | `#4f8cff` | Focus rings |

## Migration from Hard-Coded Colors

### Replace These Colors

| Old Color | Replace With |
|-----------|--------------|
| `#000`, `#222`, `#222222`, `#191d23`, `#0f172a` | `var(--text-primary)` |
| `#4b5563`, `#6b7280` | `var(--text-secondary)` or `var(--text-muted)` |
| `#ffffff`, `#fff` (as bg) | `var(--bg-elevated)` or `var(--surface)` |
| `#e8ebee` | `var(--bg-subtle)` |
| `#f7f9fc`, `#f8fafc`, `#f0f4f8` | `var(--bg-page)` |
| `#4573df`, `#3b82f6` | `var(--brand-primary)` or `var(--primary)` |
| `#2563eb`, `#1d4ed8` | `var(--brand-primary-hover)` |
| `#33a552`, `#34a853`, `#10b981` | `var(--success)` |
| `#f1792e` | `var(--warning)` |
| `#e81123`, `#dc2626`, `#ef4444` | `var(--danger)` |

## Component-Specific Guidelines

### Buttons
- Primary buttons: Use `--brand-primary` background, white text
- Secondary buttons: Use `--bg-subtle` background, `--text-primary` text
- Outline buttons: Transparent background, `--brand-primary` border and text

### Cards
- Background: `--bg-elevated` (light) or `--surface` (dark)
- Border: `--border-default`
- Hover: Slight shadow increase, optional subtle background shift

### Links
- Default: `--brand-primary`
- Hover: `--brand-primary-hover`
- Visited: Same as default (for consistency)

### Form Inputs
- Background: `--bg-elevated`
- Border: `--border-default`
- Focus: `--border-focus` with focus ring

## Gradients (Use Sparingly)

### Brand Gradient
```css
background: linear-gradient(135deg, var(--brand-primary) 0%, #5a86e6 100%);
```

### Accent Gradient (for special sections)
```css
background: linear-gradient(135deg, var(--brand-primary) 0%, var(--info) 100%);
```

## Implementation Notes

1. **Always use CSS variables** from `styles/tokens.css` instead of hard-coded hex values
2. **Test both themes** - every color change should work in light and dark mode
3. **Keep gradients subtle** - use them for accent areas, not primary UI
4. **Maintain contrast ratios** - ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)

## Files That Need Updates

Priority components that commonly use inconsistent colors:
- `components/welcome/` - Home page welcome section
- `components/Contact/` - Contact form
- `components/Resume/` - Resume section
- `components/Services/` - Services cards
- `components/Skills/` - Skills section
- `components/Articles/` - Article cards
- `components/Projects/` - Project cards (mostly consistent, use as reference)
