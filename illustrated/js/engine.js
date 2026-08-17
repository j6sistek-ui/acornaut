import { loadArt } from "./art.js";
import { sfx, unlockAudio } from "./audio.js";
import { HELMETS, MOD_BATTERY_COST, MOD_SHIELD_COST, SUITS, TRAILS } from "./catalog.js";
import { drawHud, drawWorld } from "./draw.js";
import { batteryUnlocked, loadSave, palUnlocked, startShieldUnlocked, suitRevealed, writeSave, } from "./save.js";
import { dive, flap, initStars, makeWorld, pausePlay, resetRun, resumePlay, snapshot, updateWorld, } from "./sim.js";
export async function createEngine(canvas) {
    const raw = canvas.getContext("2d");
    if (!raw)
        throw new Error("no 2d");
    const ctx = raw;
    const save = loadSave();
    const world = makeWorld(360, 640);
    let art = null;
    let raf = 0;
    let last = performance.now();
    let running = false;
    const listeners = new Set();
    const notify = () => listeners.forEach((fn) => fn());
    let shopTab = "helmets";
    const engine = {
        canvas,
        world,
        save,
        art: null,
        shopTab,
        start() {
            if (running)
                return;
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(loop);
        },
        stop() {
            running = false;
            cancelAnimationFrame(raf);
        },
        resize,
        fly(mode) {
            unlockAudio();
            const needTut = !save.tutorialDone && mode === "fly";
            resetRun(world, save, mode, needTut);
            notify();
        },
        open(s) {
            world.screen = s;
            if (s === "title")
                world.tut = null;
            notify();
        },
        buyHelmet: (id) => transactHelmet(id),
        buySuit: (id) => transactSuit(id),
        buyTrail: (id) => transactTrail(id),
        equipPal: (id) => transactPal(id),
        toggleMod,
        dismissDead() {
            world.screen = "title";
            world.lastRun = null;
            writeSave(save);
            notify();
        },
        replayTutorial() {
            save.tutorialDone = false;
            writeSave(save);
            resetRun(world, save, "fly", true);
            notify();
        },
        pause() {
            pausePlay(world);
            notify();
        },
        resume() {
            resumePlay(world);
            last = performance.now();
            notify();
        },
        setShopTab(t) {
            shopTab = t;
            engine.shopTab = t;
            notify();
        },
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        snap: () => snapshot(world),
    };
    function transactHelmet(id) {
        const item = HELMETS.find((h) => h.id === id);
        if (!item)
            return "missing";
        if (save.unlocked.includes(id)) {
            save.equipped = id;
            writeSave(save);
            notify();
            return "equip";
        }
        if (save.acorns < item.cost)
            return "poor";
        save.acorns -= item.cost;
        save.unlocked.push(id);
        save.equipped = id;
        writeSave(save);
        notify();
        return "buy";
    }
    function transactSuit(id) {
        const item = SUITS.find((h) => h.id === id);
        if (!item)
            return "missing";
        if (!suitRevealed(save, id))
            return "locked";
        if (save.unlockedSuits.includes(id)) {
            save.equippedSuit = id;
            writeSave(save);
            notify();
            return "equip";
        }
        if (save.acorns < item.cost)
            return "poor";
        save.acorns -= item.cost;
        save.unlockedSuits.push(id);
        save.equippedSuit = id;
        writeSave(save);
        notify();
        return "buy";
    }
    function transactTrail(id) {
        const item = TRAILS.find((h) => h.id === id);
        if (!item)
            return "missing";
        if (save.unlockedTrails.includes(id)) {
            save.equippedTrail = id;
            writeSave(save);
            notify();
            return "equip";
        }
        if (save.acorns < item.cost)
            return "poor";
        save.acorns -= item.cost;
        save.unlockedTrails.push(id);
        save.equippedTrail = id;
        writeSave(save);
        notify();
        return "buy";
    }
    function transactPal(id) {
        if (!palUnlocked(save, id))
            return "locked";
        if (!save.unlockedPals.includes(id))
            save.unlockedPals.push(id);
        save.equippedPal = id;
        writeSave(save);
        notify();
        return "equip";
    }
    function toggleMod(which) {
        if (which === "shield") {
            if (!startShieldUnlocked(save))
                return "locked";
            if (save.startShield) {
                save.startShield = false;
                writeSave(save);
                notify();
                return "off";
            }
            if (save.acorns < MOD_SHIELD_COST)
                return "poor";
            save.acorns -= MOD_SHIELD_COST;
            save.startShield = true;
            writeSave(save);
            notify();
            return "on";
        }
        if (!batteryUnlocked(save))
            return "locked";
        if (save.battery)
            return "owned";
        if (save.acorns < MOD_BATTERY_COST)
            return "poor";
        save.acorns -= MOD_BATTERY_COST;
        save.battery = true;
        writeSave(save);
        notify();
        return "buy";
    }
    function resize() {
        const parent = canvas.parentElement;
        if (!parent)
            return;
        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const W = Math.min(rect.width, 480);
        const H = rect.height;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        world.W = W;
        world.H = H;
        if (!world.stars.length)
            initStars(world);
    }
    let swipe = null;
    function pos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (world.W / rect.width),
            y: (e.clientY - rect.top) * (world.H / rect.height),
        };
    }
    canvas.addEventListener("pointerdown", (e) => {
        if (world.screen !== "play")
            return;
        e.preventDefault();
        const p = pos(e);
        swipe = { y0: p.y, t0: performance.now(), fired: false };
        const ev = flap(world, save);
        if (ev === "flap")
            sfx.flap();
        if (world.tut?.stage === "pal" && world.tut.hold) {
            world.tut.hold = false;
            world.tut.t = 0;
        }
        notify();
    }, { passive: false });
    canvas.addEventListener("pointermove", (e) => {
        if (!swipe || swipe.fired || world.screen !== "play")
            return;
        const p = pos(e);
        if (performance.now() - swipe.t0 > 320) {
            swipe = null;
            return;
        }
        if (p.y - swipe.y0 >= 34) {
            swipe.fired = true;
            const ev = dive(world);
            if (ev === "dive")
                sfx.dive();
            notify();
        }
    }, { passive: true });
    const end = () => {
        swipe = null;
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    window.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            if (world.screen === "play")
                engine.pause();
            else if (world.screen === "pause")
                engine.resume();
            else if (world.screen !== "dead")
                engine.open("title");
            return;
        }
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            if (world.screen === "title")
                engine.fly("fly");
            else if (world.screen === "pause")
                engine.resume();
            else if (world.screen === "play") {
                const ev = flap(world, save);
                if (ev === "flap")
                    sfx.flap();
            }
            else if (world.screen === "dead" && world.deadTimer > 0.55)
                engine.dismissDead();
            notify();
        }
        if (e.code === "ArrowDown" && world.screen === "play") {
            const ev = dive(world);
            if (ev === "dive")
                sfx.dive();
            notify();
        }
    });
    function loop(now) {
        const dt = Math.min(0.033, (now - last) / 1000);
        last = now;
        const ev = updateWorld(world, save, dt);
        if (ev === "acorn")
            sfx.acorn();
        if (ev === "gold")
            sfx.gold();
        if (ev === "bounce")
            sfx.bounce();
        if (ev === "die") {
            writeSave(save);
            sfx.die();
            notify();
        }
        if (ev === "shield") {
            sfx.shield();
            notify();
        }
        ctx.clearRect(0, 0, world.W, world.H);
        if (art) {
            if (world.screen === "play" || world.screen === "dead" || world.screen === "pause") {
                drawWorld(ctx, world, save, art);
                if (world.screen !== "pause")
                    drawHud(ctx, world);
            }
            else if (art.sky) {
                ctx.drawImage(art.sky, 0, 0, world.W, world.H);
                ctx.fillStyle = "rgba(7,11,22,0.35)";
                ctx.fillRect(0, 0, world.W, world.H);
            }
            else {
                ctx.fillStyle = "#070b16";
                ctx.fillRect(0, 0, world.W, world.H);
            }
        }
        else {
            ctx.fillStyle = "#070b16";
            ctx.fillRect(0, 0, world.W, world.H);
        }
        if (running)
            raf = requestAnimationFrame(loop);
    }
    resize();
    initStars(world);
    art = await loadArt();
    engine.art = art;
    notify();
    return engine;
}
export { deepUnlocked, lostUnlocked } from "./save.js";
