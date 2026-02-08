const animationPattern = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const STAGGER = 200;
const HOLD = 400;
const FADE = 400;
const VISIBLE = HOLD + FADE;
const CYCLE = animationPattern.length * STAGGER;

const foreground = [64, 224, 208] as const; // #40e0d0
const background = [0, 0, 0] as const; // #000000

function easeIn(t: number): number {
  return t * t;
}

function lerpColor(t: number): string {
  const r = Math.round(foreground[0] + (background[0] - foreground[0]) * t);
  const g = Math.round(foreground[1] + (background[1] - foreground[1]) * t);
  const b = Math.round(foreground[2] + (background[2] - foreground[2]) * t);
  return `rgb(${r},${g},${b})`;
}

const cells = document.querySelectorAll<HTMLElement>(".cell-cube");

let start: number | null = null;

function frame(now: number) {
  if (start === null) start = now;
  const cycleTime = (now - start) % CYCLE;

  for (const cell of Array.from(cells)) {
    cell.style.opacity = "0";
  }

  for (let i = 0; i < animationPattern.length; i++) {
    const cellIndex = animationPattern[i]!;
    let elapsed = cycleTime - i * STAGGER;
    if (elapsed < 0) elapsed += CYCLE;

    if (elapsed < HOLD) {
      const cell = cells[cellIndex];
      cell.style.opacity = "1";
      cell.style.background = lerpColor(0);
    } else if (elapsed < VISIBLE) {
      const t = easeIn((elapsed - HOLD) / FADE);
      const cell = cells[cellIndex];
      cell.style.opacity = "1";
      cell.style.background = lerpColor(t);
    }
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
