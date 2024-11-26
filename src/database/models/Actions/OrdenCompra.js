import mongoose, { Schema, model } from 'mongoose';

const ordenCompraSchema = new Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true, // Relación con el usuario que realiza la orden
  },
  contenido: {
    cajasPredeterminadas: [
      {
        caja: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CajaPredefinida', // Modelo de cajas predefinidas
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    cajasPersonalizadas: [
      {
        caja: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Caja Personalizada', // Modelo de cajas personalizadas
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    productosIndividuales: [
      {
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Modelo de productos
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  direccion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direccion', // Relación con el modelo Dirección
    required: function () {
      return this.tipoEntrega === 'domicilio';
    },
  },
  tipoEntrega: {
    type: String,
    enum: ['domicilio', 'retiro'], // Indica si la entrega es a domicilio o retiro
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now, // Fecha de creación automática
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Pagada', 'Enviado', 'Entregada', 'Cancelada'], // Estados de la orden
    default: 'Pendiente',
  },
  total: {
    type: Number,
    required: true, // Precio total calculado de la orden
  },
});

// Middleware pre-save para calcular el total automáticamente
ordenCompraSchema.pre('save', async function (next) {
  let total = 0;

  // Calcular el total de cajas predefinidas
  for (const item of this.contenido.cajasPredeterminadas) {
    const caja = await mongoose.model('CajaPredefinida').findById(item.caja);
    if (caja) {
      total += caja.precio * item.cantidad;
    }
  }

  // Calcular el total de cajas personalizadas
  for (const item of this.contenido.cajasPersonalizadas) {
    const caja = await mongoose.model('Caja Personalizada').findById(item.caja);
    if (caja) {
      total += caja.precioBase * item.cantidad;
    }
  }

  // Calcular el total de productos individuales
  for (const item of this.contenido.productosIndividuales) {
    const producto = await mongoose.model('Product').findById(item.producto);
    if (producto) {
      total += producto.precio * item.cantidad;
    }
  }

  this.total = total; // Actualizar el campo total
  next();
});

export default model('OrdenCompra', ordenCompraSchema);
