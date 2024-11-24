import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Routes imports
import adminRoutes from "../routes/admin.routes.js";
import productRoutes from "../routes/productos.routes.js";
import cajaPredefinidaRoutes from "../routes/caja_predefinida.routes.js";

// Server initialize constants
const app = express();
dotenv.config();

// Server configurations
app.use(cors());
app.set('port', process.env.PORT || 3000);


// Middlewares Configuration
app.use(express.json());

// Global vars

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/cajas_predefinidas', cajaPredefinidaRoutes);


// Non founded route manage
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"));

export default app;
