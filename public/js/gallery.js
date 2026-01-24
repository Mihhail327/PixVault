// --- ПЕРЕМЕННЫЕ И НАСТРОЙКИ ---
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');

// --- ФУНКЦИЯ ЗАГРУЗКИ ГАЛЕРЕИ ИЗ БД ---
async function loadVaultGallery() {
  // Показываем индикатор загрузки в стиле киберпанк
  galleryGrid.innerHTML = '<div class="loading-spinner">Initializing connection...</div>';

  try {
    // ⚡ ТЕПЕРЬ: Запрашиваем список файлов у нашего Flask API
    const response = await fetch('/api/files');

    if (!response.ok) throw new Error(`Status: ${response.status}`);

    const data = await response.json();
    galleryGrid.innerHTML = ''; // Очищаем сетку

    // Если в базе Postgres нет записей
    if (!data.files || data.files.length === 0) {
      galleryGrid.innerHTML =
        '<p class="subtitle text-center" style="color:#00ffe0; grid-column: 1 / -1;">Vault is empty. Synchronize some data!</p>';
      return;
    }

    // Отрисовываем каждую картинку, пришедшую с бэкенда
    data.files.forEach(filename => {
      // Формируем путь, который обслуживается через Nginx (/uploads/...)
      const fileUrl = `/uploads/${filename}`;
      renderImageCard(filename, fileUrl);
    });

  } catch (error) {
    console.error('Gallery loading failed:', error);
    galleryGrid.innerHTML = `<p class="subtitle text-center error" style="color: #ff0055; grid-column: 1 / -1;">CRITICAL_ERROR: ${error.message}</p>`;
  }
}

// --- ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ ---
function renderImageCard(filename, url) {
  const card = document.createElement('div');
  card.className = 'image-card';

  // Создаем элемент изображения
  const img = document.createElement('img');
  img.src = url;
  img.alt = filename;
  img.loading = "lazy"; // Оптимизация: ленивая загрузка

  // Клик по картинке открывает модальное окно (Lightbox)
  img.onclick = () => openModal(url);

  // Кнопка удаления (теперь удаляет и из БД, и с диска)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = 'PURGE 🗑️'; // В киберпанк стиле
  deleteBtn.onclick = () => deleteImage(filename, card);

  card.appendChild(img);
  card.appendChild(deleteBtn);
  galleryGrid.appendChild(card);
}

// --- ФУНКЦИЯ УДАЛЕНИЯ (API DELETE) ---
async function deleteImage(filename, cardElement) {
  if (!confirm(`Are you sure you want to purge ${filename}?`)) return;

  try {
    // Отправляем запрос на бэкенд Flask
    const response = await fetch(`/api/delete/${filename}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      cardElement.remove(); // Удаляем из интерфейса
      console.log(`${filename} erased from mainframe.`);
    } else {
      throw new Error("Access denied by server");
    }
  } catch (error) {
    console.error('Purge failed:', error);
    alert("Error during data deletion.");
  }
}

// --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
function openModal(src) {
  modalImage.src = src;
  modal.classList.add('open');
  modal.classList.remove('hidden'); // Учитываем оба варианта классов
}

function closeModal() {
  modal.classList.remove('open');
  modal.classList.add('hidden');
  modalImage.src = '';
}

// Функции скачивания и копирования
function downloadModalImage() {
  const link = document.createElement('a');
  link.href = modalImage.src;
  link.download = 'pixvault-data.jpg';
  link.click();
}

async function shareModalImage() {
  try {
    // Копируем абсолютный путь к картинке
    const fullUrl = window.location.origin + modalImage.getAttribute('src');
    await navigator.clipboard.writeText(fullUrl);
    alert('Link secured and copied to clipboard!');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener('DOMContentLoaded', loadVaultGallery);

// Глобальный экспорт функций для доступа из HTML через onclick
window.closeModal = closeModal;
window.downloadModalImage = downloadModalImage;
window.shareModalImage = shareModalImage;