const express = require('express');
const app = express();
const routes = require('./routes/app');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv'); // 💡 ДОБАВЛЕНО: Для чтения .env файла (если он есть)

dotenv.config(); // Загружаем переменные среды

app.use(cors());
app.use(express.json());

// 💡 ИСПРАВЛЕНО: Указываем Express обслуживать статические файлы из папки 'public'.
// Теперь при запросе любого файла, который не является API, Express вернет его из public.
// Например, при запросе /gallery.html он вернет public/gallery.html
app.use(express.static(path.join(__dirname, '..', 'public')));

// 💡 МАРШРУТ API: Подключаем все маршруты из server/routes/app.js через префикс /api
// Теперь /api/images будет обрабатываться маршрутизатором 'routes'.
app.use('/api', routes); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`PixVault backend running on port ${PORT}`);
});
