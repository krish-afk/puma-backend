const express = require('express');
const router = express.Router(); 
const controller = require('../controllers/uploadTranscript.js');

router.use('/transcriptUpload', controller);

module.exports = router; 

