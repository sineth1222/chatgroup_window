const multer = require("multer");

// පින්තූරය Disk එකේ save නොකර Memory එකේ තබා ගනී
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;