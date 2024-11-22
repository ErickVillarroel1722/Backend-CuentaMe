import nodemailer from "nodemailer";
import User from '../database/models/Users/User.js';
import Administrator from '../database/models/Users/Administrator.js';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_SERVICE,
  port: process.env.SMTP_PORT,
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,  // Desactiva la verificación del certificado SSL (si trabajas en local)
  },
})

const sendMail = async(destinatario, asunto, mensaje) => {
  try{
    const info = await transporter.sendMail({
      from: 'tu_correo@gmail.com', // dirección de correo del remitente
      to: destinatario, // dirección de correo del destinatario..
      subject: asunto,
      text: mensaje,
    });

    console.log('Correo enviado: %s', info.messageId);
  }catch (e) {
    console.error('Error al enviar correo: ', e);
  }
}

// ------------------------------------------------------------------------------------------ Apartado para envio de correos
//-------> Administrador

  //  Correo para enviar la verificación de token
  const sendMailToAdmin = async (userMail, token) => {
    // let es una variable que ouede cambiar por eso no es const
    let info = await transporter.sendMail({
      from: 'info@cuentame.com', // Dirección de correo electrónico del remitente.
      to: userMail, // Dirección de correo electrónico del destinatario
      subject: "Cuenta-me | Verifica tu cuenta de correo electrónico", // Asunto del correo electrónico
      html:
        `
          <h1>Cuenta-Me - Regalos Handmade</h1>
          <hr/>
          <h5>Activa tu cuenta de Admnistrador</h5>
          <hr/>
          <!-- a href=${process.env.URL_FRONTEND}/confirmar/${token}>Clic para confirmar tu cuenta</a> -->
          <hr>
          <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId); // Imprime el ID del mensaje enviado satisfactoriamente en consola
  }

  // Correo para enviar la recuperación de contraseña

  const sendRecoveryPassword_AdminEmail = async(userMail,token)=>{
    let info = await transporter.sendMail({
      from: 'admin@cuentame.com',
      to: userMail,
      subject: "Correo para reestablecer tu contraseña",
      html: `
      <h1>Cuenta-Me - Regalos Handmade</h1>
      <hr>
      <h5>Recuperación de Contraseña | Admnistrador</h5>
      <hr>
      <!--a href=${process.env.URL_FRONTEND}/recuperar-password/${token}>Clic para reestablecer tu contraseña</a>-->
      <hr>
      <footer>Regalos con amor y emoción ❤️🎁🎀!</footer>
      `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
  }

// End of Admin emails ---------------------------------------------------

// ------> Usuario
