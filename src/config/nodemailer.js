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

// Crear una instancia del cliente OAuth2 y configurar las credenciales iniciales
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Función para crear un transportador de Nodemailer
const createTransporter = async () => {
  try {
    // Obtener un token de acceso actualizado
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error('No se pudo obtener un token de acceso. Verifica el Refresh Token.');
    }

    // Crear y devolver el transportador
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
    console.error('Error al crear el transporter:', error.message);
    throw error;
  }
};

// Función genérica para enviar correos
const sendMail = async (mailOptions) => {
  try {
    const transporter = await createTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
};

// Funciones específicas para diferentes tipos de correos
export const sendMailToAdmin = async (userMail, token) => {
  const mailOptions = {
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
  };

  return sendMail(mailOptions);
};

export const sendRecoveryPassword_AdminEmail = async (userMail, token) => {
  const mailOptions = {
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
  };

  return sendMail(mailOptions);
};

export const sendRecoveryPassword_UserEmail = async (userMail, otp) => {
  const mailOptions = {
    from: `Cuenta-Me <${SMTP_USER}>`,
    to: userMail,
    subject: "Correo para reestablecer tu contraseña",
    html: `
      <h1>Cuenta-Me - Regalos Handmade</h1>
      <hr>
      <h5>Recuperación de Contraseña | Usuario</h5>
      <hr>
      <p>Tu código OTP para restablecer la contraseña es:</p>
      <h2>${otp}</h2>
      <p>Este código es válido por 15 minutos. Por favor, ingrésalo en la aplicación para continuar con la recuperación de tu contraseña.</p>
      <hr>
      <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
    `,
  };

  return sendMail(mailOptions);
};

export const sendOtpEmail = async (correo, otp) => {
  const mailOptions = {
    from: `Cuenta-Me <${SMTP_USER}>`,
    to: correo,
    subject: "Código de verificación",
    html: `
      <h1>Cuenta-Me - Verificación de Cuenta</h1>
      <p>Tu código de verificación es: <strong>${otp}</strong></p>
      <p>Este código caduca en 15 minutos.</p>
      <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
    `,
  };

  return sendMail(mailOptions);
};