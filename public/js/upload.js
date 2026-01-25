console.log("UPLOAD JS — REAL API VERSION LOADED");

// -------------------- DOM --------------------
const dropZone   = document.getElementById("drop-zone");
const fileInput  = document.getElementById("file-input");
const status     = document.getElementById("status");
const imageList  = document.getElementById("image-list");
const uploadLink = document.getElementById("upload-link");

// -------------------- CONFIG --------------------
const API_UPLOAD = "/api/upload";
const API_IMAGES = "/api/images";

// -------------------- HELPERS --------------------
function setStatus(message, type = "info") {
  status.textContent = message;
  status.className = "";
  status.classList.add(type, "status-animate");
}

// -------------------- UPLOAD --------------------
async function uploadFile(file) {
  if (!file) {
    setStatus("No file selected", "error");
    return;
  }

  // 1. ПРОВЕРКА РАЗМЕРА: 5 MB = 5 * 1024 * 1024 байт
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    setStatus("You are trying to upload an image larger than 5 MB", "error");
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    setStatus("Unsupported file type", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setStatus("Uploading...", "info");

  try {
    const response = await fetch(API_UPLOAD, {
      method: "POST",
      body: formData,
    });

    // 2. ОБРАБОТКА ОШИБОК СЕРВЕРА
    if (!response.ok) {
      // Если Nginx или Flask вернули 413
      if (response.status === 413) {
        throw new Error("You are trying to upload an image larger than 5 MB");
      }

      // Проверяем, вернул ли сервер JSON или HTML ошибку
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    const imageUrl = `${API_IMAGES}/${data.filename}`;

    setStatus("Upload successful", "success");
    renderImage(data.filename, imageUrl);
    uploadLink.value = imageUrl;

  } catch (err) {
    console.error(err);
    setStatus(err.message, "error");
  }
}

// -------------------- RENDER --------------------
function renderImage(filename, url) {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = filename;

  const linkCell = document.createElement("td");
  linkCell.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;

  row.appendChild(nameCell);
  row.appendChild(linkCell);
  imageList.appendChild(row);
}

// -------------------- INPUT --------------------
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    uploadFile(fileInput.files[0]);
    fileInput.value = "";
  }
});

// -------------------- DRAG & DROP --------------------
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  uploadFile(file);
});
