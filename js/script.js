/* ===============================
   Setup Signature Canvas
 ================================ */
function setupSignatureCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 360;
    const h = 150; // reduced height for compact print

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
    img.style.height = "150px"; // compact signature
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

  // Handle stamp images - keep them visible in print
  clone.querySelectorAll(".stamp-image").forEach(stamp => {
    stamp.style.position = "relative";
    stamp.style.display = "inline-block";
    stamp.style.margin = "10px";
  });

  // Handle ID images - keep them visible in print with positions
  clone.querySelectorAll(".id-image-wrapper").forEach((wrapper, index) => {
    const frontWrapper = document.getElementById("front_id_wrapper");
    const backWrapper = document.getElementById("back_id_wrapper");
    
    if (index === 0 && frontWrapper) {
      wrapper.style.position = "absolute";
      wrapper.style.left = frontWrapper.style.left || "50px";
      wrapper.style.top = frontWrapper.style.top || "100px";
      wrapper.style.setProperty("display", "flex", "important");
    } else if (index === 1 && backWrapper) {
      wrapper.style.position = "absolute";
      wrapper.style.left = backWrapper.style.left || "350px";
      wrapper.style.top = backWrapper.style.top || "100px";
      wrapper.style.setProperty("display", "flex", "important");
    } else {
      wrapper.style.position = "relative";
      wrapper.style.setProperty("display", "inline-block", "important");
    }
    wrapper.querySelector(".remove-id-image")?.remove();
  });

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
  background: #fff;
}

.paper {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 15mm;
  border: 1px solid #000;
  background: #fff;
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
  height: 150px;
}

/* STAMP IMAGES */
.stamp-image {
  max-width: 180px;
  max-height: 180px;
  opacity: 0.9;
  margin: 10px;
  display: inline-block;
  transform: rotate(-2deg);
}

/* ID IMAGES */
.id-image-wrapper {
  display: inline-block;
  margin: 10px;
  position: relative;
}

.id-image-wrapper img {
  max-width: 280px;
  max-height: 200px;
  border: 2px solid #333;
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
   ID Image Upload Handling
 ================================ */
let idImagePositions = {
  front: { x: 50, y: 100 },
  back: { x: 350, y: 100 }
};

function handleIDImageUpload(inputId, imageId, wrapperId, previewId, positionKey) {
  const input = document.getElementById(inputId);
  const image = document.getElementById(imageId);
  const wrapper = document.getElementById(wrapperId);
  const preview = document.getElementById(previewId);
  const idImagesContainer = document.getElementById("id_images_container");

  if (!input || !image || !wrapper) return;

  input.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const src = event.target.result;
        image.src = src;
        image.alt = file.name;
        
        // Position the image on the document
        const pos = idImagePositions[positionKey];
        wrapper.style.left = pos.x + "px";
        wrapper.style.top = pos.y + "px";
        wrapper.style.display = "flex";
        
        // Make wrapper draggable
        makeDraggable(wrapper);
        
        // Also show in preview area
        if (preview) {
          preview.innerHTML = `<img src="${src}" style="max-width:100%; max-height:100px; border:1px solid #ccc;">`;
        }
      };
      reader.readAsDataURL(file);
    }
  });

  function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      
      const rect = element.getBoundingClientRect();
      const parentRect = idImagesContainer.getBoundingClientRect();
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;
      
      element.style.cursor = "grabbing";
      
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      
      element.style.left = (initialX + dx) + "px";
      element.style.top = (initialY + dy) + "px";
      
      // Update position
      idImagePositions[positionKey] = { x: initialX + dx, y: initialY + dy };
    }

    function stopDrag() {
      isDragging = false;
      element.style.cursor = "move";
      
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  }
  
  // Make image resizable
  setupResizable(wrapper, image, positionKey);
}

/* ===============================
   Resize Functionality
 ================================ */
function setupResizable(wrapper, image, idKey) {
  const resizeHandle = wrapper.querySelector(".resize-handle");
  if (!resizeHandle) return;
  
  let isResizing = false;
  let startX, startY, startWidth, startHeight;
  
  resizeHandle.addEventListener("mousedown", startResize);
  resizeHandle.addEventListener("touchstart", startResize, { passive: false });
  
  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    startWidth = image.offsetWidth;
    startHeight = image.offsetHeight;
    
    resizeHandle.style.cursor = "se-resize";
    
    document.addEventListener("mousemove", resize);
    document.addEventListener("touchmove", resize, { passive: false });
    document.addEventListener("mouseup", stopResize);
    document.addEventListener("touchend", stopResize);
  }
  
  function resize(e) {
    if (!isResizing) return;
    e.preventDefault();
    
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    
    const newWidth = Math.max(100, startWidth + dx);
    const newHeight = Math.max(80, startHeight + dy);
    
    image.style.width = newWidth + "px";
    image.style.height = newHeight + "px";
  }
  
  function stopResize() {
    isResizing = false;
    resizeHandle.style.cursor = "se-resize";
    
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("touchmove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.removeEventListener("touchend", stopResize);
  }
}

/* ===============================
   Stamp Handling
 ================================ */
let currentStampSrc = null;
let stampPosition = { x: 100, y: 300 };

function handleStampUpload() {
  const input = document.getElementById("stamp_upload");
  const addButton = document.getElementById("add_stamp");
  const clearButton = document.getElementById("clear_stamp");
  const stampContainer = document.getElementById("stamp_container");

  if (!input || !addButton || !stampContainer) return;

  input.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        currentStampSrc = event.target.result;
        addStampToPaper();
      };
      reader.readAsDataURL(file);
    }
  });

  addButton.addEventListener("click", function() {
    if (currentStampSrc) {
      addStampToPaper();
    } else {
      alert("እባክዎ በመጀመሪያ ማዕቀፍ ፎቶ ያዝጡ።");
    }
  });

  clearButton.addEventListener("click", function() {
    stampContainer.innerHTML = "";
    currentStampSrc = null;
    input.value = "";
  });

  function addStampToPaper() {
    if (!currentStampSrc) return;

    const stampWrapper = document.createElement("div");
    stampWrapper.style.position = "absolute";
    stampWrapper.style.left = stampPosition.x + "px";
    stampWrapper.style.top = stampPosition.y + "px";
    
    const stampImg = document.createElement("img");
    stampImg.src = currentStampSrc;
    stampImg.alt = "ማዕቀፍ";
    stampImg.className = "stamp-image";
    
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    resizeHandle.dataset.resize = "stamp";
    
    stampWrapper.appendChild(stampImg);
    stampWrapper.appendChild(resizeHandle);

    // Make stamp draggable
    makeDraggable(stampWrapper, stampImg, "stamp");

    // Make stamp resizable
    setupResizable(stampWrapper, stampImg, "stamp");

    // Remove existing stamps
    stampContainer.innerHTML = "";
    stampContainer.appendChild(stampWrapper);
  }

  function makeDraggable(element, imgElement, key) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
      e.preventDefault();
      isDragging = true;
      
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      
      const rect = element.getBoundingClientRect();
      const parentRect = stampContainer.getBoundingClientRect();
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;
      
      element.style.cursor = "grabbing";
      
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      
      element.style.left = (initialX + dx) + "px";
      element.style.top = (initialY + dy) + "px";
      
      // Update position for next stamp
      stampPosition.x = initialX + dx;
      stampPosition.y = initialY + dy;
    }

    function stopDrag() {
      isDragging = false;
      element.style.cursor = "move";
      
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  }
}

/* ===============================
   Remove ID Image
 ================================ */
function setupRemoveIDButtons() {
  document.querySelectorAll(".remove-id-image").forEach(button => {
    button.addEventListener("click", function() {
      const id = this.dataset.id;
      const wrapper = document.getElementById(id + "_id_wrapper");
      const input = document.getElementById(id + "_id");
      const preview = document.getElementById(id + "_id_preview");
      
      if (wrapper) wrapper.style.display = "none";
      if (input) input.value = "";
      if (preview) preview.innerHTML = "";
    });
  });
}

/* ===============================
   Place Stamp on Click
 ================================ */
function setupStampPlacement() {
  const paper = document.getElementById("formPaper");
  const stampContainer = document.getElementById("stamp_container");

  if (!paper || !stampContainer) return;

  paper.addEventListener("click", function(e) {
    // If clicking on existing stamp, don't place new one
    if (e.target.classList.contains("stamp-image") || 
        e.target.closest(".stamp-image")) {
      return;
    }

    // Check if we have a stamp loaded
    if (!currentStampSrc) return;

    const rect = paper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    stampPosition.x = x;
    stampPosition.y = y;

    addStampToPaper();
  });

  function addStampToPaper() {
    if (!currentStampSrc) return;

    const stampWrapper = document.createElement("div");
    stampWrapper.style.position = "absolute";
    stampWrapper.style.left = stampPosition.x + "px";
    stampWrapper.style.top = stampPosition.y + "px";
    
    const stampImg = document.createElement("img");
    stampImg.src = currentStampSrc;
    stampImg.alt = "ማዕቀፍ";
    stampImg.className = "stamp-image";
    
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    resizeHandle.dataset.resize = "stamp";
    
    stampWrapper.appendChild(stampImg);
    stampWrapper.appendChild(resizeHandle);

    // Make stamp draggable
    makeDraggable(stampWrapper, stampImg);

    // Make stamp resizable
    setupResizable(stampWrapper, stampImg, "stamp");

    // Remove existing stamps
    stampContainer.innerHTML = "";
    stampContainer.appendChild(stampWrapper);
  }

  function makeDraggable(element, imgElement) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      
      const rect = element.getBoundingClientRect();
      const parentRect = stampContainer.getBoundingClientRect();
      initialX = rect.left - parentRect.left;
      initialY = rect.top - parentRect.top;
      
      element.style.cursor = "grabbing";
      
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      
      element.style.left = (initialX + dx) + "px";
      element.style.top = (initialY + dy) + "px";
      
      stampPosition.x = initialX + dx;
      stampPosition.y = initialY + dy;
    }

    function stopDrag() {
      isDragging = false;
      element.style.cursor = "move";
      
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    }
  }
}

/* ===============================
   INIT
 ================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Setup signature canvases
  document.querySelectorAll(".sig-canvas").forEach(setupSignatureCanvas);

  // Clear buttons
  document.querySelectorAll("[data-clear]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = document.getElementById(btn.dataset.clear);
      c?.getContext("2d").clearRect(0, 0, c.width, c.height);
    });
  });

  // Setup ID image uploads
  handleIDImageUpload("front_id", "front_id_image", "front_id_wrapper", "front_id_preview", "front");
  handleIDImageUpload("back_id", "back_id_image", "back_id_wrapper", "back_id_preview", "back");

  // Setup remove ID buttons
  setupRemoveIDButtons();

  // Setup stamp functionality
  handleStampUpload();
  setupStampPlacement();

  // Print and download buttons
  document.getElementById("btnPreview")?.addEventListener("click", preparePrintable);
  document.getElementById("btnDownloadDoc")?.addEventListener("click", downloadAsDoc);

  // Reset button
  document.getElementById("btnReset")?.addEventListener("click", () => {
    document.querySelectorAll("#formPaper input").forEach(i => i.value = "");
    document.querySelectorAll("canvas").forEach(c =>
      c.getContext("2d").clearRect(0, 0, c.width, c.height)
    );
    // Clear ID images
    document.getElementById("front_id_wrapper")?.style.setProperty("display", "none", "important");
    document.getElementById("back_id_wrapper")?.style.setProperty("display", "none", "important");
    document.getElementById("front_id_preview").innerHTML = "";
    document.getElementById("back_id_preview").innerHTML = "";
    document.getElementById("front_id").value = "";
    document.getElementById("back_id").value = "";
    // Clear stamp
    document.getElementById("stamp_container").innerHTML = "";
    currentStampSrc = null;
    document.getElementById("stamp_upload").value = "";
    // Clear additional pages
    document.getElementById("additional_pages").innerHTML = "";
  });

  // Add Page functionality
  setupAddPage();
});

/* ===============================
   Add Page Functionality
=============================== */
let pageCounter = 0;

function setupAddPage() {
  const addPageBtn = document.getElementById("btnAddPage");
  const additionalPagesContainer = document.getElementById("additional_pages");
  const pageTemplate = document.getElementById("page_template");

  if (!addPageBtn || !additionalPagesContainer || !pageTemplate) return;

  addPageBtn.addEventListener("click", function() {
    pageCounter++;
    
    const newPage = pageTemplate.content.cloneNode(true);
    const pageDiv = newPage.querySelector(".additional-page");
    const canvas = newPage.querySelector(".page-sig-canvas");
    const clearBtn = newPage.querySelector("[data-clear]");
    
    // Update canvas ID for each page
    if (canvas) {
      canvas.id = "page_canvas_" + pageCounter;
    }
    if (clearBtn) {
      clearBtn.dataset.clear = "page_canvas_" + pageCounter;
    }
    
    // Add page to container
    additionalPagesContainer.appendChild(pageDiv);
    
    // Setup signature canvas for the new page
    const newCanvas = document.getElementById("page_canvas_" + pageCounter);
    if (newCanvas) {
      setupSignatureCanvas(newCanvas);
    }
  });
}
