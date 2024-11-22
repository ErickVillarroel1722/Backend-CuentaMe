import { Schema, model} from 'mongoose';

const productoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: String,
  precio: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: true, // Ruta de la imagen en Cloudinary (la URL será la proporcionada por Cloudinary)
  },
  categoria: {
    type: String,
    enum: ['predefinido', 'personalizable'],
    required: true,
  },
});

export default model('Product', productoSchema);
