export function artBase() {
    const raw = (typeof window !== "undefined" && window.__ACORNAUT_ART__) || "/art";
    return raw.replace(/\/$/, "");
}
function loadImg(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(src));
        img.src = src;
    });
}
function measureBox(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx)
        return { x: 0, y: 0, w, h };
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] < 16)
                continue;
            if (x < minX)
                minX = x;
            if (y < minY)
                minY = y;
            if (x > maxX)
                maxX = x;
            if (y > maxY)
                maxY = y;
        }
    }
    if (maxX < minX)
        return { x: 0, y: 0, w, h };
    const pad = 2;
    return {
        x: Math.max(0, minX - pad),
        y: Math.max(0, minY - pad),
        w: Math.min(w, maxX - minX + 1 + pad * 2),
        h: Math.min(h, maxY - minY + 1 + pad * 2),
    };
}
function asSprite(img) {
    const s = img;
    s.box = measureBox(img);
    return s;
}
async function many(prefix, n, start = 1) {
    const out = [];
    for (let i = 0; i < n; i++)
        out.push(asSprite(await loadImg(`${prefix}${start + i}.png`)));
    return out;
}
export function drawSprite(ctx, spr, x, y, size) {
    if (!spr)
        return;
    const box = spr.box ?? { x: 0, y: 0, w: spr.width, h: spr.height };
    const scale = size / Math.max(box.w, box.h);
    const dw = box.w * scale;
    const dh = box.h * scale;
    ctx.drawImage(spr, box.x, box.y, box.w, box.h, x - dw / 2, y - dh / 2, dw, dh);
}
export async function loadArt() {
    const base = artBase();
    const palIds = [
        "bee",
        "buddy",
        "ufo",
        "nutsack",
        "meteorcore",
        "cometsprite",
        "pocketmoon",
        "voidjelly",
        "starpup",
        "tinbot",
        "wisp",
    ];
    const [squirrelIdle, squirrelFlap, acorn, golden, shield, planets, debris, sky, hero, ...palImgs] = await Promise.all([
        many(`${base}/squirrel/idle-`, 4),
        many(`${base}/squirrel/flap-`, 4),
        many(`${base}/acorn/`, 4),
        many(`${base}/golden/`, 4),
        many(`${base}/shield/`, 4),
        many(`${base}/planets/`, 18, 0),
        many(`${base}/debris/`, 9, 0),
        loadImg(`${base}/sky.jpg`).catch(() => null),
        loadImg(`${base}/hero.jpg`).catch(() => null),
        ...palIds.map((id) => loadImg(`${base}/pals/${id}.png`)),
    ]);
    const pals = {};
    palIds.forEach((id, i) => {
        pals[id] = asSprite(palImgs[i]);
    });
    return {
        ready: true,
        squirrelIdle,
        squirrelFlap,
        acorn,
        golden,
        shield,
        planets,
        debris,
        pals,
        sky: sky,
        hero: hero,
    };
}
