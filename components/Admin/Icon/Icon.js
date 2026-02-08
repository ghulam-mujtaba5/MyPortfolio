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
  Home as LucideHome,
  File as LucideFile,
  FileText as LucideFileText,
  Users as LucideUsers,
  BarChart2 as LucideBarChart2,
  Clipboard as LucideClipboard,
  LogOut as LucideLogOut,
  Loader as LucideLoader,
  Briefcase as LucideBriefcase,
  Filter as LucideFilter,
  Tag as LucideTag,
  Layers as LucideLayers,
  Grid as LucideGrid,
  List as LucideList,
  Save as LucideSave,
  Move as LucideMove,
  Check as LucideCheck,
  GripVertical as LucideGripVertical,
  ArrowUpDown as LucideArrowUpDown,
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
  home: LucideHome,
  file: LucideFile,
  "file-text": LucideFileText,
  users: LucideUsers,
  "bar-chart-2": LucideBarChart2,
  clipboard: LucideClipboard,
  "log-out": LucideLogOut,
  loader: LucideLoader,
  briefcase: LucideBriefcase,
  filter: LucideFilter,
  tag: LucideTag,
  layers: LucideLayers,
  grid: LucideGrid,
  list: LucideList,
  save: LucideSave,
  move: LucideArrowUpDown,
  check: LucideCheck,
  grip: LucideGripVertical,
  x: LucideX,
  // aliases
  open: LucideExternalLink,
  barChart: LucideBarChart2,
  chart: LucideBarChart2,
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