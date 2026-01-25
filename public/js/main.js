// === КОНФИГУРАЦИЯ ===
// Список путей к изображениям для превью
// ВАЖНО: Убедись, что эти файлы существуют в public/assets/gallery/
const images = [
    'assets/gallery/image2.jpg',
    'assets/gallery/image3.jpg',
    'assets/gallery/image4.jpg',
    'assets/gallery/image5.jpg'
];

let index = 0;
// Поиск элемента, куда будет проецироваться изображение
const holo = document.querySelector('.holo-content');

/**
 * Функция смены проекции
 * Устанавливает фоновое изображение с эффектом затухания (если настроено в CSS)
 */
function showNextImage() {
    if (!holo) return; // Защита от ошибок, если элемента нет на странице

    // Плавная смена фона через inline-стили
    holo.style.backgroundImage = `url(${images[index]})`;
    
    // Логика цикличного перебора индекса (0, 1, 2, 3 -> 0)
    index = (index + 1) % images.length;
}

// === ЗАПУСК СИСТЕМЫ ===

// 1. Показываем первое изображение сразу при загрузке
if (holo) {
    showNextImage();

    // 2. Устанавливаем интервал обновления (4000мс = 4 секунды)
    // Это создает эффект "живой" голограммы
    setInterval(showNextImage, 4000);
}

