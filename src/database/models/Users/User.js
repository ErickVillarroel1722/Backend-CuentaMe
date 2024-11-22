import mongoose, {model, Schema} from 'mongoose';
import Carrito from '../Actions/Cart.js';
import User from '../Users/User.js';

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
  direccion: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direccion', // Relación con el modelo Dirección
  }],
  carrito: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrito', // Relación con el modelo Carrito
  },
  historialCompras: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrdenCompra', // Relación con el modelo OrdenCompra
  }],
});

usuarioSchema.methods.crearToken = function() {
  return this.token = Math.random().toString(36).slice(2);
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


export default model('Usuario', usuarioSchema);
