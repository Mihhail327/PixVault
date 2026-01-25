const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
let currentImageId = null; // Храним ID текущего открытого изображения

/**
 * ГАЛЕРЕЯ: Загрузка списка файлов из API и отрисовка сетки
 */
async function loadVaultGallery() {
    galleryGrid.innerHTML = '<div class="loading-spinner">SYNCING...</div>';

    try {
        const response = await fetch('/api/list'); // Используем проверенный эндпоинт
        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();
        galleryGrid.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            galleryGrid.innerHTML = '<p class="empty-msg">Vault is empty.</p>';
            return;
        }

        data.items.forEach(img => {
            const card = document.createElement('div');
            card.className = 'image-card';
            const imgPath = `/uploads/${img.filename}`;

            // При клике на фото передаем и путь, и ID в модалку
            card.innerHTML = `
                <img src="${imgPath}" alt="${img.original_name}"
                     onclick="openModal('${imgPath}', ${img.id})">

                <div class="item-info">
                    ${img.original_name}
                </div>
            `;
            galleryGrid.appendChild(card);
        });

    } catch (error) {
        galleryGrid.innerHTML = `<p style="color:red">ERROR: ${error.message}</p>`;
    }
}

/**
 * МОДАЛЬНОЕ ОКНО: Открытие, закрытие и управление
 */
function openModal(src, id) {
    currentImageId = id; // Запоминаем ID для удаления
    modalImage.src = src;
    modal.classList.remove('hidden'); // Показываем окно (используем hidden из твоего HTML)
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
}

function closeModal() {
    modal.classList.remove('open');
    modal.classList.add('hidden');
    modalImage.src = '';
    document.body.style.overflow = 'auto';
    currentImageId = null;
}

/**
 * ФУНКЦИИ ВНУТРИ МОДАЛКИ (Привязаны к кнопкам в HTML)
 */

// 1. Копирование прямой ссылки
async function copyModalLink() {
    const fullPath = `${window.location.origin}${modalImage.getAttribute('src')}`;
    try {
        await navigator.clipboard.writeText(fullPath);
        alert('Link copied to neural link! 🔗');
    } catch (err) {
        console.error('Copy failed', err);
    }
}

// 2. Удаление изображения по ID
async function deleteModalImage() {
    if (!currentImageId) return;
    if (!confirm(`Are you sure you want to purge data #${currentImageId}?`)) return;

    try {
        const response = await fetch(`/api/delete/${currentImageId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            closeModal();
            loadVaultGallery(); // Обновляем галерею после удаления
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Purge failed:', error);
    }
}

/**
 * ОБРАБОТЧИКИ СОБЫТИЙ
 */

// Закрытие при клике на фон модалки
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Назначаем функции на кнопки в модалке
document.addEventListener('DOMContentLoaded', () => {
    loadVaultGallery();

    // Привязываем события к кнопкам в HTML
    const copyBtn = document.getElementById('copy-link-btn');
    const deleteBtn = document.getElementById('delete-image-btn');

    if (copyBtn) copyBtn.onclick = copyModalLink;
    if (deleteBtn) deleteBtn.onclick = deleteModalImage;
});

// Экспортируем функцию закрытия для HTML (onclick="closeModal()")
window.closeModal = closeModal;