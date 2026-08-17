import { ENVS, ENV_GATES, PHYS, TRAILS, levelForXp, runXp } from "./catalog.js";
export function makeWorld(W, H) {
    return {
        W,
        H,
        screen: "title",
        flight: "fly",
        ready: false,
        score: 0,
        runAcorns: 0,
        squirrel: { y: H * 0.45, vy: 0, rot: 0 },
        planets: [],
        pickups: [],
        particles: [],
        stars: [],
        speed: PHYS.baseSpeed,
        distance: 0,
        lastSpawnX: 0,
        lastGapY: H * 0.45,
        powerLeft: 0,
        invulnLeft: 0,
        flapBoost: 0,
        hitCooldown: 0,
        bounceUp: false,
        shieldCharges: 0,
        absorbGrace: 0,
        shieldFreeze: 0,
        shieldSlow: 0,
        startShieldArmed: false,
        deadTimer: 0,
        time: 0,
        envOrder: ENVS.map((_, i) => i),
        envA: 0,
        envB: 0,
        envBlend: 1,
        envMsgT: 0,
        driftPhase: 0,
        driftFactor: 1,
        tiltPhase: 0,
        warpT: 0,
        warpLeft: 0,
        warpTilt: 0,
        warpMirror: true,
        recoveryMsg: "",
        palPos: { x: 0, y: 0, dart: 0 },
        shake: 0,
        pausedFrom: null,
        tut: null,
        lastRun: null,
    };
}
export function initStars(w) {
    w.stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * w.W,
        y: Math.random() * w.H,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.7 + 0.2,
        tw: Math.random() * Math.PI * 2,
    }));
}
function shuffleEnv(w) {
    const mid = ENVS.map((_, i) => i).slice(1, -1);
    for (let i = mid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mid[i], mid[j]] = [mid[j], mid[i]];
    }
    w.envOrder = [0, ...mid, ENVS.length - 1];
}
export function envIndexFor(w, score) {
    return w.envOrder[Math.min(Math.floor(score / ENV_GATES), ENVS.length - 1)];
}
function palId(save, w) {
    if (w.tut && (w.tut.stage === "pal" || w.tut.stage === "palDemo"))
        return "buddy";
    return save.equippedPal;
}
function gravOf(save, w) {
    const id = palId(save, w);
    return PHYS.gravity * (id === "pocketmoon" ? 0.85 : id === "nutsack" ? 1.2 : 1);
}
function flapOf(save, w) {
    const id = palId(save, w);
    return PHYS.flap * (id === "nutsack" ? 0.71 : 1);
}
function gapSpacing(w) {
    return 230 + Math.min(50, w.distance * 0.004);
}
function overdriveT(score) {
    if (score < PHYS.overdriveGate)
        return 0;
    return Math.min(1, (score - PHYS.overdriveGate) / PHYS.overdriveSpan);
}
function difficulty(w) {
    const t = Math.min(1, w.distance / 12000);
    const od = overdriveT(w.score);
    const max = PHYS.maxSpeed * (1 + 0.1 * od);
    const gmin = PHYS.gapMin * (1 - 0.2 * od);
    return {
        speed: PHYS.baseSpeed + (max - PHYS.baseSpeed) * t,
        gap: PHYS.gapBase - (PHYS.gapBase - gmin) * t,
    };
}
function pickKind(w) {
    const env = ENVS[envIndexFor(w, w.score)];
    if (Math.random() < 0.55)
        return env.planetBias[Math.floor(Math.random() * env.planetBias.length)] % 18;
    return Math.floor(Math.random() * 18);
}
function spawnPair(w, save, x) {
    const d = difficulty(w);
    let gap = d.gap;
    const margin = 72;
    let gapY = margin + gap / 2 + Math.random() * (w.H - 2 * margin - gap);
    const dx = Math.max(80, x - w.lastSpawnX);
    const speed = Math.max(d.speed, 1);
    const t = dx / (speed * (w.flight === "lost" ? 1.4 : 1));
    const climb = Math.abs(flapOf(save, w)) * 0.55 * t;
    const diveAmt = PHYS.dive * 0.55 * t;
    const reserve = w.flight === "lost" ? 30 : 8;
    const lo = w.lastGapY - diveAmt + reserve;
    const hi = w.lastGapY + climb - reserve;
    gapY = Math.max(margin + gap / 2, Math.min(w.H - margin - gap / 2, Math.max(lo, Math.min(hi, gapY))));
    const r = PHYS.planetR;
    const topY = gapY - gap / 2 - r;
    const botY = gapY + gap / 2 + r;
    const blockers = [];
    const topEdge = topY - r;
    const botEdge = botY + r;
    const step = 30;
    const makeBlock = (y, n) => {
        blockers.push({
            y,
            r: 19 + Math.random() * 7,
            kind: pickKind(w),
            xOff: ((n % 2) * 2 - 1) * (2 + Math.random() * 5),
            debris: Math.floor(Math.random() * 9),
        });
    };
    {
        let y = topEdge - 26;
        let n = 0;
        while (y > 20 && n < 12) {
            makeBlock(y, n);
            y -= step;
            n++;
        }
    }
    {
        let y = botEdge + 26;
        let n = 0;
        while (y < w.H - 20 && n < 12) {
            makeBlock(y, n);
            y += step;
            n++;
        }
    }
    const wisp = palId(save, w) === "wisp" || w.flight === "lost";
    w.planets.push({
        x,
        gapY,
        gap,
        r,
        topKind: pickKind(w),
        botKind: pickKind(w),
        scored: false,
        drift: Math.random() * Math.PI * 2,
        driftAmp: wisp ? (palId(save, w) === "wisp" ? 26 : 12) : 0,
        blockers,
    });
    const pal = palId(save, w);
    const noPick = pal === "bee" || (w.tut && w.tut.stage !== "palDemo" && w.tut.stage !== "free" && w.tut.stage !== "ready");
    const specialMul = pal === "meteorcore" ? 2 : 1;
    const noShield = pal === "nutsack" || pal === "tinbot";
    const noHoles = pal === "tinbot";
    if (!noPick) {
        if (w.tut || Math.random() < 0.58) {
            const off = w.tut?.stage === "palDemo" ? (Math.random() < 0.5 ? -1 : 1) * gap * 0.32 : (Math.random() - 0.5) * gap * 0.35;
            w.pickups.push({ x: x + 8, y: gapY + off, got: false, bob: Math.random() * 6, kind: "acorn" });
        }
        if (!w.tut && Math.random() < 0.05 * specialMul) {
            w.pickups.push({ x: x + 36, y: gapY + (Math.random() - 0.5) * gap * 0.22, got: false, bob: Math.random() * 6, kind: "slow" });
        }
        if (!w.tut && Math.random() < 0.035 * specialMul) {
            w.pickups.push({ x: x + 52, y: gapY + (Math.random() - 0.5) * gap * 0.2, got: false, bob: Math.random() * 6, kind: "gold" });
        }
        if (!w.tut && !noShield && Math.random() < 0.03 * specialMul) {
            w.pickups.push({ x: x + 20, y: gapY + (Math.random() - 0.5) * gap * 0.18, got: false, bob: Math.random() * 6, kind: "shield" });
        }
        if (!w.tut && !noHoles && w.flight !== "lost" && Math.random() < 0.018) {
            w.pickups.push({ x: x + 64, y: gapY, got: false, bob: Math.random() * 6, kind: "hole" });
        }
        if (!w.tut && !noHoles && w.flight === "lost" && Math.random() < 0.05) {
            w.pickups.push({ x: x + 64, y: gapY, got: false, bob: Math.random() * 6, kind: "worm" });
        }
    }
    w.lastSpawnX = x;
    w.lastGapY = gapY;
}
export function resetRun(w, save, flight, tutorial) {
    w.flight = flight;
    w.score = 0;
    w.runAcorns = 0;
    w.squirrel = { y: w.H * 0.45, vy: 0, rot: 0 };
    w.planets = [];
    w.pickups = [];
    w.particles = [];
    w.speed = PHYS.baseSpeed;
    w.distance = 0;
    w.lastSpawnX = w.W * 0.55;
    w.lastGapY = w.H * 0.45;
    w.powerLeft = 0;
    w.invulnLeft = 0;
    w.flapBoost = 0;
    w.hitCooldown = 0;
    w.bounceUp = false;
    w.deadTimer = 0;
    w.ready = true;
    w.screen = "play";
    w.pausedFrom = null;
    w.shake = 0;
    const canShield = save.equippedPal !== "nutsack" && save.equippedPal !== "tinbot";
    w.startShieldArmed = !!(save.startShield && canShield);
    w.shieldCharges = w.startShieldArmed ? 1 : 0;
    w.absorbGrace = 0;
    w.shieldFreeze = 0;
    w.shieldSlow = 0;
    w.warpT = 0;
    w.warpLeft = 0;
    w.warpTilt = 0;
    w.warpMirror = true;
    w.driftPhase = 0;
    w.driftFactor = 1;
    w.tiltPhase = 0;
    w.recoveryMsg = "";
    w.envA = 0;
    w.envB = 0;
    w.envBlend = 1;
    w.envMsgT = 2.4;
    w.palPos = { x: w.W * PHYS.squirrelX - 42, y: w.H * 0.45 - 20, dart: 0 };
    if (flight === "lost") {
        w.warpMirror = false;
        w.warpTilt = lostTiltAt(0);
    }
    shuffleEnv(w);
    for (let i = 0; i < 3; i++)
        spawnPair(w, save, w.W + 90 + i * gapSpacing(w));
    w.tut = tutorial
        ? { stage: "intro", hold: false, t: 0, gates: 0, nudge: "", retries: 0, springs: 0 }
        : null;
}
function spark(w, x, y, colors, n = 12, kind = "spark") {
    for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 50 + Math.random() * 140;
        w.particles.push({
            x,
            y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            life: 0.3 + Math.random() * 0.28,
            max: 0.58,
            r: 2 + Math.random() * 3,
            color: colors[i % colors.length],
            kind,
        });
    }
}
export function spawnTrail(w, save) {
    const sx = w.W * PHYS.squirrelX - 10;
    const sy = w.squirrel.y + 6;
    const trail = save.equippedTrail;
    const colors = (TRAILS.find((t) => t.id === trail) ?? TRAILS[0]).colors;
    if (trail === "ion") {
        for (let i = 0; i < 8; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 6,
                vx: -150 - Math.random() * 160,
                vy: (Math.random() - 0.5) * 30,
                life: 0.22 + Math.random() * 0.15,
                max: 0.37,
                r: 1.4 + Math.random() * 1.6,
                color: colors[0],
                kind: "ion",
            });
        }
    }
    else if (trail === "bubble") {
        for (let i = 0; i < 7; i++) {
            w.particles.push({
                x: sx,
                y: sy,
                vx: -50 - Math.random() * 70,
                vy: -20 - Math.random() * 50,
                life: 0.5 + Math.random() * 0.35,
                max: 0.85,
                r: 2 + Math.random() * 3.5,
                color: colors[0],
                kind: "bubble",
            });
        }
    }
    else if (trail === "bloom") {
        for (let i = 0; i < 6; i++) {
            w.particles.push({
                x: sx,
                y: sy,
                vx: -55 - Math.random() * 70,
                vy: (Math.random() - 0.5) * 70,
                life: 0.4 + Math.random() * 0.3,
                max: 0.7,
                r: 1.5 + Math.random() * 2,
                color: colors[i % colors.length],
                kind: "bloom",
            });
        }
    }
    else if (trail === "comet") {
        for (let i = 0; i < 12; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 7,
                vx: -160 - Math.random() * 240,
                vy: (Math.random() - 0.5) * 50,
                life: 0.5 + Math.random() * 0.4,
                max: 0.9,
                r: 2.4 + Math.random() * 3.2,
                color: colors[1],
                kind: "comet",
            });
        }
        for (let i = 0; i < 4; i++) {
            w.particles.push({
                x: sx + (Math.random() - 0.5) * 6,
                y: sy + (Math.random() - 0.5) * 6,
                vx: -60 - Math.random() * 80,
                vy: (Math.random() - 0.5) * 30,
                life: 0.2 + Math.random() * 0.12,
                max: 0.32,
                r: 3 + Math.random() * 2,
                color: "#fff8d0",
                kind: "cometcore",
            });
        }
    }
    else if (trail === "prism") {
        for (let i = 0; i < 9; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 8,
                vx: -90 - Math.random() * 150,
                vy: (Math.random() - 0.5) * 80,
                life: 0.35 + Math.random() * 0.25,
                max: 0.6,
                r: 2 + Math.random() * 2.4,
                color: colors[i % colors.length],
                hue: Math.random() * 360,
                spin: (Math.random() - 0.5) * 12,
                kind: "prism",
            });
        }
    }
    else if (trail === "plasma") {
        for (let i = 0; i < 5; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 8,
                vx: -140 - Math.random() * 180,
                vy: (Math.random() - 0.5) * 40,
                life: 0.16 + Math.random() * 0.12,
                max: 0.28,
                r: 1.6 + Math.random() * 1.4,
                color: colors[1],
                seed: Math.random() * 10,
                kind: "plasma",
            });
        }
        w.particles.push({
            x: sx,
            y: sy,
            vx: -60,
            vy: 0,
            life: 0.14,
            max: 0.14,
            r: 3.4,
            color: "#fff",
            kind: "plasmacore",
        });
    }
    else if (trail === "galaxy") {
        for (let i = 0; i < 12; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 10,
                vx: -40 - Math.random() * 90,
                vy: (Math.random() - 0.5) * 40,
                life: 0.5 + Math.random() * 0.4,
                max: 0.9,
                r: 1.2 + Math.random() * 1.6,
                color: colors[i % colors.length],
                kind: "galaxy",
            });
        }
    }
    else if (trail === "aurora") {
        for (let i = 0; i < 8; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 10,
                vx: -70 - Math.random() * 80,
                vy: (Math.random() - 0.5) * 50,
                life: 0.45 + Math.random() * 0.3,
                max: 0.75,
                r: 2 + Math.random() * 2.4,
                color: colors[i % colors.length],
                kind: "aurora",
            });
        }
    }
    else if (trail === "frost") {
        for (let i = 0; i < 8; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 8,
                vx: -80 - Math.random() * 90,
                vy: (Math.random() - 0.5) * 40,
                life: 0.4 + Math.random() * 0.3,
                max: 0.7,
                r: 1.6 + Math.random() * 2,
                color: colors[i % colors.length],
                kind: "frost",
            });
        }
    }
    else if (trail === "voidsmoke") {
        for (let i = 0; i < 7; i++) {
            w.particles.push({
                x: sx,
                y: sy,
                vx: -40 - Math.random() * 50,
                vy: (Math.random() - 0.5) * 30,
                life: 0.6 + Math.random() * 0.4,
                max: 1,
                r: 4 + Math.random() * 5,
                color: colors[i % colors.length],
                kind: "voidsmoke",
            });
        }
    }
    else if (trail === "supernova") {
        for (let i = 0; i < 14; i++) {
            w.particles.push({
                x: sx,
                y: sy + (Math.random() - 0.5) * 8,
                vx: -120 - Math.random() * 180,
                vy: (Math.random() - 0.5) * 70,
                life: 0.35 + Math.random() * 0.3,
                max: 0.65,
                r: 2 + Math.random() * 3,
                color: colors[i % colors.length],
                kind: "supernova",
            });
        }
    }
    else {
        for (let i = 0; i < 9; i++) {
            w.particles.push({
                x: sx,
                y: sy,
                vx: -80 - Math.random() * 120,
                vy: (Math.random() - 0.5) * 90,
                life: 0.22 + Math.random() * 0.18,
                max: 0.42,
                r: 2 + Math.random() * 3,
                color: colors[i % colors.length],
                kind: "flame",
            });
        }
    }
}
export function flap(w, save) {
    if (w.screen === "pause")
        return "none";
    if (w.screen !== "play")
        return "none";
    if (w.tut?.hold && w.tut.stage === "swipe") {
        w.tut.nudge = "drag downward — not a tap";
        return "none";
    }
    if (w.tut?.hold && (w.tut.stage === "tap" || w.tut.stage === "tap2")) {
        w.tut.hold = false;
        w.tut.t = 0;
        w.tut.stage = w.tut.stage === "tap" ? "tap2" : "glide";
    }
    if (w.ready)
        w.ready = false;
    if (w.tut && (w.tut.stage === "glide" || w.tut.stage === "bounce"))
        return "none";
    w.squirrel.vy = flapOf(save, w);
    w.flapBoost = 0.22;
    spawnTrail(w, save);
    return "flap";
}
export function dive(w) {
    if (w.screen !== "play" || w.ready)
        return "none";
    if (w.tut?.hold && w.tut.stage === "swipe") {
        w.tut.hold = false;
        w.tut.stage = "gates";
        w.tut.t = 0;
        w.tut.gates = 0;
        w.bounceUp = false;
        w.squirrel.vy = PHYS.dive;
        w.squirrel.rot = 0.5;
        return "dive";
    }
    if (w.tut && (w.tut.stage === "glide" || w.tut.stage === "bounce" || w.tut.stage === "intro" || w.tut.stage === "tap" || w.tut.stage === "tap2"))
        return "none";
    if (w.bounceUp && w.hitCooldown > 0) {
        w.bounceUp = false;
        w.squirrel.vy = PHYS.bounceCancel;
        w.squirrel.rot = 0.35;
        spark(w, w.W * PHYS.squirrelX, w.squirrel.y - 14, ["#e8dcc8", "#fff"], 6, "poof");
        return "dive";
    }
    w.squirrel.vy = PHYS.dive;
    w.squirrel.rot = 0.5;
    w.bounceUp = false;
    spark(w, w.W * PHYS.squirrelX, w.squirrel.y - 16, ["#c8d0e0", "#fff"], 5, "poof");
    return "dive";
}
function liveGapY(p) {
    return p.gapY + Math.sin(p.drift) * p.driftAmp;
}
function circleHit(x1, y1, r1, x2, y2, r2) {
    return Math.hypot(x1 - x2, y1 - y2) < r1 + r2;
}
function bounceOff(w, save, px, py) {
    const sx = w.W * PHYS.squirrelX;
    const sy = w.squirrel.y;
    let dx = sx - px;
    let dy = sy - py;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    const jelly = palId(save, w) === "voidjelly" ? 0.55 : 1;
    const mag = Math.min(560, 170 + Math.abs(w.squirrel.vy) * 0.5) * jelly;
    w.squirrel.vy = dy * mag + (dy >= 0 ? 90 : -160);
    w.bounceUp = w.squirrel.vy < 0;
    w.squirrel.y += dy * 14;
    w.squirrel.rot = dy >= 0 ? 0.85 : -0.55;
    w.hitCooldown = 0.55;
    w.shake = 0.18;
    spark(w, sx, sy, ["#e8dcc8", "#ffd080", "#fff"]);
}
function pushOut(w, px, py, pr, sr) {
    const sx = w.W * PHYS.squirrelX;
    const rr = pr + sr;
    const dx = sx - px;
    if (Math.abs(dx) >= rr)
        return;
    const dyNeed = Math.sqrt(rr * rr - dx * dx);
    const above = w.squirrel.y <= py;
    w.squirrel.y = above ? py - dyNeed : py + dyNeed;
    if (above ? w.squirrel.vy > 0 : w.squirrel.vy < 0)
        w.squirrel.vy = 0;
}
function safeY(w) {
    const sx = w.W * PHYS.squirrelX;
    let best = null;
    for (const p of w.planets) {
        if (p.x + p.r < sx - 20)
            continue;
        if (!best || p.x < best.x)
            best = p;
    }
    return best ? liveGapY(best) : w.H * 0.45;
}
function clearDebrisNear(w, x, y, r1, x2, y2, r2) {
    for (const p of w.planets) {
        p.blockers = p.blockers.filter((b) => {
            const ax = p.x + (b.xOff || 0);
            return Math.hypot(ax - x, b.y - y) > r1 && Math.hypot(ax - x2, b.y - y2) > r2;
        });
    }
}
function absorb(w, bx, by) {
    const sx = w.W * PHYS.squirrelX;
    const cy = safeY(w);
    w.shieldCharges -= 1;
    if (bx !== undefined && by !== undefined) {
        spark(w, bx, by, ["#7ad8ff", "#5dff9e", "#fff"], 16, "shield");
        clearDebrisNear(w, bx, by, 110, sx, cy, 150);
    }
    w.squirrel.y = cy;
    w.squirrel.vy = 0;
    w.squirrel.rot = 0;
    w.hitCooldown = 0;
    w.bounceUp = false;
    w.shieldFreeze = 0.7;
    w.shieldSlow = 3;
    w.absorbGrace = 2.2;
    w.recoveryMsg = "SHIELD ABSORBED!";
    w.shake = 0.22;
    spark(w, sx, cy, ["#7ad8ff", "#fff", "#4ad8ff"], 16, "shield");
}
function lostTiltAt(p) {
    return ((40 * Math.PI) / 180) * (0.6 * Math.sin(p * 0.35) + 0.4 * Math.sin(p * 0.13 + 1.3));
}
function pickWarpVariant(w) {
    const variant = Math.floor(Math.random() * 5);
    w.warpMirror = variant < 3;
    const TILT = (25 * Math.PI) / 180;
    w.warpTilt = variant === 0 ? 0 : variant === 1 || variant === 3 ? TILT : -TILT;
}
function beginWarp(w, save, worm) {
    const sx = w.W * PHYS.squirrelX;
    const cy = safeY(w);
    clearDebrisNear(w, sx, cy, 150, sx, cy, 150);
    w.squirrel.y = cy;
    w.squirrel.vy = 0;
    w.squirrel.rot = 0;
    w.hitCooldown = 0;
    pickWarpVariant(w);
    w.warpT = 1;
    w.warpLeft = w.flight === "lost" ? 0 : w.flight === "deep" ? 10 : 15;
    w.shieldFreeze = w.flight === "deep" ? 0.2 : 0.4;
    w.absorbGrace = w.flight === "deep" ? 0.9 : 1.6;
    w.recoveryMsg = worm ? "WORMHOLE" : "BLACK HOLE";
    if (palId(save, w) === "ufo")
        w.powerLeft = Math.max(w.powerLeft, 2.4);
    w.shake = 0.28;
    spark(w, sx, cy, ["#b45cff", "#fff", "#4ad8ff"], 18, "warp");
}
function exitWarp(w) {
    if (w.flight === "deep") {
        pickWarpVariant(w);
        w.warpT = 1;
        w.warpLeft = 10;
        return;
    }
    w.warpTilt = 0;
    w.warpMirror = true;
    w.shieldFreeze = 0.7;
    w.shieldSlow = 3;
    w.recoveryMsg = "ORIENTATION RESTORED";
    spark(w, w.W * PHYS.squirrelX, w.squirrel.y, ["#b45cff", "#fff"], 14, "warp");
}
function die(w, save) {
    if (w.tut && w.tut.stage !== "free") {
        absorb(w);
        w.shieldCharges = Math.max(w.shieldCharges, 1);
        return "shield";
    }
    w.screen = "dead";
    w.deadTimer = 0;
    w.tut = null;
    w.shake = 0.35;
    const fromXp = save.xp || 0;
    const fromLv = levelForXp(fromXp);
    const xp = runXp(w.score, w.runAcorns, w.flight === "deep", w.flight === "lost");
    w.lastRun = {
        score: w.score,
        acorns: w.runAcorns,
        xp,
        fromXp,
        fromLv,
        toLv: levelForXp(fromXp + xp),
        best: w.flight === "deep"
            ? w.score >= save.deepBest
            : w.flight === "lost"
                ? w.score >= save.lostBest
                : w.score >= save.highScore,
    };
    save.xp = fromXp + xp;
    save.acorns += w.runAcorns;
    if (w.flight === "deep")
        save.deepBest = Math.max(save.deepBest, w.score);
    else if (w.flight === "lost")
        save.lostBest = Math.max(save.lostBest, w.score);
    else
        save.highScore = Math.max(save.highScore, w.score);
    if (w.startShieldArmed)
        save.startShield = false;
    spark(w, w.W * PHYS.squirrelX, w.squirrel.y, ["#e8dcc8", "#ff6a28"], 20);
    return "die";
}
export function bankDeathLevels(_w, _save) {
    /* levels are now stamped in die() */
}
export function pausePlay(w) {
    if (w.screen !== "play" || w.tut)
        return;
    w.pausedFrom = "play";
    w.screen = "pause";
}
export function resumePlay(w) {
    if (w.screen !== "pause")
        return;
    w.screen = "play";
    w.pausedFrom = null;
}
export function updateWorld(w, save, dt) {
    w.time += dt;
    if (w.shake > 0)
        w.shake = Math.max(0, w.shake - dt * 2.4);
    for (const s of w.stars)
        s.tw += dt * 2;
    if (w.screen === "pause")
        return null;
    if (w.screen === "dead") {
        w.deadTimer += dt;
        w.squirrel.vy += PHYS.gravity * dt * 0.55;
        w.squirrel.y += w.squirrel.vy * dt;
        w.squirrel.rot = Math.min(1.2, w.squirrel.rot + dt * 2);
    }
    for (const p of w.particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.spin)
            p.hue = (p.hue || 0) + p.spin * dt * 40;
    }
    w.particles = w.particles.filter((p) => p.life > 0);
    if (w.screen !== "play")
        return null;
    if (w.tut) {
        w.tut.t += dt;
        if (w.tut.stage === "intro" && w.tut.t > 0.55) {
            w.tut.stage = "tap";
            w.tut.hold = true;
            w.tut.t = 0;
        }
        if (w.tut.stage === "tap2" && !w.tut.hold && w.tut.t > 0.45) {
            w.tut.stage = "glide";
            w.tut.t = 0;
        }
        if (w.tut.stage === "glide" && w.tut.t > 0.55) {
            w.tut.stage = "bounce";
            w.squirrel.vy = -640;
            w.bounceUp = true;
        }
        if (w.tut.stage === "bounce") {
            if (w.squirrel.vy > -60 || w.tut.t > 1.1) {
                if (w.squirrel.y > w.H * 0.55 && w.tut.springs < 3) {
                    w.tut.springs += 1;
                    w.squirrel.vy = -640;
                    w.tut.t = 0;
                }
                else {
                    w.tut.stage = "swipe";
                    w.tut.hold = true;
                    w.tut.t = 0;
                }
            }
        }
        if (w.tut.stage === "gates" && w.tut.gates >= 3) {
            w.tut.stage = "pal";
            w.tut.hold = true;
            w.tut.t = 0;
        }
        if (w.tut.stage === "pal" && !w.tut.hold && w.tut.t > 0.2) {
            w.tut.stage = "palDemo";
            w.tut.t = 0;
        }
        if (w.tut.stage === "palDemo" && w.tut.t > 4.2) {
            w.tut.stage = "ready";
            w.tut.t = 0;
        }
        if (w.tut.stage === "ready" && w.tut.t > 1.6) {
            w.tut.stage = "free";
            save.tutorialDone = true;
        }
    }
    const frozen = (w.tut?.hold ?? false) || w.shieldFreeze > 0;
    if (w.shieldFreeze > 0)
        w.shieldFreeze = Math.max(0, w.shieldFreeze - dt);
    if (frozen)
        return null;
    let slow = w.powerLeft > 0 ? PHYS.slowFactor : 1;
    if (w.shieldSlow > 0) {
        w.shieldSlow = Math.max(0, w.shieldSlow - dt);
        slow *= 0.55;
        if (w.shieldSlow <= 0)
            w.recoveryMsg = "";
    }
    if (w.flight === "lost") {
        w.driftPhase += dt * 0.7;
        w.driftFactor = 1 + Math.sin(w.driftPhase) * 0.4;
        w.tiltPhase += dt * 0.45;
        w.warpTilt = lostTiltAt(w.tiltPhase);
    }
    if (w.flight === "deep") {
        w.warpLeft -= dt;
        if (w.warpLeft <= 0 && w.warpT <= 0)
            beginWarp(w, save, false);
    }
    else if (w.warpLeft > 0) {
        w.warpLeft -= dt;
        if (w.warpLeft <= 0)
            exitWarp(w);
    }
    if (w.warpT > 0)
        w.warpT = Math.max(0, w.warpT - dt * (w.flight === "deep" ? 2 : 1));
    const simDt = dt * slow;
    if (w.powerLeft > 0)
        w.powerLeft = Math.max(0, w.powerLeft - dt);
    if (w.invulnLeft > 0)
        w.invulnLeft = Math.max(0, w.invulnLeft - dt);
    if (w.absorbGrace > 0)
        w.absorbGrace = Math.max(0, w.absorbGrace - simDt);
    if (w.flapBoost > 0)
        w.flapBoost = Math.max(0, w.flapBoost - dt);
    if (w.hitCooldown > 0)
        w.hitCooldown = Math.max(0, w.hitCooldown - simDt);
    if (w.envMsgT > 0)
        w.envMsgT = Math.max(0, w.envMsgT - dt);
    const d = difficulty(w);
    w.speed = d.speed;
    w.squirrel.vy += gravOf(save, w) * simDt;
    w.squirrel.y += w.squirrel.vy * simDt;
    w.squirrel.rot = Math.max(-0.55, Math.min(0.95, w.squirrel.vy / 700));
    const dir = w.warpMirror ? 1 : -1;
    const move = w.speed * w.driftFactor * dir * simDt;
    w.distance += Math.abs(move);
    for (const p of w.planets) {
        p.x -= move;
        p.drift += simDt * (palId(save, w) === "wisp" ? 1.7 : 1.05);
    }
    for (const a of w.pickups) {
        a.x -= move;
        a.bob += dt * 4;
    }
    w.lastSpawnX -= move;
    while (w.lastSpawnX < w.W + 90)
        spawnPair(w, save, w.lastSpawnX + gapSpacing(w));
    w.planets = w.planets.filter((p) => p.x > -90);
    w.pickups = w.pickups.filter((a) => a.x > -50 && !a.got);
    const targetEnv = envIndexFor(w, w.score);
    if (targetEnv !== w.envB) {
        w.envA = w.envB;
        w.envB = targetEnv;
        w.envBlend = 0;
        w.envMsgT = 2.2;
    }
    if (w.envBlend < 1)
        w.envBlend = Math.min(1, w.envBlend + dt * 0.55);
    const sx = w.W * PHYS.squirrelX;
    const sy = w.squirrel.y;
    for (const p of w.planets) {
        if (!p.scored && p.x + p.r < sx - 12) {
            p.scored = true;
            w.score += 1;
            if (w.tut?.stage === "gates")
                w.tut.gates += 1;
        }
    }
    const pal = palId(save, w);
    const tx = sx - 42;
    const ty = sy - 22 + Math.sin(w.time * 2.6) * 7;
    const k = Math.min(1, dt * (w.palPos.dart > 0 ? 14 : 5));
    w.palPos.x += (tx - w.palPos.x) * k;
    w.palPos.y += (ty - w.palPos.y) * k;
    if (w.palPos.dart > 0)
        w.palPos.dart = Math.max(0, w.palPos.dart - dt);
    if (pal === "buddy" || (w.tut && (w.tut.stage === "palDemo" || w.tut.stage === "ready"))) {
        for (const a of w.pickups) {
            if (a.got || a.kind !== "acorn")
                continue;
            const dy = sy - a.y;
            const dx = sx - a.x;
            if (Math.hypot(dx, dy) < PHYS.magnetR) {
                a.x += dx * dt * 4.2;
                a.y += dy * dt * 4.2;
                a.pulled = true;
            }
        }
    }
    if (sy < -36 || sy > w.H + 36) {
        if (w.tut && w.tut.stage !== "free") {
            w.squirrel.y = Math.max(24, Math.min(w.H - 24, w.squirrel.y));
            w.squirrel.vy *= -0.4;
        }
        else if (w.shieldCharges > 0) {
            absorb(w);
            return "shield";
        }
        else
            return die(w, save);
    }
    const sr = PHYS.squirrelR;
    if (w.absorbGrace <= 0 && w.invulnLeft <= 0) {
        for (const p of w.planets) {
            for (const b of p.blockers) {
                const bx = p.x + b.xOff;
                const by = b.y + Math.sin(p.drift) * p.driftAmp;
                if (circleHit(sx, sy, sr, bx, by, b.r * 0.92)) {
                    if (w.shieldCharges > 0) {
                        absorb(w, bx, by);
                        return "shield";
                    }
                    if (w.tut && w.tut.stage !== "free") {
                        absorb(w, bx, by);
                        w.shieldCharges = Math.max(w.shieldCharges, 1);
                        return "shield";
                    }
                    return die(w, save);
                }
            }
        }
    }
    if (w.invulnLeft <= 0) {
        for (const p of w.planets) {
            const gy = liveGapY(p);
            const topY = gy - p.gap / 2 - p.r;
            const botY = gy + p.gap / 2 + p.r;
            for (const py of [topY, botY]) {
                if (!circleHit(sx, sy, sr, p.x, py, p.r * 0.92))
                    continue;
                if (w.hitCooldown <= 0) {
                    if (w.shieldCharges > 0 && w.tut?.stage === "free") {
                        /* planets bounce even with a shield — shields save debris / fall */
                    }
                    bounceOff(w, save, p.x, py);
                    return "bounce";
                }
                pushOut(w, p.x, py, p.r * 0.92, sr);
            }
        }
    }
    let snd = null;
    for (const a of w.pickups) {
        if (a.got)
            continue;
        const ay = a.y + Math.sin(a.bob) * 4;
        if (Math.hypot(sx - a.x, sy - ay) > 28)
            continue;
        a.got = true;
        if (a.kind === "acorn") {
            w.runAcorns += pal === "nutsack" ? 2 : 1;
            if (a.pulled) {
                w.palPos.x = a.x;
                w.palPos.y = a.y;
                w.palPos.dart = 0.35;
            }
            spark(w, a.x, ay, ["#ffd060", "#fff"], 10, "gold");
            snd = "acorn";
        }
        else if (a.kind === "slow") {
            w.powerLeft = PHYS.powerDuration * (pal === "cometsprite" ? 2 : 1);
            spark(w, a.x, ay, ["#6ef0ff", "#fff"], 12, "cyan");
            snd = "gold";
        }
        else if (a.kind === "gold") {
            w.invulnLeft = PHYS.goldDuration * (pal === "starpup" ? 2 : 1);
            spark(w, a.x, ay, ["#ffe080", "#ffd060"], 14, "gold");
            snd = "gold";
        }
        else if (a.kind === "shield") {
            if (pal !== "nutsack" && pal !== "tinbot") {
                const cap = save.battery ? 3 : 1;
                w.shieldCharges = Math.min(cap, w.shieldCharges + 1);
            }
            spark(w, a.x, ay, ["#7ad8ff", "#5dff9e"], 12, "shield");
            snd = "shield";
        }
        else if (a.kind === "hole" || a.kind === "worm") {
            beginWarp(w, save, a.kind === "worm");
            snd = "shield";
        }
    }
    return snd;
}
export function snapshot(w) {
    return {
        screen: w.screen,
        score: w.score,
        runAcorns: w.runAcorns,
        envName: ENVS[w.envB]?.name ?? "DEEP SPACE",
        flight: w.flight,
        powerLeft: w.powerLeft,
        invulnLeft: w.invulnLeft,
        shieldCharges: w.shieldCharges,
        recoveryMsg: w.recoveryMsg,
        tutStage: w.tut?.stage ?? null,
        tutHold: !!w.tut?.hold,
        tutNudge: w.tut?.nudge ?? "",
        dead: w.lastRun,
        squirrel: { y: w.squirrel.y, rot: w.squirrel.rot, vy: w.squirrel.vy },
    };
}
