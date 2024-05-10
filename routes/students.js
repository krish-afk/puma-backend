const express= require('express');
const router= express.Router();
const controller= require('../controllers/students')

router.post('/createUser',controller.createUser)
router.get('/getUser',controller.getUser)
router.post('/authenticateUser',controller.authenticateUser)

module.exports= router;
