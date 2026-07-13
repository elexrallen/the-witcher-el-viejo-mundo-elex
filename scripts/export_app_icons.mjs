/**
 * Genera app/js/icons.js desde react-icons (mismo set que Automa).
 * Ejecutar: node scripts/export_app_icons.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUTOMA = join(ROOT, "automa");
const OUT = join(ROOT, "app", "js", "icons.js");

const gi = await import(pathToFileURL(join(AUTOMA, "node_modules/react-icons/gi/index.mjs")).href);
const fa6 = await import(pathToFileURL(join(AUTOMA, "node_modules/react-icons/fa6/index.mjs")).href);
const { renderToStaticMarkup } = await import(
  pathToFileURL(join(AUTOMA, "node_modules/react-dom/server.browser.js")).href
);
const { createElement } = await import(pathToFileURL(join(AUTOMA, "node_modules/react/index.js")).href);

/** @type {Record<string, import('react-icons').IconType>} */
const ICON_COMPONENTS = {
  home: gi.GiMedievalGate,
  map: gi.GiTreasureMap,
  scroll: gi.GiScrollUnfurled,
  bot: gi.GiSkullMask,
  automa: gi.GiSkullMask,
  settings: gi.GiGears,
  "help-circle": gi.GiInfo,
  help: gi.GiInfo,
  info: gi.GiInfo,
  "chevron-left": fa6.FaChevronLeft,
  "chevron-right": fa6.FaChevronRight,
  "zoom-in": gi.GiMagnifyingGlass,
  undo: gi.GiReturnArrow,
  sword: gi.GiBroadsword,
  sparkles: gi.GiMagicSwirl,
  magic: gi.GiMagicSwirl,
  layers: gi.GiStack,
  eye: gi.GiEyeball,
  hand: gi.GiCardPlay,
  check: gi.GiCheckMark,
  castle: gi.GiMedievalGate,
  trees: gi.GiOak,
  anchor: gi.GiAnchor,
  wolf: gi.GiWolfHead,
  book: gi.GiSpellBook,
  dice: gi.GiDiceSixFacesFive,
  combat: gi.GiSwordBrandish,
  "crossed-swords": gi.GiCrossedSwords,
  potion: gi.GiPotionBall,
  trophy: gi.GiTrophy,
  chest: gi.GiChest,
  stash: gi.GiChest,
  shield: gi.GiShield,
  trash: gi.GiTrashCan,
};

function parseSvgMarkup(markup) {
  const viewBoxMatch = markup.match(/viewBox="([^"]+)"/);
  const inner = markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return {
    viewBox: viewBoxMatch?.[1] ?? "0 0 512 512",
    inner,
  };
}

const registry = {};
for (const [name, Component] of Object.entries(ICON_COMPONENTS)) {
  if (!Component) {
    console.warn("Missing icon:", name);
    continue;
  }
  registry[name] = parseSvgMarkup(renderToStaticMarkup(createElement(Component)));
}

const file = `/** Iconos temáticos (Game Icons / FA6) — alineados con Automa. Generado por scripts/export_app_icons.mjs */
/* eslint-disable max-len */

const ICONS = ${JSON.stringify(registry, null, 2)};

export function icon(name, { size = 20, className = "" } = {}) {
  const data = ICONS[name];
  if (!data) {
    return "";
  }

  const cls = ["witcher-icon", "icon", className].filter(Boolean).join(" ");
  return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="\${data.viewBox}" fill="currentColor" stroke="none" class="\${cls}" aria-hidden="true">\${data.inner}</svg>\`;
}

export function enhanceIconElements(root = document) {
  root.querySelectorAll("[data-icon]").forEach((element) => {
    const name = element.dataset.icon;
    const size = Number.parseInt(element.dataset.iconSize || "20", 10);
    element.innerHTML = icon(name, { size, className: element.dataset.iconClass || "" });
  });
}

export function locationIconId(locationId) {
  const map = {
    ciudad: "castle",
    naturaleza: "trees",
    skellige: "anchor",
    "caceria-fase-1": "wolf",
    "caceria-fase-2": "wolf",
  };
  return map[locationId] || "map";
}
`;

writeFileSync(OUT, file, "utf8");
console.log(`Wrote ${OUT} (${Object.keys(registry).length} icons)`);
process.exit(0);
