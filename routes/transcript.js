const express = require('express');
const router = express.Router();
const { uploadTranscript } = require('../controllers/uploadTranscript.js');


router.post('/upload', uploadTranscript);

module.exports = router;

