const express = require('express');
const path = require('path');
const app = express();

// Раздаем статику из public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Обработка маршрутов для SPA (если пользователь обновит страницу)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`PixVault Frontend (Neon-UI) running on port ${PORT}`);
});