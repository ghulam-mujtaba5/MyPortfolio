import React from "react";
import styles from "./TopProgress.module.css";

export default function TopProgress({ active, done }) {
  let cls = styles.bar;
  if (active) cls += ` ${styles.active}`;
  if (done) cls += ` ${styles.done}`;
  return <div className={cls} aria-hidden={!active && !done} />;
}
