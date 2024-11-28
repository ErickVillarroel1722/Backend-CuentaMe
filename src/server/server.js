import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Routes imports
import adminRoutes from "../routes/admin.routes.js";
import productRoutes from "../routes/productos.routes.js";
import cajaPredefinidaRoutes from "../routes/caja_predefinida.routes.js";
import cajaPersonalizadaRoutes from "../routes/caja_personalizada.routes.js";
import userRoutes from "../routes/user.routes.js";
import ordenesRoutes from "../routes/ordenes.routes.js";

// Server initialize constants
const app = express();
dotenv.config();

// Server configurations
app.use(cors());
app.set('port', process.env.PORT || 3000);


// Middlewares Configuration
app.use(express.json());

// Global vars
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/cajas_predefinidas', cajaPredefinidaRoutes);
app.use('/api/caja_personalizada', cajaPersonalizadaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ordenes', ordenesRoutes);


// Non founded route manage
app.use((req, res) => res.status(404).send("Error 404 | Página o ruta no encontrada"));

export default app;
