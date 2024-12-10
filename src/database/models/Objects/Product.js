import { Schema, model} from 'mongoose';

const productoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
  descripcion: {
    type: String,
    required: true
  },
  stock: {
    type: Number, 
    required: true
  }
  precio: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: false,
    default: null// Ruta de la imagen en Cloudinary (la URL será la proporcionada por Cloudinary)
  },
});

export default model('Product', productoSchema);
