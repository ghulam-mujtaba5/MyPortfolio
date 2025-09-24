import React, { Children, cloneElement, isValidElement, useId, useState, useRef, useEffect } from "react";
import commonStyles from "./Tooltip.module.css";
import lightStyles from "./Tooltip.light.module.css";
import darkStyles from "./Tooltip.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";

const Tooltip = ({ 
  content, 
  placement = "top", 
  children, 
  delay = 300,
  disabled = false 
}) => {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);
  const onlyChild = Children.only(children);
  
  const trigger = isValidElement(onlyChild)
    ? cloneElement(onlyChild, {
        "aria-describedby": id,
        onMouseEnter: () => {
          if (disabled) return;
          timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
          }, delay);
        },
        onMouseLeave: () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          if (!isFocused) {
            setIsVisible(false);
          }
        },
        onFocus: () => {
          if (disabled) return;
          setIsFocused(true);
          setIsVisible(true);
        },
        onBlur: () => {
          setIsFocused(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setIsVisible(false);
        },
        onKeyDown: (e) => {
          if (e.key === "Escape") {
            setIsVisible(false);
            if (onlyChild.props.onKeyDown) {
              onlyChild.props.onKeyDown(e);
            }
          }
        }
      })
    : onlyChild;

  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (disabled) {
    return children;
  }

  return (
    <span 
      className={`${commonStyles.wrapper} ${commonStyles[placement]}`}
      role="tooltip"
    >
      {trigger}
      <span 
        id={id} 
        className={`${commonStyles.bubble} ${themeStyles.bubble} ${isVisible ? commonStyles.visible : ''}`}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;