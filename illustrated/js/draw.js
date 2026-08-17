import { ENVS, HELMETS, PHYS, SUITS, TRAILS } from "./catalog.js";
import { drawSprite } from "./art.js";
function frameOf(list, t, speed = 6) {
    if (!list.length)
        return null;
    return list[Math.floor(t * speed) % list.length];
}
function liveGapY(p) {
    return p.gapY + Math.sin(p.drift) * p.driftAmp;
}
export function drawWorld(ctx, w, save, art) {
    const { W, H } = w;
    ctx.save();
    if (w.shake > 0) {
        const mag = w.shake * 10;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    if (w.warpTilt) {
        ctx.translate(W / 2, H / 2);
        ctx.rotate(w.warpTilt * (w.warpT > 0 ? 1 - w.warpT : 1));
        ctx.translate(-W / 2, -H / 2);
    }
    if (art.sky) {
        ctx.drawImage(art.sky, 0, 0, W, H);
        ctx.fillStyle = "rgba(7,11,22,0.28)";
        ctx.fillRect(0, 0, W, H);
    }
    else {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#070b18");
        g.addColorStop(1, "#10182c");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }
    const env = ENVS[w.envB];
    const envA = ENVS[w.envA];
    const blend = w.envBlend;
    const wash = env.wash.map((v, i) => envA.wash[i] + (v - envA.wash[i]) * blend);
    ctx.fillStyle = `rgba(${wash[0]},${wash[1]},${wash[2]},${wash[3]})`;
    ctx.beginPath();
    ctx.ellipse(W * 0.68, H * 0.28, W * 0.55, H * 0.28, 0.25, 0, Math.PI * 2);
    ctx.fill();
    const wash2 = env.wash2.map((v, i) => envA.wash2[i] + (v - envA.wash2[i]) * blend);
    ctx.fillStyle = `rgba(${wash2[0]},${wash2[1]},${wash2[2]},${wash2[3]})`;
    ctx.beginPath();
    ctx.ellipse(W * 0.22, H * 0.78, W * 0.45, H * 0.22, -0.2, 0, Math.PI * 2);
    ctx.fill();
    for (const s of w.stars) {
        ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(s.tw));
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const p of w.planets) {
        const gy = liveGapY(p);
        drawPlanet(ctx, art, p.x, gy - p.gap / 2 - p.r, p.r, p.topKind);
        drawPlanet(ctx, art, p.x, gy + p.gap / 2 + p.r, p.r, p.botKind);
        for (const b of p.blockers) {
            const by = b.y + Math.sin(p.drift) * p.driftAmp;
            const bx = p.x + b.xOff;
            const img = art.debris[b.debris];
            if (img)
                drawSprite(ctx, img, bx, by, b.r * 2.05);
            else
                drawPlanet(ctx, art, bx, by, b.r, b.kind);
        }
    }
    for (const a of w.pickups) {
        if (a.got)
            continue;
        const y = a.y + Math.sin(a.bob) * 4;
        if (a.kind === "acorn")
            drawSprite(ctx, frameOf(art.acorn, w.time, 5), a.x, y, 28);
        else if (a.kind === "gold")
            drawSprite(ctx, frameOf(art.golden, w.time, 6), a.x, y, 32);
        else if (a.kind === "slow") {
            drawSprite(ctx, frameOf(art.acorn, w.time, 6), a.x, y, 28);
            ctx.strokeStyle = "rgba(110,240,255,0.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(a.x, y, 16, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "rgba(110,240,255,0.35)";
            ctx.beginPath();
            ctx.arc(a.x, y, 20 + Math.sin(w.time * 6) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        else if (a.kind === "shield")
            drawSprite(ctx, frameOf(art.shield, w.time, 5), a.x, y, 34);
        else if (a.kind === "hole" || a.kind === "worm") {
            drawVortex(ctx, a.x, y, a.kind === "worm", w.time);
        }
    }
    for (const p of w.particles)
        drawParticle(ctx, p);
    const pal = w.tut && (w.tut.stage === "pal" || w.tut.stage === "palDemo" || w.tut.stage === "ready")
        ? "buddy"
        : save.equippedPal;
    if (pal && pal !== "none" && art.pals[pal]) {
        const bob = Math.sin(w.time * 2.6) * 2;
        drawSprite(ctx, art.pals[pal], w.palPos.x, w.palPos.y + bob, 40);
    }
    drawPilot(ctx, w, save, art);
    ctx.restore();
    if (w.invulnLeft > 0) {
        ctx.strokeStyle = `rgba(255,208,96,${0.35 + 0.25 * Math.sin(w.time * 10)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(W * PHYS.squirrelX, w.squirrel.y, 30, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (w.shieldCharges > 0) {
        ctx.strokeStyle = "rgba(122,216,255,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W * PHYS.squirrelX, w.squirrel.y, 26, 0, Math.PI * 2);
        ctx.stroke();
    }
}
function drawVortex(ctx, x, y, worm, t) {
    const pulse = 12 + Math.sin(t * 6) * 3;
    const grd = ctx.createRadialGradient(x, y, 2, x, y, pulse + 14);
    grd.addColorStop(0, worm ? "#d8f6ff" : "#1a1028");
    grd.addColorStop(0.45, worm ? "#4ad8ff" : "#6a2a9a");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, pulse + 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (worm ? 3 : -2.2));
    ctx.strokeStyle = worm ? "rgba(180,240,255,0.55)" : "rgba(180,90,255,0.45)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 6 + i * 5, i, i + 2.2);
        ctx.stroke();
    }
    ctx.restore();
}
function drawParticle(ctx, p) {
    const t = Math.max(0, p.life / p.max);
    ctx.globalAlpha = t;
    const kind = p.kind || "spark";
    if (kind === "ion") {
        ctx.strokeStyle = t > 0.5 ? "#c8f4ff" : "#3ac0f0";
        ctx.lineWidth = Math.max(0.8, p.r * t);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 9, p.y);
        ctx.stroke();
    }
    else if (kind === "bubble") {
        ctx.strokeStyle = "rgba(170,220,255,0.9)";
        ctx.lineWidth = 1;
        const br = t > 0.25 ? p.r : p.r * (1 + (0.25 - t) * 6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, br, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(200,235,255,0.25)";
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "bloom") {
        ctx.fillStyle = t > 0.5 ? "#f0b8ff" : "#a45cd8";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (2 - t), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = t * 0.5;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "comet") {
        const len = 10 + p.r * 3;
        const grad = ctx.createLinearGradient(p.x, p.y, p.x + len, p.y);
        grad.addColorStop(0, "#fff8d0");
        grad.addColorStop(0.4, "#ff9d47");
        grad.addColorStop(1, "rgba(255,64,32,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, p.r * t);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + len, p.y);
        ctx.stroke();
    }
    else if (kind === "cometcore") {
        ctx.fillStyle = "#fff8d0";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "prism") {
        ctx.fillStyle = `hsl(${p.hue || 0} 90% 65%)`;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(((p.hue || 0) * Math.PI) / 180);
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
        ctx.restore();
    }
    else if (kind === "plasma") {
        ctx.strokeStyle = "#b45cff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        const seed = p.seed || 1;
        ctx.lineTo(p.x + 8, p.y + Math.sin(seed) * 6);
        ctx.lineTo(p.x + 16, p.y - Math.cos(seed) * 4);
        ctx.stroke();
    }
    else if (kind === "plasmacore") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "galaxy") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = t * 0.5;
        ctx.fillStyle = "#fff";
        ctx.fillRect(p.x - 0.6, p.y - 2.4, 1.2, 4.8);
        ctx.fillRect(p.x - 2.4, p.y - 0.6, 4.8, 1.2);
    }
    else if (kind === "aurora") {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = t * 0.55;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 2.2, p.r * 0.7, 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "frost") {
        ctx.strokeStyle = "#9fe4ff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.r);
        ctx.lineTo(p.x, p.y + p.r);
        ctx.moveTo(p.x - p.r, p.y);
        ctx.lineTo(p.x + p.r, p.y);
        ctx.stroke();
    }
    else if (kind === "voidsmoke") {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = t * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.6 - t), 0, Math.PI * 2);
        ctx.fill();
    }
    else if (kind === "supernova") {
        ctx.fillStyle = t > 0.5 ? "#fff8d0" : t > 0.25 ? "#ff9d47" : "#ff4020";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.4 - t * 0.4), 0, Math.PI * 2);
        ctx.fill();
    }
    else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function drawPlanet(ctx, art, x, y, r, kind) {
    const img = art.planets[kind % art.planets.length];
    if (img) {
        drawSprite(ctx, img, x, y, r * 2.08);
        return;
    }
    ctx.fillStyle = "#3a6aa8";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
function drawPilot(ctx, w, save, art) {
    const x = w.W * PHYS.squirrelX;
    const y = w.squirrel.y;
    const suit = SUITS.find((s) => s.id === save.equippedSuit) ?? SUITS[0];
    const helm = HELMETS.find((h) => h.id === save.equipped) ?? HELMETS[0];
    const list = w.flapBoost > 0 ? art.squirrelFlap : art.squirrelIdle;
    const img = frameOf(list, w.time, w.flapBoost > 0 ? 14 : 5);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(w.squirrel.rot);
    if (w.flapBoost > 0) {
        const trail = TRAILS.find((t) => t.id === save.equippedTrail) ?? TRAILS[0];
        const f = w.flapBoost / 0.22;
        ctx.fillStyle = trail.colors[1];
        ctx.globalAlpha = 0.85 * f;
        ctx.beginPath();
        ctx.moveTo(-16, 8);
        ctx.quadraticCurveTo(-30 - 12 * f, 12, -18, 18);
        ctx.quadraticCurveTo(-22, 12, -16, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    if (img) {
        ctx.filter = `hue-rotate(${suit.hue}deg) saturate(${suit.sat})`;
        if (suit.premium === "ghost")
            ctx.globalAlpha = 0.72 + 0.12 * Math.sin(w.time * 4);
        const booty = suit.premium === "booty";
        drawSprite(ctx, img, 0, 2, booty ? 56 : 50);
        ctx.filter = "none";
        ctx.globalAlpha = 1;
        drawHelmet(ctx, helm, w.time);
        drawPremium(ctx, suit.premium, w.time);
    }
    ctx.restore();
}
function drawHelmet(ctx, helm, t) {
    ctx.fillStyle = helm.visor;
    ctx.globalAlpha = helm.tint;
    ctx.beginPath();
    ctx.ellipse(8, -8, 13, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = helm.rim;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(8, -8, 13.5, 12.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (helm.glow) {
        ctx.strokeStyle = helm.glow;
        ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 6);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(8, -8, 15, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    if (helm.id === "solar") {
        ctx.fillStyle = "#ffb040";
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + t;
            ctx.beginPath();
            ctx.arc(8 + Math.cos(a) * 16, -8 + Math.sin(a) * 15, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    else if (helm.id === "royal") {
        ctx.fillStyle = "#d4af37";
        ctx.beginPath();
        ctx.moveTo(-2, -20);
        ctx.lineTo(2, -28);
        ctx.lineTo(6, -20);
        ctx.lineTo(10, -26);
        ctx.lineTo(14, -20);
        ctx.lineTo(18, -27);
        ctx.lineTo(20, -18);
        ctx.closePath();
        ctx.fill();
    }
    else if (helm.id === "cherry") {
        ctx.fillStyle = "#ff7ab0";
        ctx.beginPath();
        ctx.ellipse(2, -22, 5, 3.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(12, -22, 5, 3.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (helm.id === "lunar") {
        ctx.strokeStyle = "#cfe0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(18, -16, 5, 0.4, 4.2);
        ctx.stroke();
    }
    else if (helm.id === "chrono") {
        ctx.strokeStyle = "#ffe27a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(8, -8, 7, 0, Math.PI * 2);
        ctx.moveTo(8, -8);
        ctx.lineTo(8, -13);
        ctx.moveTo(8, -8);
        ctx.lineTo(12, -8);
        ctx.stroke();
    }
    else if (helm.id === "comet") {
        ctx.fillStyle = "#ff7a30";
        ctx.beginPath();
        ctx.moveTo(18, -16);
        ctx.lineTo(28, -22);
        ctx.lineTo(20, -12);
        ctx.fill();
    }
}
function drawPremium(ctx, premium, t) {
    if (premium === "robo") {
        ctx.strokeStyle = "#8fd4ff";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(0, -16, 16, 8);
        ctx.fillStyle = "#4ad8ff";
        ctx.fillRect(2, -14, 12, 2);
        ctx.beginPath();
        ctx.moveTo(8, -16);
        ctx.lineTo(8, -24);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -25, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (premium === "alien") {
        ctx.strokeStyle = "#7dff6a";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(2, -18);
        ctx.quadraticCurveTo(-6, -32, -2, -36);
        ctx.moveTo(14, -18);
        ctx.quadraticCurveTo(22, -32, 18, -36);
        ctx.stroke();
        ctx.fillStyle = "#b8ff7a";
        ctx.beginPath();
        ctx.arc(-2, -36, 2.4, 0, Math.PI * 2);
        ctx.arc(18, -36, 2.4, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (premium === "ghost") {
        ctx.fillStyle = `rgba(120,230,255,${0.35 + 0.2 * Math.sin(t * 5)})`;
        ctx.beginPath();
        ctx.ellipse(6, -10, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(13, -10, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
export function drawHud(ctx, w) {
    const { W } = w;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "800 36px Figtree, system-ui";
    ctx.fillText(String(w.score), W / 2, 46);
    if (w.envMsgT > 0) {
        ctx.globalAlpha = Math.min(1, w.envMsgT);
        ctx.fillStyle = "rgba(232,164,74,0.95)";
        ctx.font = "700 12px Figtree, system-ui";
        ctx.fillText(ENVS[w.envB].name, W / 2, 66);
        ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
    ctx.font = "700 14px Figtree, system-ui";
    ctx.fillStyle = "#ffd080";
    ctx.fillText(`${w.runAcorns}`, 36, 28);
    if (w.shieldCharges > 0) {
        for (let i = 0; i < w.shieldCharges; i++) {
            ctx.fillStyle = "rgba(122,216,255,0.9)";
            ctx.beginPath();
            ctx.arc(W - 22 - i * 16, 26, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    if (w.powerLeft > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#6ef0ff";
        ctx.font = "700 13px Figtree, system-ui";
        ctx.fillText(`SLOW  ${Math.ceil(w.powerLeft)}s`, W / 2, 88);
    }
    if (w.invulnLeft > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd060";
        ctx.font = "700 13px Figtree, system-ui";
        ctx.fillText(`GOLD  ${Math.ceil(w.invulnLeft)}s`, W / 2, w.powerLeft > 0 ? 106 : 88);
    }
    if (w.recoveryMsg) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "800 15px Figtree, system-ui";
        ctx.fillText(w.recoveryMsg, W / 2, w.H * 0.22);
    }
    if (w.ready && !w.tut) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "700 18px Figtree, system-ui";
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(w.time * 4);
        ctx.fillText("TAP TO FLY", W / 2, w.H * 0.38);
        ctx.globalAlpha = 1;
    }
    if (w.tut?.hold) {
        const title = w.tut.stage === "tap" || w.tut.stage === "tap2"
            ? w.tut.stage === "tap"
                ? "TAP — boost upward"
                : "TAP AGAIN"
            : w.tut.stage === "swipe"
                ? "SWIPE DOWN — dive"
                : w.tut.stage === "pal"
                    ? "A COMPANION APPEARS"
                    : "FLY THE GAPS";
        const body = w.tut.stage === "swipe"
            ? "Bounced too high! Drag down to make the gap."
            : w.tut.stage === "pal"
                ? "Acorn Buddy reels in nearby nuts."
                : "One tap, one lift.";
        drawPrompt(ctx, w, title, body, w.tut.stage === "swipe" ? w.H * 0.58 : w.H * 0.36);
        if (w.tut.nudge) {
            ctx.fillStyle = "#ffd080";
            ctx.font = "700 13px Figtree, system-ui";
            ctx.textAlign = "center";
            ctx.fillText(w.tut.nudge, W / 2, w.H * 0.68);
        }
    }
    else if (w.tut?.stage === "gates" || w.tut?.stage === "palDemo") {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(243,239,228,0.8)";
        ctx.font = "700 13px Figtree, system-ui";
        ctx.fillText(w.tut.stage === "gates" ? "FLY THE GAPS  ·  GRAB THE ACORNS" : "WATCH THE MAGNET", W / 2, 86);
    }
    else if (w.tut?.stage === "ready") {
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "800 20px Figtree, system-ui";
        ctx.fillText("YOU'RE READY, PILOT", W / 2, w.H * 0.3);
    }
}
function drawPrompt(ctx, w, title, body, cy) {
    const bw = Math.min(320, w.W - 40);
    const bh = 92;
    ctx.fillStyle = "rgba(12,18,36,0.82)";
    ctx.strokeStyle = "rgba(232,164,74,0.45)";
    ctx.lineWidth = 1.5;
    round(ctx, w.W / 2 - bw / 2, cy - bh / 2, bw, bh, 16);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "800 16px Figtree, system-ui";
    ctx.fillText(title, w.W / 2, cy - 8);
    ctx.fillStyle = "rgba(243,239,228,0.72)";
    ctx.font = "600 12px Figtree, system-ui";
    ctx.fillText(body, w.W / 2, cy + 16);
}
function round(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
