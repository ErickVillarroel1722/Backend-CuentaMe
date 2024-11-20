const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Necesario para el cifrado de contraseñas

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

// Middleware para cifrar la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Solo cifrar si la contraseña ha sido modificada

    const salt = await bcrypt.genSalt(10); // Generar un salt
    this.password = await bcrypt.hash(this.password, salt); // Cifrar la contraseña

    next();
});

module.exports = mongoose.model('User', userSchema);
