/* ===============================
   Setup Signature Canvas
================================ */
function setupSignatureCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 360;
    const h = 30; // reduced height for compact print

    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    temp.getContext("2d").drawImage(canvas, 0, 0);

    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    ctx.drawImage(temp, 0, 0, w, h);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);

  let drawing = false;

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", e => {
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", e => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  function stop(e) {
    drawing = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  }

  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointerleave", stop);
  canvas.addEventListener("pointercancel", stop);
}

/* ===============================
   Convert Canvas → Image
================================ */
function canvasToImage(canvas) {
  return canvas.toDataURL("image/png");
}

/* ===============================
   Make Static Copy (for print/export)
================================ */
function makeStaticClone(root) {
  const clone = root.cloneNode(true);

  // Replace canvases with images
  clone.querySelectorAll("canvas").forEach(c => {
    const orig = document.getElementById(c.id);
    const img = document.createElement("img");
    img.src = orig ? canvasToImage(orig) : "";
    img.style.maxWidth = "100%";
    img.style.height = "30px"; // compact signature
    c.replaceWith(img);
  });

  // Replace inputs/selects with text
  clone.querySelectorAll("input, select, textarea").forEach(el => {
    const span = document.createElement("span");
    span.textContent =
      el.tagName === "SELECT"
        ? el.options[el.selectedIndex]?.text || ""
        : el.value || "";
    span.className = el.className;
    el.replaceWith(span);
  });

  // Remove buttons & controls
  clone.querySelectorAll("button, .no-print").forEach(b => b.remove());

  return clone;
}

/* ===============================
   PRINT PREVIEW
================================ */
function preparePrintable() {
  const paper = document.getElementById("formPaper");
  const clone = makeStaticClone(paper);

  const win = window.open("", "_blank");
  if (!win) return alert("Popup blocked");

  win.document.write(`<!doctype html>
<html lang="am">
<head>
<meta charset="utf-8">

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic&display=swap" rel="stylesheet">

<style>
/* ===== MATCH MAIN STYLE ===== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Noto Sans Ethiopic", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #111;
}

.paper {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 15mm;
  border: 1px solid #000;
}

/* DATE (TOP RIGHT) — PRESERVED */
.paper > .line.date-line {
  position: absolute;
  top: 15mm;
  right: 15mm;
  white-space: nowrap;
  font-size: 12px;
}

/* TEXT */
p {
  margin-bottom: 8px;
  font-size: 12px;
}

h1 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 12px;
  font-weight: 500;
}

h2, h3 {
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

td {
  border: 1px solid #000;
  padding: 6px;
  vertical-align: top;
}

/* SIGNATURE IMAGES */
img {
  height: 30px;
}

/* PRINT PAGE */
@page {
  size: A4;
  margin: 0;
}
</style>
</head>

<body>
  <div class="paper">
    ${clone.innerHTML}
  </div>
</body>
</html>`);

  win.document.close();
  setTimeout(() => win.print(), 300);
}

/* ===============================
   DOWNLOAD AS WORD (.doc)
================================ */
function downloadAsDoc() {
  const paper = document.getElementById("formPaper");
  const clone = makeStaticClone(paper);

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>body { font-family: 'Noto Sans Ethiopic', sans-serif; font-size:12px; line-height:1.2; }</style>
</head>
<body>${clone.innerHTML}</body>
</html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "contract.doc";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sig-canvas").forEach(setupSignatureCanvas);

  // Clear buttons
  document.querySelectorAll("[data-clear]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = document.getElementById(btn.dataset.clear);
      c?.getContext("2d").clearRect(0, 0, c.width, c.height);
    });
  });

  document.getElementById("btnPreview")?.addEventListener("click", preparePrintable);
  document.getElementById("btnDownloadDoc")?.addEventListener("click", downloadAsDoc);

  document.getElementById("btnReset")?.addEventListener("click", () => {
    document.querySelectorAll("#formPaper input").forEach(i => i.value = "");
    document.querySelectorAll("canvas").forEach(c =>
      c.getContext("2d").clearRect(0, 0, c.width, c.height)
    );
  });
});
