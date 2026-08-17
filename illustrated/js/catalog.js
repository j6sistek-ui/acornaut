export const BUILD = "Illustrated · parity v2";
export const GAME_VERSION = "v1.2.0-illust";
export const SAVE_KEY = "acornaut_illust_v1";
export const LEGACY_KEYS = ["acornaut_beta", "acornaut_v2"];
export const PHYS = {
    gravity: 1300,
    flap: -450,
    dive: 380,
    bounceCancel: 210,
    squirrelX: 0.18,
    baseSpeed: 165,
    maxSpeed: 280,
    gapBase: 168,
    gapMin: 132,
    planetR: 42,
    powerDuration: 6,
    slowFactor: 0.42,
    goldDuration: 10,
    overdriveGate: 100,
    overdriveSpan: 50,
    magnetR: 200,
    squirrelR: 16,
};
export const NEWS = [
    "Illustrated rewrite: painted sprites, same physics.",
    "PILOT LEVELS: every run earns XP. Modes, mods, pals",
    "and titles unlock on the FLIGHT LOG.",
    "Debris kills. Planets bounce. Swipe cancels a bounce.",
    "Deep Space chains warps. Lost in Space tilts and drifts.",
];
export const HELMETS = [
    { id: "clear", name: "Clear", cost: 0, visor: "#bcd8f4", tint: 0.16, rim: "#cfd8e4", glow: null },
    { id: "ion", name: "Ion", cost: 15, visor: "#4ad8ff", tint: 0.22, rim: "#4ad8ff", glow: "#4ad8ff" },
    { id: "solar", name: "Solar", cost: 30, visor: "#ffc46b", tint: 0.22, rim: "#ffb040", glow: "#ffa32e" },
    { id: "nebula", name: "Nebula", cost: 50, visor: "#c86bff", tint: 0.24, rim: "#e070ff", glow: "#c060ff" },
    { id: "lunar", name: "Lunar", cost: 70, visor: "#d8e2f0", tint: 0.18, rim: "#b6c2d4", glow: "#cfe0ff" },
    { id: "void", name: "Void", cost: 90, visor: "#2a2438", tint: 0.3, rim: "#d4af37", glow: "#a855f7" },
    { id: "comet", name: "Comet", cost: 120, visor: "#ff8a4a", tint: 0.22, rim: "#ff6a28", glow: "#ff7a30" },
    { id: "cherry", name: "Cherry", cost: 150, visor: "#ff9ec4", tint: 0.22, rim: "#ff8ab0", glow: "#ff7ab0" },
    { id: "royal", name: "Royal", cost: 200, visor: "#7fe0cf", tint: 0.18, rim: "#d4af37", glow: "#ffd76a" },
    { id: "aurora", name: "Aurora", cost: 300, visor: "#4de8b8", tint: 0.2, rim: "#57e6c2", glow: "#5dffd0" },
    { id: "meteor", name: "Meteor", cost: 400, visor: "#c98a4e", tint: 0.22, rim: "#b5713a", glow: "#ff9d47" },
    { id: "chrono", name: "Chrono", cost: 500, visor: "#e8d9a8", tint: 0.18, rim: "#c9a94f", glow: "#ffe27a" },
];
export const SUITS = [
    { id: "flight", name: "Flight", cost: 0, hue: 0, sat: 1 },
    { id: "iontrim", name: "Ion", cost: 22, hue: 190, sat: 1.15 },
    { id: "copper", name: "Copper", cost: 48, hue: -8, sat: 1.25 },
    { id: "frost", name: "Frost", cost: 80, hue: 200, sat: 0.35 },
    { id: "voidsuit", name: "Void", cost: 180, hue: 270, sat: 0.7 },
    { id: "aurorasuit", name: "Aurora", cost: 250, hue: 160, sat: 1.2 },
    { id: "ember", name: "Ember", cost: 325, hue: -18, sat: 1.3 },
    { id: "stardust", name: "Stardust", cost: 400, hue: 230, sat: 1.1 },
    { id: "robo", name: "Robo", cost: 500, hue: 200, sat: 0.25, premium: "robo" },
    { id: "alien", name: "Alien", cost: 650, hue: 110, sat: 1.4, premium: "alien" },
    { id: "ghost", name: "Ghost", cost: 800, hue: 210, sat: 0.2, premium: "ghost" },
    { id: "bigbooty", name: "Big Booty", cost: 1000, hue: 280, sat: 1.2, premium: "booty" },
];
export const TRAILS = [
    { id: "sparks", name: "Rocket Sparks", cost: 0, colors: ["#ffe080", "#ff8030", "#ff4020"] },
    { id: "ion", name: "Ion Stream", cost: 60, colors: ["#b8f4ff", "#4ad8ff", "#1b6f92"] },
    { id: "bubble", name: "Bubble Jets", cost: 90, colors: ["#d8f6ff", "#7ad8ff", "#3aa0c8"] },
    { id: "bloom", name: "Nebula Bloom", cost: 120, colors: ["#ffb0ff", "#c060ff", "#6a2a9a"] },
    { id: "comet", name: "Comet Booster", cost: 200, colors: ["#ffd060", "#ff6a28", "#8a2f0c"] },
    { id: "prism", name: "Prism Shards", cost: 260, colors: ["#ff6ad2", "#6affd2", "#6ad2ff"] },
    { id: "plasma", name: "Plasma Arc", cost: 320, colors: ["#f4e8ff", "#b45cff", "#4a2080"] },
    { id: "galaxy", name: "Galaxy Dust", cost: 400, colors: ["#fff3b8", "#8fb8ff", "#3d4fa8"] },
    { id: "aurora", name: "Aurora Ribbon", cost: 460, colors: ["#5dffd0", "#7fe0cf", "#c86bff"] },
    { id: "frost", name: "Frostbite", cost: 520, colors: ["#eaf7ff", "#9fe4ff", "#6f9dc4"] },
    { id: "voidsmoke", name: "Void Smoke", cost: 580, colors: ["#c8b8e0", "#4f4270", "#241d33"] },
    { id: "supernova", name: "Supernova", cost: 650, colors: ["#fff8d0", "#ff9d47", "#ff4020"] },
];
export const PALS = [
    { id: "none", name: "None", tag: "SOLO", desc: "Fly solo. The classic run." },
    { id: "bee", name: "Astro Bee", tag: "VANILLA", desc: "Nothing extra spawns. Pure flying.", art: "bee" },
    { id: "buddy", name: "Acorn Buddy", tag: "MAGNET", desc: "Reels in nearby acorns, even behind you.", art: "buddy" },
    { id: "voidjelly", name: "Void Jelly", tag: "SOFT BOUNCE", desc: "Planet bounces are much gentler.", art: "voidjelly" },
    { id: "cometsprite", name: "Comet Sprite", tag: "LONG SLOW", desc: "Slow acorns last twice as long.", art: "cometsprite" },
    { id: "meteorcore", name: "Meteor Core", tag: "2X SPECIALS", desc: "Special acorns appear twice as often.", art: "meteorcore" },
    { id: "pocketmoon", name: "Pocket Moon", tag: "LOW GRAV", desc: "Lighter gravity, floatier flight.", art: "pocketmoon" },
    { id: "ufo", name: "Mini UFO", tag: "WARP SLOW", desc: "Slows time inside black-hole warps.", art: "ufo" },
    { id: "nutsack", name: '"Nut-Sack"', tag: "2X NUTS", desc: "Nuts double. Weak taps, heavy, no shields.", art: "nutsack" },
    { id: "starpup", name: "Star Pup", tag: "LONG GOLD", desc: "Golden acorns last twice as long.", art: "starpup" },
    { id: "tinbot", name: "Tin Bot", tag: "NO HOLES", desc: "No black holes or wormholes. No shields either.", art: "tinbot" },
    { id: "wisp", name: "Nebula Wisp", tag: "GATE DRIFT", desc: "Gates drift up and down — moving targets.", art: "wisp" },
];
export const ENVS = [
    { name: "DEEP SPACE", wash: [40, 60, 110, 0.14], wash2: [70, 90, 160, 0.06], planetBias: [0, 5, 7] },
    { name: "NEBULA NURSERY", wash: [150, 70, 210, 0.16], wash2: [255, 110, 180, 0.08], planetBias: [8, 10, 13] },
    { name: "ICE MOON", wash: [90, 180, 220, 0.12], wash2: [160, 230, 255, 0.06], planetBias: [2, 15, 4] },
    { name: "SOLAR FURNACE", wash: [255, 120, 40, 0.12], wash2: [255, 80, 60, 0.07], planetBias: [3, 6, 16] },
    { name: "CRYSTAL BELT", wash: [140, 220, 255, 0.12], wash2: [200, 140, 255, 0.07], planetBias: [10, 4, 2] },
    { name: "TIME FRACTURE", wash: [90, 255, 180, 0.1], wash2: [200, 255, 120, 0.05], planetBias: [14, 9, 7] },
    { name: "MONOCHROME VOID", wash: [255, 255, 255, 0.08], wash2: [140, 140, 150, 0.05], planetBias: [5, 17, 2] },
    { name: "EMERALD EXPANSE", wash: [40, 255, 120, 0.12], wash2: [140, 255, 80, 0.06], planetBias: [9, 4, 13] },
    { name: "CRIMSON STORM", wash: [220, 40, 50, 0.14], wash2: [120, 10, 20, 0.08], planetBias: [3, 8, 16] },
    { name: "SAPPHIRE ABYSS", wash: [20, 50, 180, 0.16], wash2: [10, 20, 80, 0.08], planetBias: [7, 4, 11] },
    { name: "VIOLET REALM", wash: [140, 40, 220, 0.14], wash2: [80, 20, 140, 0.08], planetBias: [10, 17, 8] },
    { name: "GOLDEN HOUR", wash: [255, 180, 60, 0.12], wash2: [220, 120, 40, 0.07], planetBias: [1, 6, 16] },
    { name: "SOLAR CORONA", wash: [255, 220, 80, 0.12], wash2: [255, 140, 40, 0.07], planetBias: [1, 3, 6] },
    { name: "HYPERVIVID", wash: [255, 40, 180, 0.12], wash2: [40, 220, 255, 0.1], planetBias: [13, 8, 10] },
    { name: "NEON BAZAAR", wash: [255, 40, 160, 0.12], wash2: [40, 255, 200, 0.08], planetBias: [11, 13, 8] },
    { name: "ALIEN JUNGLE", wash: [40, 160, 60, 0.14], wash2: [20, 80, 40, 0.08], planetBias: [9, 12, 4] },
    { name: "ACID SWAMP", wash: [160, 220, 20, 0.12], wash2: [80, 120, 10, 0.07], planetBias: [9, 14, 16] },
    { name: "CORAL SHALLOWS", wash: [255, 120, 140, 0.12], wash2: [80, 180, 200, 0.08], planetBias: [0, 8, 13] },
    { name: "BONE DESERT", wash: [220, 190, 140, 0.1], wash2: [140, 100, 60, 0.07], planetBias: [6, 5, 16] },
    { name: "PULSAR FIELD", wash: [180, 210, 255, 0.14], wash2: [80, 90, 200, 0.08], planetBias: [7, 15, 10] },
    { name: "BLACKOUT ZONE", wash: [60, 70, 110, 0.1], wash2: [30, 34, 60, 0.06], planetBias: [5, 17, 7] },
    { name: "AURORA CROWN", wash: [60, 255, 190, 0.14], wash2: [140, 120, 255, 0.08], planetBias: [15, 9, 10] },
    { name: "RUST BELT", wash: [200, 110, 50, 0.12], wash2: [140, 70, 40, 0.07], planetBias: [16, 6, 5] },
    { name: "GHOST NEBULA", wash: [200, 210, 235, 0.09], wash2: [150, 160, 200, 0.06], planetBias: [2, 17, 5] },
    { name: "PRISM STORM", wash: [255, 220, 0, 0.12], wash2: [0, 190, 255, 0.1], planetBias: [13, 10, 1] },
    { name: "EVENT HORIZON", wash: [140, 40, 255, 0.16], wash2: [40, 0, 80, 0.1], planetBias: [17, 14, 12] },
];
export const ENV_GATES = 20;
export const XP_STEPS = [
    60, 100, 150, 200, 260, 320, 390, 460, 540, 620, 710, 800, 900, 1000, 1110, 1220, 1340, 1460, 1590, 1720, 1860, 2000,
    2150, 2300, 2460, 2620, 2790, 2960, 3140,
];
export const MAX_LEVEL = XP_STEPS.length + 1;
export const TITLES = [
    [1, "CADET"],
    [5, "PILOT"],
    [10, "VOIDFARER"],
    [15, "ACE"],
    [18, "COMET CHASER"],
    [25, "EVENT HORIZON"],
    [30, "ACORNAUT"],
];
export const PAL_LEVELS = {
    none: 1,
    bee: 2,
    buddy: 4,
    voidjelly: 6,
    cometsprite: 7,
    meteorcore: 9,
    pocketmoon: 11,
    ufo: 12,
    starpup: 13,
    tinbot: 14,
    wisp: 15,
    nutsack: 16,
};
export const SUIT_REVEAL = {
    robo: 12,
    alien: 16,
    ghost: 20,
    bigbooty: 24,
};
export const TRACK = [
    { lvl: 2, kind: "pal", id: "bee" },
    { lvl: 3, kind: "mod", name: "Start Shield", desc: "Arm any run with a shield from the hangar." },
    { lvl: 4, kind: "pal", id: "buddy" },
    { lvl: 5, kind: "mode", name: "Deep Space Flight", desc: "Space itself shifts every 10s. Survive the chain." },
    { lvl: 5, kind: "title", name: "PILOT" },
    { lvl: 6, kind: "pal", id: "voidjelly" },
    { lvl: 7, kind: "pal", id: "cometsprite" },
    { lvl: 8, kind: "mod", name: "Shield Battery", desc: "Carry three shield charges at once." },
    { lvl: 9, kind: "pal", id: "meteorcore" },
    { lvl: 10, kind: "mode", name: "Lost in Space", desc: "The sky rotates, drifts and mirrors." },
    { lvl: 10, kind: "title", name: "VOIDFARER" },
    { lvl: 11, kind: "pal", id: "pocketmoon" },
    { lvl: 12, kind: "pal", id: "ufo" },
    { lvl: 12, kind: "suit", id: "robo", name: "Robo Suit", desc: "Full chrome, scanning visor. Now in the shop." },
    { lvl: 13, kind: "pal", id: "starpup" },
    { lvl: 14, kind: "pal", id: "tinbot" },
    { lvl: 15, kind: "pal", id: "wisp" },
    { lvl: 15, kind: "title", name: "ACE" },
    { lvl: 16, kind: "pal", id: "nutsack" },
    { lvl: 16, kind: "suit", id: "alien", name: "Alien Suit", desc: "The visitor look, antennae included. In the shop." },
    { lvl: 18, kind: "title", name: "COMET CHASER" },
    { lvl: 20, kind: "suit", id: "ghost", name: "Ghost Suit", desc: "Spectral tail, cyan-burning eyes. In the shop." },
    { lvl: 24, kind: "suit", id: "bigbooty", name: "Big Booty Suit", desc: "Maximum silhouette. Real jiggle. In the shop." },
    { lvl: 25, kind: "title", name: "EVENT HORIZON" },
    { lvl: 30, kind: "title", name: "ACORNAUT" },
];
export const MOD_SHIELD_COST = 25;
export const MOD_BATTERY_COST = 500;
export const BETA_UNLOCK_GATES = true;
export function xpCumulative(level) {
    let acc = 0;
    for (let i = 0; i < level - 1 && i < XP_STEPS.length; i++)
        acc += XP_STEPS[i];
    return acc;
}
export function levelForXp(xp) {
    let l = 1;
    let acc = 0;
    for (const s of XP_STEPS) {
        if (xp < acc + s)
            break;
        acc += s;
        l++;
    }
    return l;
}
export function titleForLevel(level) {
    let t = "CADET";
    for (const [lv, name] of TITLES)
        if (level >= lv)
            t = name;
    return t;
}
export function runXp(score, acorns, deep, lost) {
    let xp = score + acorns;
    if (score >= 25)
        xp += 10;
    if (score >= 50)
        xp += 15;
    if (score >= 75)
        xp += 20;
    if (score >= 100)
        xp += 25;
    return Math.round(xp * (lost ? 1.5 : deep ? 1.25 : 1));
}
