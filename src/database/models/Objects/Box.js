import mongoose, { Schema, model } from 'mongoose';
import Producto from '../Objects/Product.js';

const cajaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: ['predefinida', 'personalizable'],
    required: true,
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    validate: {
      validator: function(value) {
        // Si es predefinida, solo puede haber un máximo de 2 productos adicionales
        if (this.tipo === 'predefinida' && value.length > 2) {
          return false;
        }
        // Si es personalizable, solo puede haber un máximo de 5 productos
        if (this.tipo === 'personalizable' && value.length > 5) {
          return false;
        }
        return true;
      },
      message: 'Número de productos excede el límite permitido',
    },
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'en proceso', 'completada'],
    default: 'pendiente',
  },
  precioBase: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: true, // Asumimos que la imagen se subirá a Cloudinary y se guardará la URL
  },
});

export default model('Caja', cajaSchema);
