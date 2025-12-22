import React from 'react';
import { useScrollTrigger } from '../../hooks/useScrollAnimation';

/**
 * ScrollReveal component
 * Wraps content and animates it when it enters the viewport
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation class name (default: 'fadeInUp')
 * @param {string} props.className - Additional classes
 * @param {number} props.delay - Delay in ms
 * @param {number} props.threshold - Intersection threshold (0-1)
 * @param {string} props.width - Width of container (default: '100%')
 * @param {React.ElementType} props.as - Component to render as (default: 'div')
 */
const ScrollReveal = ({ 
  children, 
  animation = 'fadeInUp', 
  className = '', 
  delay = 0, 
  threshold = 0.1,
  width = '100%',
  as: Component = 'div',
  ...props 
}) => {
  const { ref, hasEntered } = useScrollTrigger({ threshold });

  const style = {
    animation: hasEntered ? `${animation} var(--duration-normal) var(--ease-out) both` : 'none',
    animationDelay: `${delay}ms`,
    opacity: hasEntered ? 1 : 0,
    width,
  };

  // If animation is one of the module classes, use it from styles object if possible, 
  // but since we are using global animation names defined in animations.module.css 
  // which are likely global or we need to map them.
  // Actually animations.module.css seems to define global keyframes but classes might be scoped if it's a module.
  // Let's check animations.module.css again. 
  // It has .fadeInUp { animation: ... }
  // If it is a module, we need to access styles.fadeInUp.
  
  // Use animation name directly since animations.css is now global
  
  return (
    <Component 
      ref={ref} 
      className={`${className} ${hasEntered ? animation : ''}`}
      style={{
        ...props.style,
        // We override the animation property if we want to control delay dynamically
        // But if we use the class, the class has the animation property.
        // Let's rely on the class for the animation definition, and just set opacity/visibility.
        // Wait, if the class has 'animation' property, it will run immediately if applied.
        // So we only apply the class when hasEntered is true.
        // But we also need to handle the initial state (opacity 0).
        opacity: hasEntered ? undefined : 0,
        animationDelay: `${delay}ms`,
        width,
      }}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
