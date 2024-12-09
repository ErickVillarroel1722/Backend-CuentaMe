import mongoose, { Schema, model } from 'mongoose';

const cajaPredefinidaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: true,
    },
    contenido: {
        type: String,  // Lista de productos o elementos que contiene la caja
        required: true,
    },
    precio: {
        type: Number,
        required: true,
    },
    imagen: {
        type: String,
        required: false, // Asumimos que la imagen se subirá a Cloudinary y se guardará la URL
    },
});

export default model('CajaPredefinida', cajaPredefinidaSchema);
