import {model, Schema} from 'mongoose';

const administradorSchema = new Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  telefono: {
    type: Number,
    required: true,
  },
  rol: {
    type: String,
    enum: ['admin'],
    default: 'admin', // Solo puede ser admin
  },
  token: {
    type: String,
    default: null
  },
  // Campo para indicar si el correo electrónico del tecnico ha sido confirmado
  confirmEmail: {
    type: Boolean,
    default: false
  },
  permisos: {
    // Puedes agregar permisos específicos si es necesario
    gestionarProductos: {
      type: Boolean,
      default: true,
    },
    gestionarCajas: {
      type: Boolean,
      default: true,
    },
    gestionarUsuarios: {
      type: Boolean,
      default: true,
    },
    gestionarOrdenes: {
      type: Boolean,
      default: true,
    },
  },
});

// Metodo para cifrar contraseña
administradorSchema.methods.encrypPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Método para verificar si el password ingresado es el mismo de la BDD
administradorSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para crear un token
administradorSchema.methods.crearToken = function() {
  return this.token = Math.random().toString(36).slice(2);
};

export default model('Administrador', administradorSchema);

