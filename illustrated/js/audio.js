let ctx = null;
function ac() {
    if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        ctx = new C();
    }
    if (ctx.state === "suspended")
        void ctx.resume();
    return ctx;
}
export function unlockAudio() {
    try {
        ac();
    }
    catch {
        /* ignore */
    }
}
function beep(freq, dur, type, gain = 0.08, slide = 0) {
    try {
        const c = ac();
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, c.currentTime);
        if (slide)
            o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
        g.gain.setValueAtTime(gain, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        o.connect(g);
        g.connect(c.destination);
        o.start();
        o.stop(c.currentTime + dur);
    }
    catch {
        /* ignore */
    }
}
export const sfx = {
    flap: () => beep(420, 0.08, "square", 0.05, 180),
    dive: () => beep(220, 0.12, "sawtooth", 0.05, -80),
    acorn: () => beep(880, 0.1, "triangle", 0.06, 200),
    gold: () => {
        beep(660, 0.16, "triangle", 0.07, 240);
        beep(990, 0.2, "sine", 0.04, 120);
    },
    bounce: () => beep(160, 0.14, "square", 0.06, -40),
    die: () => beep(140, 0.4, "sawtooth", 0.07, -90),
    shield: () => beep(520, 0.22, "sine", 0.07, 80),
    ui: () => beep(640, 0.06, "triangle", 0.04, 40),
};
