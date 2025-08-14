import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const Icon = ({ name, size = 24, ...props }) => {
  const LucideIcon = dynamic(() =>
    import("lucide-react").then((mod) => {
      const iconName = name.charAt(0).toUpperCase() + name.slice(1);
      const componentName =
        iconName.endsWith("s") ? iconName.slice(0, -1) : iconName;

      const formattedName = componentName
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("");

      return mod[formattedName] || mod["HelpCircle"];
    })
  );

  return (
    <Suspense
      fallback={
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#e5e7eb" />
        </svg>
      }
    >
      <LucideIcon size={size} {...props} />
    </Suspense>
  );
};

export default Icon;
