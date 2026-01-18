// --- ПЕРЕМЕННЫЕ И НАСТРОЙКИ ---
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');

// --- ФУНКЦИЯ ЗАГРУЗКИ ГАЛЕРЕИ ---
function loadVaultGallery() {
  galleryGrid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
    galleryGrid.innerHTML = '';

    if (savedImages.length === 0) {
      galleryGrid.innerHTML =
        '<p class="subtitle text-center" style="color:#00ffe0; grid-column: 1 / -1;">Vault is empty. Upload some images!</p>';
      return;
    }

    savedImages.forEach(image => renderImageCard(image));
  } catch (error) {
    console.error('Gallery loading failed:', error);
    galleryGrid.innerHTML = `<p class="subtitle text-center error" style="color: red; grid-column: 1 / -1;">Error loading gallery: ${error.message}</p>`;
  }
}

// --- ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧКИ ---
function renderImageCard(image) {
  const card = document.createElement('div');
  card.className = 'image-card';

  const img = document.createElement('img');
  img.src = image.dataURL; // ⚡ используем сохранённый dataURL
  img.alt = image.name || 'Vault Image';
  img.onclick = () => openModal(image.dataURL);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete 🗑️';
  deleteBtn.onclick = () => deleteImage(image.link, card);

  card.appendChild(img);
  card.appendChild(deleteBtn);
  galleryGrid.appendChild(card);
}

// --- ФУНКЦИЯ УДАЛЕНИЯ ---
function deleteImage(link, cardElement) {
  try {
    const savedImages = JSON.parse(localStorage.getItem('pixvault-images') || '[]');
    const updated = savedImages.filter(img => img.link !== link);
    localStorage.setItem('pixvault-images', JSON.stringify(updated));

    cardElement.remove();
    console.log('Image deleted successfully!');
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

// --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
function openModal(src) {
  modalImage.src = src;
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  modalImage.src = '';
}

function downloadModalImage() {
  const link = document.createElement('a');
  link.href = modalImage.src;
  const fileName = modalImage.src.substring(modalImage.src.lastIndexOf('/') + 1);
  link.download = fileName || 'pixvault-image';
  link.click();
}

async function shareModalImage() {
  try {
    await navigator.clipboard.writeText(modalImage.src);
    console.log('Image link copied to clipboard!');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener('DOMContentLoaded', loadVaultGallery);

// Экспортируем функции для HTML
window.closeModal = closeModal;
window.downloadModalImage = downloadModalImage;
window.shareModalImage = shareModalImage;