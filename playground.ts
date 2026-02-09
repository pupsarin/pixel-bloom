import {
    bloom,
    animations,
    colors,
    type BloomHandle,
    type BloomConfig,
    type Easing,
} from "./bloom.ts";

const root = document.getElementById("playground")!;

// ── Header ───────────────────────────────────────────────────────

const header = document.createElement("div");
header.className = "playground-header";
const backLink = document.createElement("a");
backLink.className = "back-link";
backLink.href = "/";
backLink.textContent = "\u2190 Gallery";
header.appendChild(backLink);
root.appendChild(header);

// ── Body (controls | preview) ────────────────────────────────────

const body = document.createElement("div");
body.className = "playground-body";
root.appendChild(body);

const controlsEl = document.createElement("div");
controlsEl.className = "controls";
body.appendChild(controlsEl);

const previewEl = document.createElement("div");
previewEl.className = "preview";
const previewContainer = document.createElement("div");
previewContainer.className = "preview-container";
previewEl.appendChild(previewContainer);
body.appendChild(previewEl);

// ── Helpers ──────────────────────────────────────────────────────

function createGroup(labelText: string): { group: HTMLElement; input: HTMLElement } {
    const group = document.createElement("div");
    group.className = "control-group";
    const label = document.createElement("label");
    label.textContent = labelText;
    group.appendChild(label);
    return { group, input: group };
}

function addSelect(labelText: string, options: string[]): HTMLSelectElement {
    const { group } = createGroup(labelText);
    const select = document.createElement("select");
    for (const opt of options) {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        select.appendChild(o);
    }
    group.appendChild(select);
    controlsEl.appendChild(group);
    return select;
}

function addNumber(
    labelText: string,
    value: number,
    min = 0,
    max = 10000,
    step = 10,
): HTMLInputElement {
    const { group } = createGroup(labelText);
    const input = document.createElement("input");
    input.type = "number";
    input.value = String(value);
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    group.appendChild(input);
    controlsEl.appendChild(group);
    return input;
}

function addTextarea(labelText: string, value: string): HTMLTextAreaElement {
    const { group } = createGroup(labelText);
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.spellcheck = false;
    group.appendChild(textarea);
    controlsEl.appendChild(group);
    return textarea;
}

function addSeparator() {
    const hr = document.createElement("hr");
    hr.className = "control-separator";
    controlsEl.appendChild(hr);
}

// ── Animation controls ───────────────────────────────────────────

const animationNames = Object.keys(animations) as (keyof typeof animations)[];
const presetSelect = addSelect("Animation Preset", ["(custom)", ...animationNames]);

const patternInput = addTextarea("Pattern (JSON)", "");
const patternError = document.createElement("div");
patternError.className = "pattern-error";
controlsEl.appendChild(patternError);

const staggerInput = addNumber("Stagger (ms)", 180, 0, 10000, 10);
const holdInput = addNumber("Hold (ms)", 350, 0, 10000, 10);
const fadeInput = addNumber("Fade (ms)", 350, 0, 10000, 10);
const offsetInput = addNumber("Offset (ms)", 0, 0, 10000, 10);

// Wrap checkbox
const wrapGroup = document.createElement("div");
wrapGroup.className = "control-row";
const wrapCheck = document.createElement("input");
wrapCheck.type = "checkbox";
wrapCheck.id = "wrap-check";
const wrapLabel = document.createElement("label");
wrapLabel.htmlFor = "wrap-check";
wrapLabel.textContent = "Wrap";
wrapGroup.appendChild(wrapCheck);
wrapGroup.appendChild(wrapLabel);
controlsEl.appendChild(wrapGroup);

const easingOptions: Easing[] = ["linear", "ease-in", "ease-out", "ease-in-out"];
const easingSelect = addSelect("Easing", easingOptions);

addSeparator();

// ── Color controls ───────────────────────────────────────────────

const colorNames = Object.keys(colors) as (keyof typeof colors)[];
const colorPresetSelect = addSelect("Color Preset", ["(custom)", ...colorNames]);

const colorRow = document.createElement("div");
colorRow.className = "color-row";

const colorInputs = document.createElement("div");
colorInputs.className = "color-inputs";

function makeColorInput(label: string, value: number): HTMLInputElement {
    const wrapper = document.createElement("div");
    wrapper.className = "control-group";
    const lbl = document.createElement("label");
    lbl.textContent = label;
    wrapper.appendChild(lbl);
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "255";
    input.step = "1";
    input.value = String(value);
    wrapper.appendChild(input);
    colorInputs.appendChild(wrapper);
    return input;
}

const rInput = makeColorInput("R", 0);
const gInput = makeColorInput("G", 255);
const bInput = makeColorInput("B", 255);

const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.className = "color-picker";
colorPicker.value = "#00ffff";

colorRow.appendChild(colorInputs);
colorRow.appendChild(colorPicker);

const colorGroup = document.createElement("div");
colorGroup.className = "control-group";
colorGroup.appendChild(colorRow);
controlsEl.appendChild(colorGroup);

// ── State ────────────────────────────────────────────────────────

let currentHandle: BloomHandle | null = null;

function srgbToP3(srgb: [number, number, number]): [number, number, number] {
    return [(srgb[0] / 255) * 0.95, (srgb[1] / 255) * 0.95, (srgb[2] / 255) * 0.95];
}

function parsePattern(text: string): number[][] | null {
    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) return null;
        for (const group of parsed) {
            if (!Array.isArray(group)) return null;
            for (const v of group) {
                if (typeof v !== "number" || v < 0 || v > 8) return null;
            }
        }
        return parsed;
    } catch {
        return null;
    }
}

function buildConfig(): BloomConfig | null {
    const pattern = parsePattern(patternInput.value);
    if (!pattern || pattern.length === 0) {
        patternError.textContent = "Invalid pattern JSON";
        return null;
    }
    patternError.textContent = "";

    const srgb: [number, number, number] = [
        Math.min(255, Math.max(0, Number(rInput.value) || 0)),
        Math.min(255, Math.max(0, Number(gInput.value) || 0)),
        Math.min(255, Math.max(0, Number(bInput.value) || 0)),
    ];

    return {
        pattern,
        stagger: Number(staggerInput.value) || 0,
        hold: Number(holdInput.value) || 0,
        fade: Number(fadeInput.value) || 0,
        offset: Number(offsetInput.value) || 0,
        wrap: wrapCheck.checked,
        easing: easingSelect.value as Easing,
        srgb,
        p3: srgbToP3(srgb),
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function syncPickerFromInputs() {
    const r = Math.min(255, Math.max(0, Number(rInput.value) || 0));
    const g = Math.min(255, Math.max(0, Number(gInput.value) || 0));
    const b = Math.min(255, Math.max(0, Number(bInput.value) || 0));
    colorPicker.value = rgbToHex(r, g, b);
}

function liveUpdate() {
    const config = buildConfig();
    if (!config) return;
    currentHandle?.destroy();
    currentHandle = bloom(previewContainer, config);
    syncPickerFromInputs();
}

// ── Preset loaders ───────────────────────────────────────────────

function loadAnimationPreset(name: keyof typeof animations) {
    const preset = animations[name];
    patternInput.value = JSON.stringify(preset.pattern);
    staggerInput.value = String(preset.stagger);
    holdInput.value = String(preset.hold);
    fadeInput.value = String(preset.fade);
    offsetInput.value = String(preset.offset);
    wrapCheck.checked = preset.wrap;
    easingSelect.value = preset.easing;
    patternError.textContent = "";
}

function loadColorPreset(name: keyof typeof colors) {
    const preset = colors[name];
    rInput.value = String(preset.srgb[0]);
    gInput.value = String(preset.srgb[1]);
    bInput.value = String(preset.srgb[2]);
    syncPickerFromInputs();
}

// ── Event wiring ─────────────────────────────────────────────────

presetSelect.addEventListener("change", () => {
    if (presetSelect.value !== "(custom)") {
        loadAnimationPreset(presetSelect.value as keyof typeof animations);
        liveUpdate();
    }
});

colorPresetSelect.addEventListener("change", () => {
    if (colorPresetSelect.value !== "(custom)") {
        loadColorPreset(colorPresetSelect.value as keyof typeof colors);
        liveUpdate();
    }
});

// Manual edits → flip preset to (custom)
const animInputs = [patternInput, staggerInput, holdInput, fadeInput, offsetInput, easingSelect];
for (const el of animInputs) {
    el.addEventListener("input", () => {
        presetSelect.value = "(custom)";
        liveUpdate();
    });
}
wrapCheck.addEventListener("change", () => {
    presetSelect.value = "(custom)";
    liveUpdate();
});

const colorInputsArr = [rInput, gInput, bInput];
for (const el of colorInputsArr) {
    el.addEventListener("input", () => {
        colorPresetSelect.value = "(custom)";
        liveUpdate();
    });
}

colorPicker.addEventListener("input", () => {
    const [r, g, b] = hexToRgb(colorPicker.value);
    rInput.value = String(r);
    gInput.value = String(g);
    bInput.value = String(b);
    colorPresetSelect.value = "(custom)";
    liveUpdate();
});

// ── Init ─────────────────────────────────────────────────────────

presetSelect.value = "loading";
loadAnimationPreset("loading");
colorPresetSelect.value = "cyan";
loadColorPreset("cyan");
liveUpdate();
