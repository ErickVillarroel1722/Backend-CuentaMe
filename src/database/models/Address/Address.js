import mongoose, {Schema, model} from 'mongoose';
import Usuario from '../Users/User.js';

const direccionSchema = new Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true, // Relacionado al usuario
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
  },
  referencia: {
    type: String,
  },
});

export default model('Direccion', direccionSchema);
