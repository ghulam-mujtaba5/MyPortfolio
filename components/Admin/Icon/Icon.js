import React from "react";
import {
  Image as LucideImage,
  Eye as LucideEye,
  Calendar as LucideCalendar,
  Clock as LucideClock,
  Edit as LucideEdit,
  Trash2 as LucideTrash,
  Pin as LucidePin,
  ExternalLink as LucideExternalLink,
  Plus as LucidePlus,
  Search as LucideSearch,
  ChevronDown as LucideChevronDown,
  ChevronUp as LucideChevronUp,
  X as LucideX,
  Upload as LucideUpload,
  Download as LucideDownload,
  HelpCircle as LucideHelpCircle,
} from "lucide-react";

// Map of supported icon names to components.
// Add here as needed to cover your usage.
const ICONS = {
  // common
  image: LucideImage,
  eye: LucideEye,
  calendar: LucideCalendar,
  clock: LucideClock,
  edit: LucideEdit,
  trash: LucideTrash,
  pin: LucidePin,
  externalLink: LucideExternalLink,
  plus: LucidePlus,
  search: LucideSearch,
  chevronDown: LucideChevronDown,
  chevronUp: LucideChevronUp,
  close: LucideX,
  upload: LucideUpload,
  download: LucideDownload,
  // aliases
  open: LucideExternalLink,
};

const Icon = ({ name, size = 24, ...props }) => {
  const raw = String(name || "");
  const toWords = (s) =>
    s
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[-_]+/g, " ")
      .trim()
      .split(/\s+/);
  const toCamel = (s) => {
    const [first, ...rest] = toWords(s);
    return [first?.toLowerCase() || "", ...rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())].join("");
  };
  const candidates = [raw, toCamel(raw)];
  let Comp = null;
  for (const k of candidates) {
    if (ICONS[k]) {
      Comp = ICONS[k];
      break;
    }
  }
  if (!Comp) Comp = LucideHelpCircle;
  return <Comp size={size} {...props} />;
};

export default Icon;
