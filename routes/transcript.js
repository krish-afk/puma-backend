const express = require('express');
const router = express.Router();
const controller = require('../controllers/uploadTranscript.js');


router.post('/upload', controller.uploadTranscript);

module.exports = router;

