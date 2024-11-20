const express = require('express');
const authController = require('../controllers/authController');  // Importar el controlador
const router = express.Router();

// Ruta para verificar el correo
router.get('/verify-email/:userId', authController.verifyEmail);

// Registro de usuario
router.post('/register', authController.register);

// Ruta para hacer login
router.post('/login', authController.login);

module.exports = router;
