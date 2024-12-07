import mongoose, { Schema, model } from 'mongoose';
import Usuario from '../Users/User.js';

const direccionSchema = new Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true, // Relacionado al usuario
  },
  alias: {
    type: String,
    unique: true,
    required: true,
  },
  parroquia: {
    type: String,
    required: true,
  },
  callePrincipal: {
    type: String,
    required: true,
  },
  calleSecundaria: {
    type: String,
  },
  numeroCasa: {
    type: String,
    required: true,
    unique: true,
  },
  referencia: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false, // Por defecto no es predeterminada
  },
});

export default model('Direccion', direccionSchema);
