import nodemailer from 'nodemailer';
import User from '../database/models/Users/User.js';
import Administrator from '../database/models/Users/Administrator.js';

// Configuración del transporter para el envío de correos
let transporter = nodemailer.createTransport({
  service: 'gmail',  // Usando Gmail como servicio SMTP
  host: process.env.SMTP_SERVICE,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
});

// Función principal para enviar correos
const sendMail = async (destinatario, asunto, mensaje) => {
  try {
    const info = await transporter.sendMail({
      from: 'tu_correo@gmail.com',  // Dirección de correo del remitente
      to: destinatario,  // Dirección de correo del destinatario
      subject: asunto,
      text: mensaje,
    });

    console.log('Correo enviado: %s', info.messageId);
  } catch (e) {
    console.error('Error al enviar correo: ', e);
  }
};

// ------------------------------------------------------------------------------------------ Apartado para envío de correos

// -------> Correo para Administrador

// Correo para enviar la verificación de token
const sendMailToAdmin = async (userMail, token) => {
  try {
    let info = await transporter.sendMail({
      from: 'info@cuentame.com',  // Dirección de correo electrónico del remitente
      to: userMail,  // Dirección de correo electrónico del destinatario
      subject: "Cuenta-me | Verifica tu cuenta de correo electrónico",  // Asunto del correo
      html: `
        <h1>Cuenta-Me - Regalos Handmade</h1>
        <hr/>
        <h5>Activa tu cuenta de Administrador</h5>
        <hr/>
        <a href="${process.env.URL_FRONTEND}/confirmar/${token}">Clic para confirmar tu cuenta</a>
        <hr>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);  // Imprime el ID del mensaje enviado
  } catch (error) {
    console.error('Error al enviar el correo de confirmación:', error);
  }
};

// Correo para enviar la recuperación de contraseña
const sendRecoveryPassword_AdminEmail = async (userMail, token) => {
  try {
    let info = await transporter.sendMail({
      from: 'admin@cuentame.com',
      to: userMail,
      subject: "Correo para reestablecer tu contraseña",
      html: `
        <h1>Cuenta-Me - Regalos Handmade</h1>
        <hr>
        <h5>Recuperación de Contraseña | Administrador</h5>
        <hr>
        <a href="${process.env.URL_FRONTEND}/recuperar-password/${token}">Clic para reestablecer tu contraseña</a>
        <hr>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de recuperación:', error);
  }
};

// -------> Aquí agregarías otros correos si es necesario para Usuarios u otros roles

// Exportamos las funciones para que se puedan usar en otros archivos
export {
  sendMail,
  sendMailToAdmin,
  sendRecoveryPassword_AdminEmail
};
