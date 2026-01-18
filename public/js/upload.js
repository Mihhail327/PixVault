// --- ПЕРЕМЕННЫЕ И НАСТРОЙКИ ---
const dropZone   = document.getElementById('drop-zone');
const fileInput  = document.getElementById('file-input');
const uploadLink = document.getElementById('upload-link');
const status     = document.getElementById('status');
const imageList  = document.getElementById('image-list');
const galleryGrid = document.getElementById('gallery-grid'); // может отсутствовать
const copyBtn    = document.getElementById('copy-btn');
const tabButtons = document.querySelectorAll('.tab[data-tab]');

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener('DOMContentLoaded', () => {
  // Загружаем сохранённые изображения
  const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
  savedImages.forEach(({ name, link, dataURL }) => {
    renderImage(name, link, dataURL);
  });

  // Слушатели вкладок
  tabButtons.forEach(button => {
    button.addEventListener('click', e => {
      const tabName = e.target.dataset.tab;
      if (tabName) switchTab(tabName);
    });
  });

  // Слушатель кнопки копирования
  if (copyBtn) copyBtn.addEventListener('click', copyLink);
});

// --- Drag & Drop ---
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0,0,0,0.5)';
});
dropZone.addEventListener('dragleave', () => {
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0,0,0,0.3)';
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.querySelector('.drop-label').style.backgroundColor = 'rgba(0,0,0,0.3)';
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    Array.from(files).forEach(file => handleUpload(file));
  }
});

// --- Выбор файла через input ---
fileInput.addEventListener('change', () => {
  const files = fileInput.files;
  if (files.length > 0) {
    Array.from(files).forEach(file => handleUpload(file));
  }
});

// --- Основная функция загрузки ---
function handleUpload(file) {
  if (!uploadLink || !status || !imageList) {
    console.error('❌ Один из элементов не найден в HTML');
    return;
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const maxSize = 5 * 1024 * 1024;

  uploadLink.classList.remove('link-appear');
  status.classList.remove('status-animate', 'success', 'error');

  if (!file) {
    status.textContent = 'No file selected';
    status.classList.add('error', 'status-animate');
    uploadLink.value = '';
    return;
  }

  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!validTypes.includes(file.type) || !validExtensions.includes(ext)) {
    status.textContent = 'Upload failed: Unsupported file type';
    status.classList.add('error', 'status-animate');
    uploadLink.value = '';
    return;
  }

  if (file.size > maxSize) {
    status.textContent = 'Upload failed: File too large';
    status.classList.add('error', 'status-animate');
    uploadLink.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataURL = reader.result;
    const shortId = Math.random().toString(36).substring(2, 8);
    const fakeLink = `pixvault.local/${shortId}`;

    uploadLink.value = fakeLink;
    uploadLink.classList.add('link-appear');
    status.textContent = 'Image saved ✅';
    status.classList.add('success', 'status-animate');

    const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
    savedImages.push({ name: file.name, link: fakeLink, dataURL });
    localStorage.setItem('pixvault-images', JSON.stringify(savedImages));

    renderImage(file.name, fakeLink, dataURL);
    fileInput.value = '';

    if (copyBtn) copyBtn.disabled = false;
  };

  reader.readAsDataURL(file);
}

// --- Копирование ссылки ---
function copyLink() {
  if (!uploadLink.value) {
    status.textContent = 'Nothing to copy';
    status.classList.add('error', 'status-animate');
    return;
  }

  navigator.clipboard.writeText(uploadLink.value)
    .then(() => {
      status.textContent = 'Link copied successfully!';
      status.classList.add('success', 'status-animate');
    })
    .catch(err => {
      console.error('Copy failed:', err);
      status.textContent = 'Copy failed (check console)';
      status.classList.add('error', 'status-animate');
    });
}

// --- Рендеринг изображения ---
function renderImage(name, link, dataURL) {
  // 🧾 Таблица
  const row = document.createElement('tr');
  row.classList.add('row-appear');

  const nameCell = document.createElement('td');
  nameCell.textContent = name;

  const linkCell = document.createElement('td');
  linkCell.innerHTML = `<a href="${link}" target="_blank">${link}</a>`;

  const deleteCell = document.createElement('td');
  deleteCell.innerHTML = `<span class="delete-btn">🗑️</span>`;

  row.appendChild(nameCell);
  row.appendChild(linkCell);
  row.appendChild(deleteCell);
  imageList.appendChild(row);

  // 🖼️ Галерея (если контейнер есть)
  if (galleryGrid) {
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('gallery-item');

    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = name;
    img.classList.add('gallery-image');

    const deleteBtn = document.createElement('span');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = '🗑️';

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(deleteBtn);
    galleryGrid.appendChild(imgWrapper);

    // Удаление из галереи
    deleteBtn.addEventListener('click', () => {
      row.remove();
      imgWrapper.remove();
      const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
      const updated = savedImages.filter(i => i.link !== link);
      localStorage.setItem('pixvault-images', JSON.stringify(updated));
    });
  }

  // Удаление из таблицы
  deleteCell.querySelector('.delete-btn').addEventListener('click', () => {
    row.remove();
    if (galleryGrid) {
      const imgs = [...galleryGrid.querySelectorAll('.gallery-item')];
      const target = imgs.find(item => item.querySelector('img').src === dataURL);
      if (target) target.remove();
    }
    const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
    const updated = savedImages.filter(i => i.link !== link);
    localStorage.setItem('pixvault-images', JSON.stringify(updated));
  });
}

// --- Переключение вкладок ---
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  document.getElementById('upload-tab').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('images-tab').style.display = tab === 'images' ? 'block' : 'none';
}