const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Para cargar las variables de entorno desde el archivo .env

// Inicializar la aplicación de Express
const app = express();

// Middleware
app.use(cors()); // Para permitir solicitudes desde diferentes orígenes
app.use(express.json()); // Para parsear el cuerpo de las solicitudes como JSON

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((error) => console.error('Error de conexión a MongoDB:', error));

// Rutas
const authRoutes = require('./routes/authRoutes');  // Rutas de autenticación

app.use('/api/auth', authRoutes);  // Usar las rutas de autenticación

// Definir el puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
