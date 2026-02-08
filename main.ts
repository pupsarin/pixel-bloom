const animationPattern = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const STAGGER = 200;
const HOLD = 400;
const FADE = 400;
const VISIBLE = HOLD + FADE;
const CYCLE = animationPattern.length * STAGGER;

const supportsP3 = CSS.supports("color", "color(display-p3 0 0 0)");
const fgP3 = [0.2, 0.92, 0.85] as const;
const fgSRGB = [64, 224, 208] as const;

function easeIn(t: number): number {
  return t * t;
}

function lerpColor(t: number): string {
  if (supportsP3) {
    const r = fgP3[0] * (1 - t);
    const g = fgP3[1] * (1 - t);
    const b = fgP3[2] * (1 - t);
    return `color(display-p3 ${r} ${g} ${b})`;
  }
  const r = Math.round(fgSRGB[0] * (1 - t));
  const g = Math.round(fgSRGB[1] * (1 - t));
  const b = Math.round(fgSRGB[2] * (1 - t));
  return `rgb(${r},${g},${b})`;
}

const cells = document.querySelectorAll<HTMLElement>(".cell-cube");

let start: number | null = null;

function frame(now: number) {
  if (start === null) start = now;
  const cycleTime = (now - start) % CYCLE;

  for (const cell of Array.from(cells)) {
    cell.style.opacity = "0";
    cell.style.filter = "";
  }

  for (let i = 0; i < animationPattern.length; i++) {
    const cellIndex = animationPattern[i]!;
    let elapsed = cycleTime - i * STAGGER;
    if (elapsed < 0) elapsed += CYCLE;

    if (elapsed < HOLD) {
      const holdT = elapsed / HOLD;
      const brightness = 2.5 - 1.5 * holdT;
      const cell = cells[cellIndex]!;
      cell.style.opacity = "1";
      cell.style.background = lerpColor(0);
      cell.style.filter = `brightness(${brightness})`;
    } else if (elapsed < VISIBLE) {
      const t = easeIn((elapsed - HOLD) / FADE);
      const cell = cells[cellIndex]!;
      cell.style.opacity = "1";
      cell.style.background = lerpColor(t);
      cell.style.filter = `brightness(${1 - t * 0.5})`;
    }
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
