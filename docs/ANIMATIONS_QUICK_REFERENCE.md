# Modern Web Animations - Quick Reference

## Quick Start

### 1. Scroll-Triggered Animations

```javascript
import { useScrollTrigger } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, hasEntered } = useScrollTrigger();
  
  return (
    <div 
      ref={ref}
      style={{
        animation: hasEntered ? 'fadeInUp 0.6s ease-out' : 'none',
      }}
    >
      Content
    </div>
  );
}
```

### 2. Staggered Cards

```javascript
{items.map((item, index) => (
  <div
    key={item.id}
    style={{
      animation: hasEntered 
        ? `fadeInUp 0.6s ease-out ${index * 50}ms both` 
        : 'none',
    }}
  >
    {item.content}
  </div>
))}
```

### 3. Popover Component

```javascript
import { Popover, Tooltip, Dropdown } from '@/components/Popover/Popover';

// Basic
<Popover trigger={<button>Open</button>}>
  Content here
</Popover>

// Tooltip
<Tooltip content="Help text" placement="top" trigger={<span>?</span>} />

// Dropdown
<Dropdown 
  items={['A', 'B', 'C']} 
  onSelect={handleSelect}
  trigger={<button>Menu</button>}
/>
```

## Animation Classes

### Entrances
```html
<div class="fadeInUp">Slides up and fades</div>
<div class="scaleInCenter">Bounces in from center</div>
<div class="rotateIn">Rotates and fades in</div>
```

### Hover Effects
```html
<div class="hoverLift">Lifts on hover</div>
<div class="hoverScale">Scales to 102%</div>
<div class="hoverGlow">Glows on hover</div>
```

### Scroll
```html
<div class="revealOnScroll">Reveals on scroll</div>
<div class="parallaxOnScroll">Parallax effect</div>
<div class="fadeOnScroll">Fades on scroll</div>
```

## Hooks Reference

### useScrollTrigger
Detects when element enters viewport.

```javascript
const { ref, isVisible, hasEntered } = useScrollTrigger({
  threshold: 0.1, // 10% visible
  rootMargin: '0px 0px -50px 0px'
});
```

### useScrollAnimation
Smooth animations tied to scroll position.

```javascript
const { ref, scrollProgress, style } = useScrollAnimation({
  type: 'fade',     // 'fade', 'slide', 'scale', 'rotate'
  direction: 'up',  // 'up', 'down', 'left', 'right'
});
```

### useParallax
Parallax scrolling effect.

```javascript
const { ref, style } = useParallax(0.5); // Speed multiplier
```

### useScrollDirection
Detect scroll direction.

```javascript
const { scrollDirection } = useScrollDirection(); // 'up' or 'down'
```

### useNearBottom
Detect when near page bottom.

```javascript
const { isNearBottom } = useNearBottom(500); // 500px from bottom
```

### useSmoothScroll
Smooth scroll to elements.

```javascript
const { scrollToElement } = useSmoothScroll();
scrollToElement('target-id');
```

## CSS Tokens

```css
/* Timing */
--duration-fast: 120ms
--duration-normal: 200ms
--duration-slow: 320ms

/* Easing */
--ease-standard: cubic-bezier(0.2, 0, 0, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)

/* Z-Index */
--z-popover: 60
--z-modal: 50
--z-fixed: 40
```

## Common Patterns

### Animate on Scroll + Stagger

```javascript
const { ref, hasEntered } = useScrollTrigger();

return (
  <div ref={ref}>
    {items.map((item, i) => (
      <div
        key={item.id}
        style={{
          animation: hasEntered 
            ? `fadeInUp 0.6s ease-out ${i * 50}ms both`
            : 'none'
        }}
      >
        {item.name}
      </div>
    ))}
  </div>
);
```

### Hover Lift Effect

```javascript
<div
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  style={{
    transition: 'all var(--duration-normal) var(--ease-out)',
  }}
>
  Content
</div>
```

### Auto-Hide NavBar on Scroll

```javascript
const { scrollDirection } = useScrollDirection();

return (
  <nav style={{
    transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'translateY(0)',
    transition: 'transform var(--duration-normal) var(--ease-out)',
  }}>
    {/* navbar content */}
  </nav>
);
```

## Performance Tips

1. Use `will-change` during animations, remove after
2. Animate transform and opacity (GPU accelerated)
3. Use passive event listeners for scroll
4. Debounce frequent event handlers
5. Profile with DevTools Performance tab

## Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| View Transitions API | 111+ | 111+ | 18+ | Soon |
| Intersection Observer | All | All | All | All |
| Web Popover API | 114+ | 114+ | 17.4+ | Soon |
| CSS Animations | All | All | All | All |

## Troubleshooting

**Animations not playing:**
- Check if `hasEntered` is true
- Verify ref is attached to element
- Clear browser cache

**Janky scrolling:**
- Use passive listeners: `{ passive: true }`
- Reduce concurrent animations
- Profile with DevTools

**Popover not showing:**
- Verify browser support
- Check z-index stacking
- Ensure `popover="manual"` attribute

## Examples

See these components for implementation examples:
- `components/NavBar_Desktop/nav-bar.js` - NavBar animations
- `components/Projects/ProjectsPreview.js` - Card stagger
- `components/Articles/ArticlesPreview.js` - Article cards
- `components/Services/ServicesFrame.js` - Service cards
- `components/Popover/Popover.js` - Popover components

---

For detailed guide, see `docs/ANIMATIONS_GUIDE.md`
