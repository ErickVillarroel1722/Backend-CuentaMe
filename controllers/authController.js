const User = require('../models/User');
const transporter = require('../config/emailConfig'); // Importar el servicio de correo
const jwt = require('jsonwebtoken');

// Registrar un usuario
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Crear un nuevo usuario
        const newUser = new User({
            email,
            password,
        });

        await newUser.save();

        // Crear enlace de verificación (usando el ID del usuario o un JWT)
        const verificationLink = `${process.env.BASE_URL}/verify-email/${newUser._id}`;

        // Enviar correo de verificación
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de correo - CuéntaMe',
            html: `
                <h1>¡Hola!</h1>
                <p>Gracias por registrarte en CuéntaMe. Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
                <a href="${verificationLink}">Verificar mi correo</a>
            `,
        };

        // Enviar correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo: ', error);
                return res.status(500).json({ message: 'Error al enviar correo de verificación' });
            }
            res.status(201).json({ message: 'Usuario registrado. Revisa tu correo para verificar tu cuenta.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Verificar el correo
exports.verifyEmail = async (req, res) => {
    const { userId } = req.params;

    try {
        // Buscar al usuario por su ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Marcar al usuario como verificado
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Correo verificado con éxito. ¡Bienvenido!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar el correo' });
    }
};
