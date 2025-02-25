const fs = require('fs');
const multer = require("multer");


// Настраиваем хранилище для картинок
const storage = multer.diskStorage({
    // значение - колбек, который показывает название папки, и, если папки нет, создает ее.
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },

    // filename - колбек, который конкатенирует название файла из даты и загруженного названия файла
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    },
});

// сохраняем хранилище
const uploads = multer({ storage });

module.exports = uploads;