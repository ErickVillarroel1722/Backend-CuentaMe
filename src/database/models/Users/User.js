import mongoose, { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';  // Asegúrate de importar bcrypt si no lo tienes
import Direccion from '../Address/Address.js';

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  telefono: {
    type: Number,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
    default: null,
    unique: true 
  },
  historialCompras: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrdenCompra', // Relación con el modelo OrdenCompra
  }],
  token:{
    type: String
  },

  // Campos para la verificación del código OTP
  otp: {
    type: String,
    required: false,  // Este campo se llenará solo cuando se esté verificando la cuenta
  },
  otpExpiration: {
    type: Date,
    required: false,  // Este campo solo se llenará durante la verificación
  },
  isVerified: {
    type: Boolean,
    default: false,  // Indica si el usuario ha verificado su cuenta
  },
});

// Método para crear un código OTP
usuarioSchema.methods.generarOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Genera un código OTP de 6 dígitos
  this.otp = otp;
  this.otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // Establece la expiración a 15 minutos
  return otp;
};

// Método para verificar el OTP
usuarioSchema.methods.verificarOtp = function(otp) {
  if (this.otp === otp && this.otpExpiration > Date.now()) {
    this.isVerified = true;
    this.otp = null;  // Limpiar el OTP después de la verificación exitosa
    this.otpExpiration = null;  // Limpiar la expiración del OTP
    return true;
  }
  return false;
};

// Método para cifrar el password del cliente
usuarioSchema.methods.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Método para verificar si el password ingresado es el mismo de la BDD
usuarioSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para crear el token del cliente
usuarioSchema.methods.crearToken = function() {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
};


export default model('Usuario', usuarioSchema);
