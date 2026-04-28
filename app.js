const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const fileInfo = document.querySelector("#fileInfo");

const previewCanvas = document.querySelector("#previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const emptyPreview = document.querySelector("#emptyPreview");

const generateBtn = document.querySelector("#generateBtn");
const actionPanel = document.querySelector("#actionPanel");
const viewBtn = document.querySelector("#viewBtn");
const downloadBtn = document.querySelector("#downloadBtn");
const downloadFormat = document.querySelector("#downloadFormat");

const viewerSection = document.querySelector("#viewerSection");
const patternCanvas = document.querySelector("#patternCanvas");
const patternCtx = patternCanvas.getContext("2d");
const colorList = document.querySelector("#colorList");
const tooltip = document.querySelector("#tooltip");

const zoomOutBtn = document.querySelector("#zoomOutBtn");
const zoomResetBtn = document.querySelector("#zoomResetBtn");
const zoomInBtn = document.querySelector("#zoomInBtn");
const flipBtn = document.querySelector("#flipBtn");
const gridToggle = document.querySelector("#gridToggle");
const codeToggle = document.querySelector("#codeToggle");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "[cdnjs.cloudflare.com](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js)";

let uploadedImage = null;
let patternData = [];
let colorStats = new Map();

let currentSize = 32;
let cellSize = 24;
let zoom = 1;
let flipped = false;
let showGrid = true;
let showCode = true;

const beadPalette = [
  { code: "H2", name: "White", hex: "#f9fafb" },
  { code: "H7", name: "Black", hex: "#111111" },
  { code: "A1", name: "Cream", hex: "#fff3cf" },
  { code: "C3", name: "Sky Blue", hex: "#7fdaf4" },
  { code: "C14", name: "Mint Cyan", hex: "#c8fbff" },
  { code: "F11", name: "Brick Red", hex: "#8f2f28" },
  { code: "A21", name: "Sand Yellow", hex: "#ffd36c" },
  { code: "E1", name: "Soft Pink", hex: "#ffc5cc" },
  { code: "A26", name: "Golden Yellow", hex: "#ffc400" },
  { code: "F17", name: "Rose Pink", hex: "#ff9da6" },
  { code: "G8", name: "Dark Brown", hex: "#552514" },
  { code: "G10", name: "Caramel Brown", hex: "#bd6f00" },
  { code: "B6", name: "Deep Blue", hex: "#1f4ed8" },
  { code: "B9", name: "Light Blue", hex: "#b9e7ff" },
  { code: "D5", name: "Green", hex: "#49b86f" },
  { code: "D12", name: "Dark Green", hex: "#1f7a4c" },
  { code: "P1", name: "Purple", hex: "#9b7cf6" },
  { code: "O1", name: "Orange", hex: "#ff8a3d" },
];

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

const paletteWithRgb = beadPalette.map((color) => ({
  ...color,
  rgb: hexToRgb(color.hex),
}));

function getSelectedSize() {
  const selected = document.querySelector("input[name='patternSize']:checked");
  return Number(selected.value);
}

function colorDistance(c1, c2) {
  const r = c1.r - c2.r;
  const g = c1.g - c2.g;
  const b = c1.b - c2.b;
  return r * r + g * g + b * b;
}

function getClosestColor(r, g, b, a) {
  if (a < 20) {
    return { code: "H2", name: "White", hex: "#f9fafb", rgb: { r: 249, g: 250, b: 251 } };
  }

  let closest = paletteWithRgb[0];
  let minDistance = Infinity;

  for (const color of paletteWithRgb) {
    const distance = colorDistance({ r, g, b }, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }

  return closest;
}

function fitImageToCanvas(image, canvas, ctx, maxSize = 620) {
  const ratio = image.width / image.height;

  if (ratio >= 1) {
    canvas.width = maxSize;
    canvas.height = Math.round(maxSize / ratio);
  } else {
    canvas.height = maxSize;
    canvas.width = Math.round(maxSize * ratio);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

async function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败，请换一张图片试试。"));
    };

    img.src = url;
  });
}

async function loadPdfFile(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL("image/png");
  });
}

async function handleFile(file) {
  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

  if (!allowedTypes.includes(file.type)) {
    alert("暂时只支持 PNG、JPG、PDF 格式。");
    return;
  }

  try {
    fileInfo.classList.remove("hidden");
    fileInfo.textContent = `已上传：${file.name}`;

    if (file.type === "application/pdf") {
      uploadedImage = await loadPdfFile(file);
    } else {
      uploadedImage = await loadImageFile(file);
    }

    fitImageToCanvas(uploadedImage, previewCanvas, previewCtx);

    emptyPreview.classList.add("hidden");
    generateBtn.disabled = false;
    actionPanel.classList.add("hidden");
    viewerSection.classList.add("hidden");
  } catch (error) {
    alert(error.message || "文件读取失败，请重试。");
  }
}

function generatePattern() {
  if (!uploadedImage) return;

  currentSize = getSelectedSize();

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

  tempCanvas.width = currentSize;
  tempCanvas.height = currentSize;

  tempCtx.imageSmoothingEnabled = true;
  tempCtx.drawImage(uploadedImage, 0, 0, currentSize, currentSize);

  const imageData = tempCtx.getImageData(0, 0, currentSize, currentSize).data;

  patternData = [];
  colorStats = new Map();

  for (let y = 0; y < currentSize; y += 1) {
    const row = [];

    for (let x = 0; x < currentSize; x += 1) {
      const index = (y * currentSize + x) * 4;
      const color = getClosestColor(
        imageData[index],
        imageData[index + 1],
        imageData[index + 2],
        imageData[index + 3]
      );

      row.push(color);

      if (!colorStats.has(color.code)) {
        colorStats.set(color.code, {
          ...color,
          count: 0,
        });
      }

      colorStats.get(color.code).count += 1;
    }

    patternData.push(row);
  }

  actionPanel.classList.remove("hidden");
  renderColorList();
}

function getPatternMetaHeight() {
  return 112;
}

function drawPattern(targetCtx, options = {}) {
  const {
    includeLegend = false,
    includeAxis = false,
    canvas = patternCanvas,
  } = options;

  const axisSize = includeAxis ? 34 : 0;
  const legendHeight = includeLegend ? getPatternMetaHeight() : 0;

  canvas.width = currentSize * cellSize + axisSize * 2;
  canvas.height = currentSize * cellSize + axisSize * 2 + legendHeight;

  targetCtx.clearRect(0, 0, canvas.width, canvas.height);
  targetCtx.fillStyle = "#ffffff";
  targetCtx.fillRect(0, 0, canvas.width, canvas.height);

  targetCtx.save();
  targetCtx.translate(axisSize, axisSize);

  if (flipped) {
    targetCtx.translate(currentSize * cellSize, 0);
    targetCtx.scale(-1, 1);
  }

  for (let y = 0; y < currentSize; y += 1) {
    for (let x = 0; x < currentSize; x += 1) {
      const color = patternData[y][x];

      targetCtx.fillStyle = color.hex;
      targetCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

      if (showGrid || includeAxis) {
        targetCtx.strokeStyle = "rgba(24, 32, 51, 0.25)";
        targetCtx.lineWidth = 1;
        targetCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }

      if (showCode && cellSize >= 16) {
        targetCtx.fillStyle = getReadableTextColor(color.hex);
        targetCtx.font = `${Math.max(8, cellSize * 0.34)}px monospace`;
        targetCtx.textAlign = "center";
        targetCtx.textBaseline = "middle";
        targetCtx.fillText(
          color.code,
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2
        );
      }
    }
  }

  targetCtx.restore();

  if (includeAxis) {
    drawAxisNumbers(targetCtx, axisSize);
  }

  if (includeLegend) {
    drawLegend(targetCtx, axisSize, currentSize * cellSize + axisSize * 2);
  }

  canvas.style.transform = `scale(${zoom})`;
}

function drawAxisNumbers(ctx, axisSize) {
  ctx.fillStyle = "#182033";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < currentSize; i += 1) {
    const center = axisSize + i * cellSize + cellSize / 2;
    const number = i + 1;
    const reverseNumber = currentSize - i;

    ctx.fillText(number, center, axisSize / 2);
    ctx.fillText(reverseNumber, center, axisSize + currentSize * cellSize + axisSize / 2);

    ctx.fillText(number, axisSize / 2, center);
    ctx.fillText(reverseNumber, axisSize + currentSize * cellSize + axisSize / 2, center);
  }
}

function drawLegend(ctx, axisSize, startY) {
  const stats = [...colorStats.values()].sort((a, b) => b.count - a.count);
  const itemWidth = 118;
  const itemHeight = 46;
  const padding = 18;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, startY, ctx.canvas.width, getPatternMetaHeight());

  ctx.fillStyle = "#182033";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Color Codes / 颜色统计", axisSize, startY + 12);

  stats.forEach((item, index) => {
    const x = axisSize + (index % Math.max(1, Math.floor((ctx.canvas.width - axisSize * 2) / itemWidth))) * itemWidth;
    const y = startY + 42 + Math.floor(index / Math.max(1, Math.floor((ctx.canvas.width - axisSize * 2) / itemWidth))) * itemHeight;

    if (y + itemHeight > startY + getPatternMetaHeight()) return;

    ctx.fillStyle = item.hex;
    ctx.fillRect(x, y, 28, 28);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.strokeRect(x, y, 28, 28);

    ctx.fillStyle = "#182033";
    ctx.font = "bold 12px monospace";
    ctx.fillText(item.code, x + 36, y);

    ctx.fillStyle = "#7b8aa0";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${item.count} pcs`, x + 36, y + 15);
  });
}

function getReadableTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#182033" : "#ffffff";
}

function renderColorList() {
  const stats = [...colorStats.values()].sort((a, b) => b.count - a.count);

  colorList.innerHTML = stats
    .map(
      (item) => `
        <div class="color-item">
          <div class="color-swatch" style="background:${item.hex}"></div>
          <div>
            <div class="color-code">${item.code}</div>
            <div class="color-name">${item.name}</div>
          </div>
          <div class="color-count">${item.count}</div>
        </div>
      `
    )
    .join("");
}

function openViewer() {
  if (!patternData.length) return;

  viewerSection.classList.remove("hidden");
  zoom = 1;
  flipped = false;
  drawPattern(patternCtx);
  viewerSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateZoom() {
  patternCanvas.style.transform = `scale(${zoom})`;
  zoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
}

function downloadPattern() {
  if (!patternData.length) return;

  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  const previousCellSize = cellSize;
  const previousShowGrid = showGrid;
  const previousShowCode = showCode;
  const previousZoom = zoom;

  cellSize = currentSize >= 96 ? 14 : 20;
  showGrid = true;
  showCode = true;
  zoom = 1;

  drawPattern(exportCtx, {
    includeLegend: true,
    includeAxis: true,
    canvas: exportCanvas,
  });

  const format = downloadFormat.value;

  if (format === "png") {
    const link = document.createElement("a");
    link.download = `bead-pattern-${currentSize}x${currentSize}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  } else {
    const { jsPDF } = window.jspdf;
    const orientation = exportCanvas.width > exportCanvas.height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [exportCanvas.width, exportCanvas.height],
    });

    pdf.addImage(
      exportCanvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    pdf.save(`bead-pattern-${currentSize}x${currentSize}.pdf`);
  }

  cellSize = previousCellSize;
  showGrid = previousShowGrid;
  showCode = previousShowCode;
  zoom = previousZoom;

  if (!viewerSection.classList.contains("hidden")) {
    drawPattern(patternCtx);
    updateZoom();
  }
}

function getCellFromMouseEvent(event) {
  const rect = patternCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / zoom;
  const y = (event.clientY - rect.top) / zoom;

  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);

  if (
    cellX < 0 ||
