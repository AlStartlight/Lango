/**
 * Local artwork registry for the Lango Expedition UI.
 *
 * Every illustration ships from the Google Stitch design bundle and is served
 * from `public/images/stitch/**`; the app never depends on a remote image host.
 * Artwork is decorative: the accessible name always comes from the surrounding
 * heading or link, so story images render with an empty `alt`.
 */

export type StoryImage = {
  src: string;
  alt: string;
  /** CSS `object-position` used to keep the subject in frame on tight cards. */
  position?: string;
};

function image(src: string, alt: string, position?: string): StoryImage {
  return { src: `/images/stitch/${src}`, alt, position };
}

export const MASCOT_IMAGES = {
  explorer: image("mascot/lango-explorer.webp", "Lango the chameleon explorer", "50% 42%"),
  detective: image("mascot/lango-detective.webp", "Lango the chameleon detective", "50% 42%"),
  celebrate: image("mascot/lango-celebrate.webp", "Lango the chameleon celebrating", "50% 40%"),
  reader: image("mascot/lango-reader.webp", "Lango the chameleon reading", "50% 45%"),
} as const;

export const CHARACTER_IMAGES = {
  aoiAvatar: image("characters/aoi-avatar.webp", "Aoi Sasaki", "50% 35%"),
  aoiPortrait: image("characters/aoi-portrait.webp", "Aoi Sasaki", "50% 38%"),
  aoiWatercolor: image("characters/aoi-watercolor.webp", "Aoi Sasaki", "50% 35%"),
  aoiBarista: image("characters/aoi-barista.webp", "Aoi Sasaki behind the café counter", "50% 38%"),
  aoiHachiko: image("characters/aoi-hachiko.webp", "Aoi Sasaki in Shibuya", "50% 35%"),
} as const;

export const AVATAR_IMAGES = {
  chibiGirl: image("avatars/chibi-girl.webp", "Learner avatar", "50% 45%"),
  chibiBoy: image("avatars/chibi-boy.webp", "Learner avatar", "50% 45%"),
  chibiIndonesian: image("avatars/chibi-indonesian.webp", "Learner avatar", "50% 45%"),
  chibiBandana: image("avatars/chibi-bandana.webp", "Learner avatar", "50% 45%"),
  learner: image("avatars/learner.webp", "Learner avatar", "50% 45%"),
} as const;

export const BRAND_IMAGE = image("brand/lango-logo.webp", "Lango");

const SCENES = {
  stationGolden: image("scenes/station-golden.webp", "Golden-hour train platform"),
  stationDusk: image("scenes/station-dusk.webp", "Train platform at dusk"),
  stationCat: image("scenes/station-cat.webp", "A station-master cat on a bench"),
  shinjukuDay: image("scenes/shinjuku-day.webp", "Shinjuku crossing in spring"),
  asakusa: image("scenes/asakusa.webp", "Asakusa temple gate at dusk"),
  kyotoLanterns: image("scenes/kyoto-lanterns.webp", "Lantern-lit Kyoto street in autumn"),
  nightMarket: image("scenes/night-market.webp", "A neon night-market alley"),
  cafeWindow: image("scenes/cafe-window.webp", "A café window overlooking the crossing"),
  foxForest: image("scenes/fox-forest.webp", "A mossy forest with torii gates"),
  dragonPalace: image("scenes/dragon-palace.webp", "A glowing undersea dragon palace"),
  cafeCashier: image("scenes/cafe-cashier.webp", "A café counter at golden hour"),
  cafeBarista: image("scenes/cafe-barista.webp", "A warm wood café interior"),
  cafeInterior: image("scenes/cafe-interior.webp", "A cosy café interior"),
  cafeCounter: image("scenes/cafe-counter.webp", "A kissaten counter"),
  hachiko: image("scenes/hachiko.webp", "The Hachikō statue"),
  shibuyaHachiko: image("scenes/shibuya-hachiko.webp", "Shibuya crossing with Hachikō"),
  akihabaraStore: image("scenes/akihabara-store.webp", "An electronics store in Akihabara"),
  akihabaraNeon: image("scenes/akihabara-neon.webp", "Neon Akihabara at golden hour"),
  akihabaraStreet: image("scenes/akihabara-street.webp", "Akihabara electric town"),
  akihabaraNight: image("scenes/akihabara-night.webp", "Akihabara neon at night"),
  akihabaraSunny: image("scenes/akihabara-sunny.webp", "Sunny Akihabara street"),
  treasureChest: image("scenes/treasure-chest.webp", "A glowing treasure chest"),
  shibuyaCrossing: image("scenes/shibuya-crossing.webp", "Shibuya crossing in cherry-blossom season"),
  aoiStation: image("scenes/aoi-station.webp", "Aoi waiting on the platform"),
  aoiAkihabara: image("scenes/aoi-akihabara.webp", "Aoi in Akihabara"),
  aoiCafe: image("scenes/aoi-cafe.webp", "Aoi at a Shibuya café"),
};

export type SceneKey = keyof typeof SCENES;

const GROUPS: Record<string, SceneKey[]> = {
  station: ["stationGolden", "stationDusk", "shinjukuDay", "stationCat", "aoiStation"],
  cafe: ["cafeInterior", "cafeCashier", "cafeBarista", "cafeCounter", "cafeWindow", "aoiCafe"],
  market: ["nightMarket", "asakusa", "kyotoLanterns"],
  street: ["asakusa", "shinjukuDay", "akihabaraStreet", "akihabaraSunny", "shibuyaHachiko", "aoiAkihabara"],
  shop: ["akihabaraStore", "akihabaraNeon", "akihabaraNight", "akihabaraStreet"],
  forest: ["foxForest", "kyotoLanterns"],
  lane: ["kyotoLanterns", "asakusa"],
  water: ["dragonPalace", "shibuyaHachiko"],
  night: ["akihabaraNight", "nightMarket", "stationDusk"],
  calm: ["foxForest", "cafeWindow", "kyotoLanterns"],
};

const ALL_SCENES = Object.keys(SCENES) as SceneKey[];

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 1_000_003;
  }
  return result;
}

const KEYWORDS: Array<{ group: keyof typeof GROUPS; pattern: RegExp }> = [
  { group: "station", pattern: /(station|platform|rail|train|駅|stasiun|bahnhof|gare|estación|seoul|dōjō|dojo)/i },
  { group: "cafe", pattern: /(cafe|café|kissaten|coffee|bakery|barista|bäckerei|forno|kue|tea|bubble tea|restaurant|diner|counter|こもれび|喫茶|茶|boulangerie)/i },
  { group: "market", pattern: /(market|bazaar|souk|feira|pasar|markt|marché|mercado|朝市|商店街|shopping street)/i },
  { group: "shop", pattern: /(shop|store|toko|loja|konbini|convenience|electronics|bookstore|bookshop|librairie|apothecary)/i },
  { group: "forest", pattern: /(forest|park|garden|hill|grove|orange|olive|mori|森|shrine|temple|病院|hospital|mountain)/i },
  { group: "water", pattern: /(harbor|harbour|sea|ocean|river|pier|lighthouse|beach|lake|water|pelabuhan|pantai|port)/i },
  { group: "night", pattern: /(night|malam|noite|nacht|nuit|neon|lantern|dusk)/i },
  { group: "lane", pattern: /(lane|alley|小路|gali|rua|calle|胡同|street|鈴掛小路|街|downtown)/i },
  { group: "street", pattern: /(road|crossing|neighborhood|quarter|straße|rue|arcade|boulevard|avenue)/i },
];

/**
 * Chooses a local illustration for a story scene, episode card, or world cover.
 * The same seed always returns the same artwork so covers stay stable between
 * renders and between the server and the client.
 */
export function resolveSceneArt(input: {
  seed?: string | null;
  setting?: string | null;
  worldId?: string | null;
  prefer?: SceneKey[] | null;
}): StoryImage {
  const { seed, setting, worldId, prefer } = input;
  const haystack = `${setting ?? ""} ${worldId ?? ""}`;
  const matches = KEYWORDS.filter((entry) => entry.pattern.test(haystack));
  const seedKey = `${seed ?? ""}|${setting ?? ""}|${worldId ?? ""}`;
  const group =
    matches.length > 0 ? matches[hash(seedKey) % matches.length].group : null;
  const japaneseWorld = !worldId || worldId.startsWith("ja-");
  const basePool = prefer?.length
    ? prefer
    : group
      ? GROUPS[group]
      : ALL_SCENES;
  const pool = japaneseWorld
    ? basePool
    : basePool.filter((key) => !key.startsWith("aoi"));
  const safePool = pool.length > 0 ? pool : ALL_SCENES.filter((key) => !key.startsWith("aoi"));
  const key = safePool[hash(`${seedKey}|art`) % safePool.length];
  return SCENES[key];
}

/** Picks a portrait for a known story character; unknown speakers fall back to Lango. */
export function resolveCharacterArt(name: string | null | undefined): StoryImage | null {
  const value = (name ?? "").toLowerCase();
  if (!value) return null;
  if (/(\baoi\b|あおい)/i.test(value)) return CHARACTER_IMAGES.aoiAvatar;
  return null;
}

/** Deterministic learner avatar for decorative league/study-buddy rows. */
export function resolveAvatarArt(seed: string | null | undefined): StoryImage {
  const pool = [
    AVATAR_IMAGES.chibiGirl,
    AVATAR_IMAGES.chibiBoy,
    AVATAR_IMAGES.chibiIndonesian,
    AVATAR_IMAGES.chibiBandana,
  ];
  return pool[hash(seed ?? "lango") % pool.length];
}

export const SHOWCASE_SCENES: StoryImage[] = [
  SCENES.stationGolden,
  SCENES.kyotoLanterns,
  SCENES.shibuyaHachiko,
  SCENES.akihabaraNight,
  SCENES.cafeInterior,
  SCENES.foxForest,
  SCENES.dragonPalace,
  SCENES.hachiko,
];

export const CHEST_IMAGE = SCENES.treasureChest;
