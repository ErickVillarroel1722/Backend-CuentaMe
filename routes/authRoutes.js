const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar un usuario
router.post('/register', authController.register);

// Ruta para verificar el correo
router.get('/verify-email/:userId', authController.verifyEmail);

module.exports = router;
