(function () {
if (!window.matchMedia("(pointer: fine)").matches) return;

const dot = document.createElement("div");
const label = document.createElement("span");

dot.className = "cursor-dot";
dot.appendChild(label);
document.body.appendChild(dot);

// Canvas layer for the shooting-star trail
const canvas = document.createElement("canvas");
canvas.id = "cursor-trail-canvas";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
const pos = { x: mouse.x, y: mouse.y };

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

const lerp = (a, b, n) => (1 - n) * a + n * b;

const points = [];
const MAX_POINTS = 16;

function tick() {
    pos.x = lerp(pos.x, mouse.x, 0.2);
    pos.y = lerp(pos.y, mouse.y, 0.2);

    points.push({ x: pos.x, y: pos.y });
    if (points.length > MAX_POINTS) points.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach((p, i) => {
        const progress = i / points.length; // 0 = oldest, 1 = newest
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + progress * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10, 10, 10, ${progress * 0.35})`;
        ctx.fill();
    });

    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(tick);
}
tick();

//hover behaviour

document.querySelectorAll('[data-cursor-label]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const text = el.dataset.cursorLabel;
            label.textContent = text;
            dot.classList.add('is-hovering');
            dot.style.width = `${text.length * 9 + 44}px`;
            dot.style.height = '44px';
            dot.style.borderRadius = '22px';
            dot.style.backgroundColor = 'var(--green)';
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('is-hovering');
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'var(--black)';
        });
    });
})();