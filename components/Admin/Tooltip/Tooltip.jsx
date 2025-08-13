import React, { Children, cloneElement, isValidElement, useId } from "react";
import styles from "./Tooltip.module.css";

const Tooltip = ({ content, placement = "top", children }) => {
  const id = useId();
  const onlyChild = Children.only(children);
  const trigger = isValidElement(onlyChild)
    ? cloneElement(onlyChild, {
        "aria-describedby": id,
      })
    : onlyChild;

  return (
    <span className={`${styles.wrapper} ${styles[placement]}`}>
      {trigger}
      <span role="tooltip" id={id} className={styles.bubble}>
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
