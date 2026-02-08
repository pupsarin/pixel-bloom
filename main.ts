type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

interface BloomConfig {
    label: string;
    pattern: number[][];
    srgb: [number, number, number];
    p3: [number, number, number];
    stagger: number;
    hold: number;
    fade: number;
    offset: number;
    wrap: boolean;
    easing: Easing;
}

const configs: BloomConfig[] = [
    { label: "Loading", pattern: [[1], [2], [5], [8], [7], [6], [3], [0]], srgb: [0, 255, 255], p3: [0, 0.92, 0.92], stagger: 180, hold: 350, fade: 350, offset: 0, wrap: true, easing: "linear" },
    { label: "Computing", pattern: [[0, 3, 6], [1, 4, 7], [2, 5, 8]], srgb: [255, 0, 255], p3: [0.92, 0, 0.92], stagger: 350, hold: 400, fade: 400, offset: 500, wrap: true, easing: "ease-in-out" },
    { label: "Downloading", pattern: [[0, 1, 2], [3, 4, 5], [6, 7, 8]], srgb: [57, 255, 20], p3: [0.25, 0.95, 0.1], stagger: 380, hold: 380, fade: 380, offset: 1000, wrap: true, easing: "linear" },
    { label: "Searching", pattern: [[4], [1, 3, 5, 7], [0, 2, 6, 8]], srgb: [68, 102, 255], p3: [0.28, 0.42, 0.98], stagger: 190, hold: 420, fade: 360, offset: 1500, wrap: false, easing: "ease-out" },
    { label: "Processing", pattern: [[0, 1, 2, 5, 4, 3, 6, 7, 8]], srgb: [255, 102, 0], p3: [0.95, 0.42, 0], stagger: 170, hold: 360, fade: 420, offset: 2000, wrap: false, easing: "ease-in" },
    { label: "Compiling", pattern: [[0], [3], [6], [7], [8], [5], [2], [1]], srgb: [255, 224, 0], p3: [0.95, 0.88, 0], stagger: 210, hold: 340, fade: 380, offset: 2500, wrap: true, easing: "linear" },
    { label: "Rendering", pattern: [[0, 2, 6, 8], [1, 3, 5, 7], [4]], srgb: [191, 0, 255], p3: [0.72, 0, 0.95], stagger: 185, hold: 400, fade: 350, offset: 3000, wrap: false, easing: "ease-in" },
    { label: "Syncing", pattern: [[0, 8], [2, 6], [4], [1, 3, 5, 7]], srgb: [255, 0, 51], p3: [0.95, 0, 0.22], stagger: 175, hold: 380, fade: 400, offset: 3500, wrap: true, easing: "ease-in-out" },
    { label: "Uploading", pattern: [[6, 7, 8], [3, 4, 5], [0, 1, 2]], srgb: [0, 255, 127], p3: [0, 0.95, 0.52], stagger: 370, hold: 360, fade: 360, offset: 4000, wrap: true, easing: "linear" },
    { label: "Decrypting", pattern: [[0, 2, 4, 6, 8], [1, 3, 5, 7]], srgb: [255, 107, 107], p3: [0.95, 0.44, 0.44], stagger: 165, hold: 420, fade: 380, offset: 4500, wrap: true, easing: "ease-out" },
    { label: "Analyzing", pattern: [[2, 5, 8], [1, 4, 7], [0, 3, 6]], srgb: [207, 159, 255], p3: [0.78, 0.62, 0.95], stagger: 370, hold: 370, fade: 400, offset: 5000, wrap: true, easing: "ease-in-out" },
    { label: "Indexing", pattern: [[4], [0, 8], [2, 6], [1, 7], [3, 5]], srgb: [255, 215, 0], p3: [0.95, 0.84, 0], stagger: 180, hold: 390, fade: 370, offset: 5500, wrap: false, easing: "ease-out" },
];

const supportsP3 = CSS.supports("color", "color(display-p3 0 0 0)");

function ease(t: number, easing: Easing): number {
    switch (easing) {
        case "linear":      return t;
        case "ease-in":     return t * t;
        case "ease-out":    return 1 - (1 - t) * (1 - t);
        case "ease-in-out": return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    }
}

function lerpColor(t: number, srgb: [number, number, number], p3: [number, number, number]): string {
    if (supportsP3) {
        const r = p3[0] * (1 - t);
        const g = p3[1] * (1 - t);
        const b = p3[2] * (1 - t);
        return `color(display-p3 ${r} ${g} ${b})`;
    }
    const r = Math.round(srgb[0] * (1 - t));
    const g = Math.round(srgb[1] * (1 - t));
    const b = Math.round(srgb[2] * (1 - t));
    return `rgb(${r},${g},${b})`;
}

const gallery = document.getElementById("gallery")!;
gallery.className = "gallery";

interface ButtonState {
    cells: HTMLElement[];
    config: BloomConfig;
}

const buttons: ButtonState[] = [];

for (const config of configs) {
    const btn = document.createElement("button");
    btn.className = "bloom-btn";

    const grid = document.createElement("div");
    grid.className = "bloom-grid";

    const cells: HTMLElement[] = [];
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "bloom-cell";
        grid.appendChild(cell);
        cells.push(cell);
    }

    const label = document.createElement("span");
    label.className = "bloom-label";
    label.textContent = config.label;

    btn.appendChild(grid);
    btn.appendChild(label);
    gallery.appendChild(btn);
    buttons.push({ cells, config });
}

// Single rAF loop for all buttons
let start: number | null = null;

function frame(now: number) {
    if (start === null) start = now;

    for (const { cells, config } of buttons) {
        const { pattern, srgb, p3, stagger, hold, fade, offset, wrap, easing } = config;
        const visible = hold + fade;
        const cycle = pattern.length * stagger + (wrap ? 0 : visible);
        const cycleTime = (now - start + offset) % cycle;

        for (const cell of cells) {
            cell.style.opacity = "0";
            cell.style.filter = "";
        }

        for (let i = 0; i < pattern.length; i++) {
            const group = pattern[i]!;
            let elapsed = cycleTime - i * stagger;
            if (elapsed < 0) elapsed += cycle;

            if (elapsed < hold) {
                const holdT = elapsed / hold;
                const brightness = 2.5 - 1.5 * holdT;
                for (const cellIndex of group) {
                    const cell = cells[cellIndex]!;
                    cell.style.opacity = "1";
                    cell.style.background = lerpColor(0, srgb, p3);
                    cell.style.filter = `brightness(${brightness})`;
                }
            } else if (elapsed < visible) {
                const t = ease((elapsed - hold) / fade, easing);
                for (const cellIndex of group) {
                    const cell = cells[cellIndex]!;
                    cell.style.opacity = "1";
                    cell.style.background = lerpColor(t, srgb, p3);
                    cell.style.filter = `brightness(${1 - t * 0.5})`;
                }
            }
        }
    }

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
