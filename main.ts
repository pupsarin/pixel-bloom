import { bloom, type AnimationName, type ColorName } from "./bloom.ts";

const gallery = document.getElementById("gallery")!;
gallery.className = "gallery";

const sharedStart = performance.now();

const entries: { label: string; animation: AnimationName; color: ColorName }[] = [
    { label: "Loading", animation: "loading", color: "cyan" },
    { label: "Computing", animation: "computing", color: "magenta" },
    { label: "Downloading", animation: "downloading", color: "green" },
    { label: "Searching", animation: "searching", color: "blue" },
    { label: "Processing", animation: "processing", color: "orange" },
    { label: "Compiling", animation: "compiling", color: "yellow" },
    { label: "Rendering", animation: "rendering", color: "purple" },
    { label: "Syncing", animation: "syncing", color: "red" },
    { label: "Uploading", animation: "uploading", color: "mint" },
    { label: "Decrypting", animation: "decrypting", color: "coral" },
    { label: "Analyzing", animation: "analyzing", color: "lavender" },
    { label: "Indexing", animation: "indexing", color: "gold" },
];

for (const { label, animation, color } of entries) {
    const btn = document.createElement("button");
    btn.className = "bloom-btn";

    bloom(btn, { animation, color }, sharedStart);

    const labelEl = document.createElement("span");
    labelEl.className = "bloom-label";
    labelEl.textContent = label;
    btn.appendChild(labelEl);

    gallery.appendChild(btn);
}

const footer = document.createElement("div");
footer.className = "gallery-footer";
const navLink = document.createElement("a");
navLink.className = "nav-link";
navLink.href = "./playground";
navLink.textContent = "Playground \u2192";
footer.appendChild(navLink);
gallery.appendChild(footer);
