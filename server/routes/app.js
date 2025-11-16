const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ----------------------------------------------------
// 1. НАСТРОЙКА ХРАНИЛИЩА (MULTER)
// ----------------------------------------------------

// Папка, куда будут сохраняться загруженные изображения
// Мы сохраняем их внутри public/assets/uploads, чтобы фронтенд мог их отобразить
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'assets', 'uploads');
const METADATA_FILE = path.join(__dirname, '..', 'data', 'metadata.json');

// Убедимся, что папки существуют
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'data'));
}

// Настройка хранилища Multer:
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Создаем уникальное имя файла: имя_ориг + ID + расширение
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Настройка фильтра (повторяем валидацию, но на сервере!)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type on server.'), false);
    }
};

// Инициализация Multer
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ----------------------------------------------------
// 2. ФУНКЦИИ МЕТАДАННЫХ
// ----------------------------------------------------

// Чтение всех метаданных
function readMetadata() {
    try {
        const data = fs.readFileSync(METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        // Если файла нет, возвращаем пустой массив
        return [];
    }
}

// Запись всех метаданных
function writeMetadata(metadata) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
}


// ----------------------------------------------------
// 3. API МАРШРУТЫ
// ----------------------------------------------------

/**
 * POST /api/upload
 * Принимает один файл и сохраняет его на диск, а метаданные - в metadata.json
 */
router.post('/upload', upload.single('imageFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
        // Создаем объект метаданных
        const metadata = {
            id: Date.now(),
            name: req.file.originalname,
            serverFilename: req.file.filename,
            // Путь, который клиент будет использовать для доступа к файлу
            url: `/assets/uploads/${req.file.filename}`, 
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date().toISOString()
        };

        // Сохраняем метаданные
        const allMetadata = readMetadata();
        allMetadata.push(metadata);
        writeMetadata(allMetadata);

        // Отправляем ответ клиенту
        res.status(200).json({ 
            success: true, 
            message: 'File uploaded and metadata saved.',
            data: metadata
        });
    } catch (error) {
        console.error('Metadata saving error:', error);
        res.status(500).json({ success: false, message: 'Server error saving metadata.' });
    }
});


/**
 * GET /api/images
 * Возвращает список всех метаданных изображений.
 */
router.get('/images', (req, res) => {
    try {
        const metadata = readMetadata();
        res.status(200).json({ success: true, data: metadata });
    } catch (error) {
        console.error('Reading metadata error:', error);
        res.status(500).json({ success: false, message: 'Server error reading images.' });
    }
});

// Добавьте сюда маршрут DELETE /api/images/:id для удаления, если потребуется

module.exports = router;