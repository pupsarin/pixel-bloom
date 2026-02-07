const tPattern = [0, 1, 2, 4, 7, 1];
const animationPattern = [0, 1, 2, 4, 6, 3];
const dotPattern = [0, 1, 2, 3];
const intervalValue = 200;
const timeoutValue = intervalValue * 3;

const animate = (className: string, pattern: number[]) => {
    const cells = document.querySelectorAll(className);
    let index = 0;
    const closure = (i: number) => {
        cells[i].classList.remove("cell-animation");
    };
    cells[pattern[0]].classList.add("cell-animation");
    setTimeout(() => closure(pattern[0]), timeoutValue);

    const interval = setInterval(() => {
        const internalIndex = index;
        if (internalIndex < pattern.length) {
            cells[pattern[internalIndex]].classList.add("cell-animation");
        } else {
            cells[pattern[0]].classList.add("cell-animation");
            setTimeout(() => closure(pattern[0]), timeoutValue);
            index = 0;
        }
        setTimeout(() => {
            if (internalIndex < pattern.length) {
                closure(pattern[internalIndex]);
            }
        }, timeoutValue);
        index++;
    }, intervalValue);
};
animate(".cell-cube", animationPattern);
const timeEl = document.querySelectorAll("[data-time]");
Array.from(timeEl).forEach((el) => {
    el.setAttribute('data-time', `${intervalValue * 3}ms`)
})
