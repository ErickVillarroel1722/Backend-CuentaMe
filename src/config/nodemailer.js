import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de credenciales oAuth2
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const SMTP_USER = process.env.SMTP_USER;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !SMTP_USER) {
  console.error('Error: Faltan configuraciones en las variables de entorno.');
  throw new Error('Configuraciones de entorno faltantes o inválidas');
}

const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const createTransporter = async () => {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error('No se pudo obtener un token de acceso. Verifica el Refresh Token.');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SMTP_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error('Error al crear el transporter: ', error);
    throw error;
  }
};

// Funciones para envío de correos
const sendMail = async (destinatario, asunto, mensaje) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `Cuenta-Me <${SMTP_USER}>`,
      to: destinatario,
      subject: asunto,
      html: `<p>${mensaje}</p>`,
    });

    console.log('Correo enviado: %s', info.messageId);
  } catch (error) {
    console.error('Error al enviar correo: ', error);
  }
};

const sendMailToAdmin = async (userMail, token) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `Cuenta-Me <${SMTP_USER}>`,
      to: userMail,
      subject: "Cuenta-me | Verifica tu cuenta de correo electrónico",
      html: `
        <h1>Cuenta-Me - Regalos Handmade</h1>
        <hr/>
        <h5>Activa tu cuenta de Administrador</h5>
        <hr/>
        <a href="${process.env.BACKEND_URL}/api/admin/confirmar/${token}">Clic para confirmar tu cuenta</a>
        <hr>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `,
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de confirmación:', error);
  }
};

const sendRecoveryPassword_AdminEmail = async (userMail, token) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `Cuenta-Me <${SMTP_USER}>`,
      to: userMail,
      subject: "Correo para reestablecer tu contraseña",
      html: `
        <h1>Cuenta-Me - Regalos Handmade</h1>
        <hr>
        <h5>Recuperación de Contraseña | Administrador</h5>
        <hr>
        <a href="${process.env.BACKEND_URL}/api/admin/recuperar-password/${token}">Clic para reestablecer tu contraseña</a>
        <hr>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `,
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de recuperación:', error);
  }
};

export const sendRecoveryPassword_UserEmail = async (userMail, token) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `Cuenta-Me <${SMTP_USER}>`,
      to: userMail,
      subject: "Correo para reestablecer tu contraseña",
      html: `
        <h1>Cuenta-Me - Regalos Handmade</h1>
        <hr>
        <h5>Recuperación de Contraseña | Usuario</h5>
        <hr>
        <a href="https://cuenta-me.up.railway.app/recuperar-contrasena/${token}">
          Clic para restablecer tu contraseña
        </a>
        <hr>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `,
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo de recuperación:', error);
  }
};

// Función para enviar el OTP
export const sendOtpEmail = async (correo, otp) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `Cuenta-Me <${SMTP_USER}>`,
      to: correo,
      subject: "Código de verificación",
      html: `
        <h1>Cuenta-Me - Verificación de Cuenta</h1>
        <p>Tu código de verificación es: <strong>${otp}</strong></p>
        <p>Este código caduca en 15 minutos.</p>
        <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `,
    });

    console.log('Correo enviado: %s', info.messageId);
  } catch (error) {
    console.error('Error al enviar correo: ', error);
  }
};

export {
  sendMail,
  sendMailToAdmin,
  sendRecoveryPassword_AdminEmail,
};
