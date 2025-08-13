import React from "react";
import Icon from "../Icon/Icon";
import styles from "./SearchInput.module.css";

const SearchInput = ({ value, onChange, placeholder, ...props }) => {
  return (
    <div className={styles.wrapper}>
      <Icon name="search" className={styles.icon} size={18} />
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
