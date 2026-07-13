import type { IconType } from "react-icons";
import {
  GiWolfHead,
  GiCat,
  GiGargoyle,
  GiBearHead,
  GiSnake,
  GiScorpion,
  GiCrossedSwords,
  GiBroadsword,
  GiRoundShield,
  GiPotionBall,
  GiFireBomb,
  GiCompass,
  GiTrophy,
  GiTrashCan,
  GiTreasureMap,
  GiScrollUnfurled,
  GiMedievalGate,
  GiSkullMask,
  GiDiceSixFacesFive,
  GiStack,
  GiSpellBook,
  GiAnchor,
  GiChest,
  GiHamburgerMenu,
  GiCheckMark,
  GiArrowDunk,
  GiMeditation,
  GiSwordBrandish,
  GiMagnifyingGlass,
  GiInfo,
  GiPerspectiveDiceSixFacesRandom,
  GiReturnArrow,
  GiMagicSwirl,
  GiDeathSkull,
  GiSailboat,
  GiDragonHead,
  GiPathDistance,
  GiDrop,
  GiCrown,
  GiCardPlay,
  GiCardDiscard,
} from "react-icons/gi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaXmark,
  FaArrowRight,
  FaPlus,
  FaMinus,
  FaTriangleExclamation,
} from "react-icons/fa6";

export type WitcherIconName =
  | "home"
  | "map"
  | "scroll"
  | "automa"
  | "play"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "chevron-down"
  | "dice"
  | "layers"
  | "anchor"
  | "skull"
  | "sword"
  | "crossed-swords"
  | "shield"
  | "potion"
  | "bomb"
  | "compass"
  | "trophy"
  | "trash"
  | "arrow-right"
  | "arrow-down"
  | "check"
  | "plus"
  | "minus"
  | "close"
  | "state"
  | "menu"
  | "book"
  | "search"
  | "alert"
  | "help"
  | "info"
  | "refresh"
  | "combat"
  | "cards"
  | "discard"
  | "magic"
  | "meditate"
  | "sail"
  | "legendary"
  | "trail";

export type SchoolIconName = "wolf" | "cat" | "griffin" | "bear" | "viper" | "manticore";

const ICONS: Record<WitcherIconName, IconType> = {
  home: GiMedievalGate,
  map: GiTreasureMap,
  scroll: GiScrollUnfurled,
  automa: GiSkullMask,
  play: GiCardPlay,
  "chevron-left": FaChevronLeft,
  "chevron-right": FaChevronRight,
  "chevron-up": FaChevronUp,
  "chevron-down": FaChevronDown,
  dice: GiDiceSixFacesFive,
  layers: GiStack,
  anchor: GiAnchor,
  skull: GiDeathSkull,
  sword: GiBroadsword,
  "crossed-swords": GiCrossedSwords,
  shield: GiRoundShield,
  potion: GiPotionBall,
  bomb: GiFireBomb,
  compass: GiCompass,
  trophy: GiTrophy,
  trash: GiTrashCan,
  "arrow-right": FaArrowRight,
  "arrow-down": GiArrowDunk,
  check: GiCheckMark,
  plus: FaPlus,
  minus: FaMinus,
  close: FaXmark,
  state: GiChest,
  menu: GiHamburgerMenu,
  book: GiSpellBook,
  search: GiMagnifyingGlass,
  alert: FaTriangleExclamation,
  help: GiInfo,
  info: GiInfo,
  refresh: GiReturnArrow,
  combat: GiSwordBrandish,
  cards: GiStack,
  discard: GiCardDiscard,
  magic: GiMagicSwirl,
  meditate: GiMeditation,
  sail: GiSailboat,
  legendary: GiDragonHead,
  trail: GiPathDistance,
};

export const SCHOOL_ICONS: Record<SchoolIconName, IconType> = {
  wolf: GiWolfHead,
  cat: GiCat,
  griffin: GiGargoyle,
  bear: GiBearHead,
  viper: GiSnake,
  manticore: GiScorpion,
};

export const SCHOOL_ICON_COLORS: Record<SchoolIconName, string> = {
  wolf: "text-red-400",
  cat: "text-emerald-400",
  griffin: "text-amber-400",
  bear: "text-amber-600",
  viper: "text-purple-400",
  manticore: "text-cyan-400",
};

type WitcherIconProps = {
  name: WitcherIconName;
  size?: number;
  className?: string;
  title?: string;
};

export function WitcherIcon({ name, size = 20, className = "", title }: WitcherIconProps) {
  const Icon = ICONS[name];
  return (
    <Icon
      size={size}
      className={`witcher-icon ${className}`.trim()}
      aria-hidden={title ? undefined : true}
      title={title}
    />
  );
}

type SchoolIconProps = {
  school: SchoolIconName | string;
  size?: number;
  className?: string;
};

export function SchoolIcon({ school, size = 20, className = "" }: SchoolIconProps) {
  const key = school as SchoolIconName;
  const Icon = SCHOOL_ICONS[key] ?? GiMagicSwirl;
  const color = SCHOOL_ICON_COLORS[key] ?? "text-orange-400";
  return <Icon size={size} className={`witcher-icon ${color} ${className}`.trim()} aria-hidden />;
}

/** Medallón con fondo para cartas de escuela */
export function SchoolMedallion({
  school,
  size = 40,
  pulse = false,
}: {
  school: SchoolIconName | string;
  size?: number;
  pulse?: boolean;
}) {
  const key = school as SchoolIconName;
  const ringClass: Record<SchoolIconName, string> = {
    wolf: "bg-amber-600/20 border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.3)]",
    cat: "bg-emerald-600/20 border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    griffin: "bg-amber-500/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    bear: "bg-amber-700/20 border-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.3)]",
    viper: "bg-purple-600/20 border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.3)]",
    manticore: "bg-cyan-600/20 border-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
  };
  const ring = ringClass[key] ?? "bg-orange-600/20 border-orange-600";
  const iconSize = Math.round(size * 0.55);
  return (
    <div
      className={`border rounded-full p-1.5 ${ring} ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <SchoolIcon school={school} size={iconSize} className="!text-inherit" />
    </div>
  );
}

/** Icono de dados animado para póker */
export function DiceIcon({ size = 20, className = "", spin = false }: { size?: number; className?: string; spin?: boolean }) {
  return (
    <GiPerspectiveDiceSixFacesRandom
      size={size}
      className={`witcher-icon ${spin ? "witcher-icon--spin" : ""} ${className}`.trim()}
      aria-hidden
    />
  );
}
