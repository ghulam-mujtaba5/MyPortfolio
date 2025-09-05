import React from "react";
import Icon from "../Icon/Icon";
import styles from "./Select.module.css";

const Select = ({ value, onChange, children, ...props }) => {
  return (
    <div className={styles.wrapper}>
      <select
        className={styles.select}
        value={value}
        onChange={onChange}
        {...props}
      >
        {children}
      </select>
      <div className={styles.iconWrapper}>
        <Icon name="chevronDown" size={16} />
      </div>
    </div>
  );
};

export default Select;
