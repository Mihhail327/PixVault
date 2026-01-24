// === ПЕРЕМЕННЫЕ ИНТЕРФЕЙСА ===
const dropZone = document.getElementById('drop-zone');      // Зона Drag-and-Drop
const fileInput = document.getElementById('file-input');    // Скрытый ввод файла
const uploadLink = document.getElementById('upload-link');  // Поле для итоговой ссылки
const status = document.getElementById('status');            // Текстовый индикатор состояния
const imageList = document.getElementById('image-list');    // Таблица (From URL)
const galleryGrid = document.getElementById('gallery-grid');// Сетка превью (Upload)
const tabButtons = document.querySelectorAll('.tab[data-tab]'); // Кнопки переключения вкладок

// Элементы модального окна для просмотра
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('full-image');
const captionText = document.getElementById('modal-caption');
const closeModal = document.querySelector('.modal-close');

// === ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ===
window.addEventListener('DOMContentLoaded', () => {
    // 1. Очистка кэша: теперь мы полагаемся на Postgres, а не на LocalStorage
    localStorage.removeItem('pixvault-images');

    // 2. Первичный запрос данных из БД через Flask API
    loadImagesFromServer();

    // 3. Настройка переключателей вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', e => {
            const tabName = e.currentTarget.dataset.tab;
            if (tabName) switchTab(tabName);
        });
    });

    // 4. Логика закрытия модального окна
    if (closeModal) {
        closeModal.onclick = () => modal.style.display = "none";
        // Закрытие при клике на темную область вокруг картинки
        window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    }
});

// === ОСНОВНЫЕ ФУНКЦИИ API ===

/**
 * Загрузка списка файлов из базы данных Postgres
 * Flask эндпоинт: GET /api/files
 */
async function loadImagesFromServer() {
    try {
        const response = await fetch("/api/files");

        // Проверка: если сервер вернул ошибку (например, 502 или 500), не пытаемся парсить JSON
        if (!response.ok) throw new Error(`Server status: ${response.status}`);

        const data = await response.json();

        // Очищаем текущие списки перед обновлением
        if (imageList) imageList.innerHTML = "";
        if (galleryGrid) galleryGrid.innerHTML = "";

        // Если файлы найдены в БД, отрисовываем их
        if (data && data.files) {
            data.files.forEach(filename => {
                // Путь /uploads/ обрабатывается Nginx напрямую
                const url = `/uploads/${filename}`;
                renderImage(filename, url, url);
            });
        }
    } catch (err) {
        console.warn("Галерея пуста или бэкенд недоступен:", err.message);
        setStatus("System Offline: Database Link Failure", "error");
    }
}

/**
 * Отправка файла на сервер (Flask + Multer-подобная обработка)
 * Flask эндпоинт: POST /api/upload
 */
async function handleUpload(file) {
    if (!file) return;

    // Клиентская валидация форматов (v1.0.0 поддерживает WEBP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        setStatus("Unsupported format! Use JPG, PNG, GIF or WEBP", "error");
        return;
    }

    // Лимит безопасности: 5МБ
    if (file.size > 5 * 1024 * 1024) {
        setStatus("File too large (>5MB)", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file); // Ключ 'file' должен совпадать с ожиданиями Flask

    setStatus("Encrypting & Securing image...", "status-animate");

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            // Вывод ошибки от бэкенда (например, "File type not allowed")
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        // Формируем прямую ссылку для пользователя
        const fileUrl = `/uploads/${data.filename}`;
        uploadLink.value = window.location.origin + fileUrl;

        setStatus("Data Secured ✅", "success");
        renderImage(data.filename, fileUrl, fileUrl);
        fileInput.value = ''; // Сброс инпута для новых загрузок

    } catch (err) {
        setStatus(err.message, "error");
        console.error("Upload error details:", err);
    }
}

/**
 * Рендеринг визуальных элементов (карточки и строки)
 */
function renderImage(name, link, src) {
    const fullUrl = window.location.origin + link;

    // 1. Добавление в таблицу на вкладке "From URL"
    if (imageList) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td><a href="${link}" target="_blank" class="table-link">View Link</a></td>
            <td><span class="delete-btn" data-file="${name}">🗑️</span></td>
        `;
        imageList.appendChild(row);
        row.querySelector('.delete-btn').onclick = () => {
            if (confirm(`Delete record for ${name}?`)) deleteFromServer(name, row, null);
        };
    }

    // 2. Добавление карточки в мини-галерею на вкладке "Upload"
    if (galleryGrid) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${src}" class="gallery-img-trigger" alt="${name}" title="Click to expand">
            <div class="card-controls">
                <button class="copy-link-btn" title="Copy Direct Link">🔗</button>
                <button class="delete-btn" title="Delete Image">🗑️</button>
            </div>
            <div class="item-info">${name}</div>
        `;

        // Открытие модального окна
        card.querySelector('.gallery-img-trigger').onclick = () => {
            modal.style.display = "flex";
            modalImg.src = src;
            captionText.textContent = name;
        };

        // Копирование ссылки
        card.querySelector('.copy-link-btn').onclick = () => {
            navigator.clipboard.writeText(fullUrl).then(() => alert("Access Link Copied!"));
        };

        // Удаление
        card.querySelector('.delete-btn').onclick = () => {
            if (confirm(`Permanently erase ${name}?`)) deleteFromServer(name, null, card);
        };

        galleryGrid.appendChild(card);
    }
}

/**
 * Удаление объекта из Postgres и файла с диска
 * Flask эндпоинт: DELETE /api/delete/<filename>
 */
async function deleteFromServer(filename, row, card) {
    try {
        const res = await fetch(`/api/delete/${filename}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Server rejected deletion request");

        if (row) row.remove();
        if (card) card.remove();
        setStatus("Data purged from vault", "success");
    } catch (err) {
        alert("Operation Failed: " + err.message);
    }
}

// === УТИЛИТЫ И ОБРАБОТЧИКИ СОБЫТИЙ ===

// Вывод текста в блок статуса
function setStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = `status ${type}`;
}

// Переключение видимости вкладок
function switchTab(tab) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    const uTab = document.getElementById('upload-tab');
    const iTab = document.getElementById('images-tab');
    if (uTab) uTab.style.display = tab === 'upload' ? 'block' : 'none';
    if (iTab) iTab.style.display = tab === 'images' ? 'block' : 'none';
}

// Обработка Drag-and-Drop
dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-active'); // Можно добавить в CSS для подсветки
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files[0]);
});

// Обработка обычного выбора файла
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleUpload(fileInput.files[0]);
});