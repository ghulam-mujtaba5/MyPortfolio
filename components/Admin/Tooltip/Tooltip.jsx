import React, { Children, cloneElement, isValidElement, useId } from "react";
import commonStyles from "./Tooltip.module.css";
import lightStyles from "./Tooltip.light.module.css";
import darkStyles from "./Tooltip.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";

const Tooltip = ({ content, placement = "top", children }) => {
  const id = useId();
  const onlyChild = Children.only(children);
  const trigger = isValidElement(onlyChild)
    ? cloneElement(onlyChild, {
        "aria-describedby": id,
      })
    : onlyChild;

  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <span className={`${commonStyles.wrapper} ${commonStyles[placement]}`}>
      {trigger}
      <span role="tooltip" id={id} className={`${commonStyles.bubble} ${themeStyles.bubble}`}>
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
