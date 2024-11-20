const mongoose = require('mongoose');

// Definir el esquema de un producto
const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        minlength: [3, 'El nombre debe tener al menos 3 caracteres']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del producto es obligatoria'],
        maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    }
}, { timestamps: true }); // Añadir timestamps automáticamente

// Crear el modelo de Producto
const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
