const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // Importar el middleware de autenticación
const authController = require('../controllers/authController');
const User = require('../models/User');

const router = express.Router();

// Ruta para verificar el correo
router.get('/verify-email/:userId', authController.verifyEmail);

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Aquí generamos el enlace de verificación (como ejemplo)
        const verificationLink = `${process.env.BASE_URL}/verify-email/${newUser._id}`;
        console.log('Enlace de verificación:', verificationLink);

        res.status(201).json({ message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario ha verificado su correo
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Por favor, verifica tu correo electrónico.' });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta protegida de ejemplo
router.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({
        message: `Hola, usuario ${req.user.id}. Este es un contenido protegido.`,
    });
});

module.exports = router;
