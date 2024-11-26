import mongoose, {Schema, model} from 'mongoose'

const cajaPersonalizadaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        maxlength: 100,
        required: true,
    },
    precioBase: {
        type: Number,
        default: 0,
        required: true,
    },
    dimensiones: [
        {
            dimension: { type: String, required: true }, // Ejemplo: "largo", "ancho", etc.
            precio: { type: Number, default: 0 }, // Precio asociado a cada dimensión
        },
    ],
    color: {
        type: String,
        required: true,
    },
    extras: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Relación con el modelo Product
        },
    ],
})

export default model('Caja Personalizada', cajaPersonalizadaSchema);