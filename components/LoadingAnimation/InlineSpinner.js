import dynamic from "next/dynamic";
import React from "react";

// Dynamically import to avoid SSR issues
const LoadingAnimation = dynamic(
  () => import("./LoadingAnimation"),
  { ssr: false }
);

/**
 * InlineSpinner
 * A tiny preset for inline usage of the LoadingAnimation (ring variant).
 *
 * Props:
 * - sizePx: number (default 16)
 * - ariaHidden: boolean (default true) — wraps in a span aria-hidden when true
 * - className, style: forwarded to wrapper span
 */
const InlineSpinner = ({ sizePx = 16, ariaHidden = true, className, style }) => {
  const spinner = (
    <LoadingAnimation
      visible
      fullscreen={false}
      variant="ring"
      sizePx={sizePx}
      showStars={false}
    />
  );
  if (ariaHidden) {
    return (
      <span aria-hidden="true" className={className} style={style}>
        {spinner}
      </span>
    );
  }
  return (
    <span className={className} style={style}>
      {spinner}
    </span>
  );
};

export default InlineSpinner;
