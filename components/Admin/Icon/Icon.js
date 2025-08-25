import React from "react";
import * as Lu from "react-icons/lu";

const toWords = (s) =>
  String(s || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/);

const toPascal = (s) =>
  toWords(s)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

const toCamel = (s) => {
  const [first, ...rest] = toWords(s);
  return [first?.toLowerCase() || "", ...rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())].join("");
};

const Icon = ({ name, size = 24, ...props }) => {
  const pascal = toPascal(name);
  const camel = toCamel(name);
  const luKeyCandidates = [
    `Lu${pascal}`,
    `Lu${camel.charAt(0).toUpperCase()}${camel.slice(1)}`,
  ];
  let Comp = null;
  for (const key of luKeyCandidates) {
    if (Lu[key]) {
      Comp = Lu[key];
      break;
    }
  }
  if (!Comp) Comp = Lu.LuHelpCircle || ((p) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#e5e7eb" />
    </svg>
  ));
  return <Comp size={size} {...props} />;
};

export default Icon;
