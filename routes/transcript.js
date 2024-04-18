const express = require('express');
const router = express.Router();
const { uploadTranscript } = require('../controllers/uploadTranscript.js');
const multer = require('multer');


const storage = multer.memoryStorage(); // or you can use diskStorage for saving files to disk
const upload = multer({ storage: storage });

router.post('/upload', (req, res, next) => {
    console.log("Received upload request");
    next();
}, upload.single('file'), (req, res, next) => {
    console.log("File passed through multer");
    next();
}, uploadTranscript);

module.exports = router;

