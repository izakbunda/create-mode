// Placeholder curated set of Instagram-style gradients.
// TODO: swap in exact color stops once reference photos are provided.
const GRADIENTS = [
  { id: "sunset", angle: 135, stops: ["#833ab4", "#fd1d1d", "#fcb045"] },
  { id: "dusk", angle: 135, stops: ["#4776e6", "#8e54e9"] },
  { id: "candy", angle: 135, stops: ["#ee0979", "#ff6a00"] },
  { id: "ocean", angle: 135, stops: ["#00c6ff", "#0072ff"] },
  { id: "mint", angle: 135, stops: ["#11998e", "#38ef7d"] },
  { id: "berry", angle: 135, stops: ["#c31432", "#240b36"] },
  { id: "peach", angle: 135, stops: ["#ff9a9e", "#fecfef"] },
  { id: "night", angle: 135, stops: ["#0f2027", "#203a43", "#2c5364"] },
  { id: "flame", angle: 135, stops: ["#f12711", "#f5af19"] },
  { id: "grape", angle: 135, stops: ["#654ea3", "#eaafc8"] },
];

const stage = document.getElementById("stage");
const textDisplay = document.getElementById("text-display");
const textInput = document.getElementById("text-input");
const swatchStrip = document.getElementById("swatch-strip");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");

let activeIndex = 0;

function gradientCss(g) {
  return `linear-gradient(${g.angle}deg, ${g.stops.join(", ")})`;
}

function applyGradient(index) {
  activeIndex = index;
  stage.style.background = gradientCss(GRADIENTS[index]);
  [...swatchStrip.children].forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
}

function buildSwatches() {
  GRADIENTS.forEach((g, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.style.background = gradientCss(g);
    btn.addEventListener("click", () => applyGradient(i));
    swatchStrip.appendChild(btn);
  });
}

function focusInput() {
  textInput.focus();
}

function updateDisplay() {
  textDisplay.textContent = textInput.value;
}

function resetAll() {
  textInput.value = "";
  updateDisplay();
  applyGradient(0);
}

async function exportImage() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const g = GRADIENTS[activeIndex];
  const angleRad = (g.angle * Math.PI) / 180;
  const x = Math.cos(angleRad);
  const y = Math.sin(angleRad);
  const gradient = ctx.createLinearGradient(
    width / 2 - (x * width) / 2,
    height / 2 - (y * height) / 2,
    width / 2 + (x * width) / 2,
    height / 2 + (y * height) / 2
  );
  g.stops.forEach((color, i) => {
    gradient.addColorStop(i / (g.stops.length - 1 || 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const text = textInput.value.trim();
  if (text) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 32px -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 1;

    const maxWidth = width * 0.85;
    const lineHeight = 32 * 1.3;
    const lines = wrapText(ctx, text, maxWidth);
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });
  }

  const dataUrl = canvas.toDataURL("image/png");

  if (navigator.canShare) {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "create-mode.png", { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "create-mode.png";
  link.click();
}

function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split("\n");
  const lines = [];
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(" ");
    let current = "";
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    lines.push(current);
  });
  return lines;
}

buildSwatches();
applyGradient(0);

stage.addEventListener("click", focusInput);
textInput.addEventListener("input", updateDisplay);
resetBtn.addEventListener("click", resetAll);
exportBtn.addEventListener("click", exportImage);
