import mongoose, {Schema, model} from 'mongoose';
import User from '../Users/User.js';
import Caja from '../Actions/Cart.js';

const ordenCompraSchema = new Schema({
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
  estado: {
    type: String,
    enum: ['pendiente', 'pagada', 'enviado', 'entregada'],
    default: 'pendiente',
  },
  total: {
    type: Number,
    required: true,
  },
});

export default model('OrdenCompra', ordenCompraSchema);
