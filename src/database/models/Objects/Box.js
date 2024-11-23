import mongoose, { Schema, model } from 'mongoose';
import Producto from '../Objects/Product.js';  // Asumiendo que el modelo de Producto está en la misma carpeta

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
  // Campo dimensiones solo requerido si la caja es personalizable
  dimensiones: {
    type: Map,
    of: String,
    required: function() {
      return this.tipo === 'personalizable';  // Solo requerido si el tipo es 'personalizable'
    },
    validate: {
      validator: function(value) {
        // Aseguramos que las claves sean las dimensiones válidas y los valores sean precios válidos
        const validDimensions = ["15x15", "20x20", "25x25", "30x30", "50x50"];
        for (let key in value) {
          if (!validDimensions.includes(key)) {
            return false;
          }
          if (isNaN(parseFloat(value[key]))) {
            return false; // Si el precio no es un número válido
          }
        }
        return true;
      },
      message: 'Las dimensiones o precios no son válidos.',
    }
  },
  // Campo colores solo requerido si la caja es personalizable
  colores: {
    type: [String],
    enum: ['rojo', 'negro', 'amarillo', 'azul', 'blanco', 'verde', 'aleatoria'],
    required: function() {
      return this.tipo === 'personalizable';  // Solo requerido si el tipo es 'personalizable'
    },
  },
  // Campo decorado solo requerido si la caja es personalizable
  decorado: {
    type: String,
    required: function() {
      return this.tipo === 'personalizable';  // Solo requerido si el tipo es 'personalizable'
    },
    minlength: 10,  // Aseguramos que el texto no sea muy corto
  },
  // Productos adicionales (Extras) solo si la caja es personalizable
  extras: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    validate: {
      validator: function(value) {
        return value.length <= 5;  // No se pueden agregar más de 5 productos
      },
      message: 'No puedes agregar más de 5 productos en extras.',
    },
  }],
  // Total del precio, por defecto es 0.00
  totalPrecio: {
    type: Number,
    default: 0.00,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en proceso', 'completada'],
    default: 'pendiente',
  },
  imagen: {
    type: String,
    required: true, // Asumimos que la imagen se subirá a Cloudinary y se guardará la URL
  },
});

export default model('Caja', cajaSchema);