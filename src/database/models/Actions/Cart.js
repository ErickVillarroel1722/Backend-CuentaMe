import mongoose, {Schema, model} from 'mongoose';
import Caja from '../Objects/Box.js';

const carritoSchema = new Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  cajas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caja',
    required: true,
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

export default model('Carrito', carritoSchema);
