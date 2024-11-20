const nodemailer = require('nodemailer');

// Crear el transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Tu correo de Gmail
        pass: process.env.EMAIL_PASS,  // Tu contraseña o contraseña de aplicación
    },
    tls: {
        rejectUnauthorized: false,  // Desactiva la verificación del certificado SSL (si trabajas en local)
    },
});

module.exports = transporter;