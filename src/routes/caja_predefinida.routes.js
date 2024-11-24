import express from 'express';
import {
    crearCajaPredefinida,
    eliminarCajaPredefinida,
    actualizarCajaPredefinida,
    obtenerCajasPredefinidas
} from '../controller/caja_predefinida.controller.js';
import verificarAutenticacion from '../middleware/authService.js';
import upload from '../middleware/uploadService.js';

const router = express.Router();

// Crear una nueva caja predefinida
router.post('/cajas-predefinidas', verificarAutenticacion, upload.single('image'), crearCajaPredefinida);

// Obtener todas las cajas predefinidas
router.get('/cajas-predefinidas', verificarAutenticacion, upload.single('image'), obtenerCajasPredefinidas);

// Actualizar una caja predefinida
router.put('/cajas-predefinidas/:id', verificarAutenticacion, upload.single('image'), actualizarCajaPredefinida);

// Eliminar una caja predefinida
router.delete('/cajas-predefinidas/:id', verificarAutenticacion, upload.single('image'), eliminarCajaPredefinida);

export default router;