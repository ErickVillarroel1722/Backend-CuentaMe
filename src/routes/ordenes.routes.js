import express from 'express';
import {
    crearOrden,
    verOrdenesPorCliente,
    verOrdenPorId,
    eliminarOrden,
    cambiarEstadoOrden
} from '../controller/ordenes.controller.js';
import verificarAutenticacion from '../middleware/authService.js';

const router = express.Router();

// Ruta para crear una nueva orden
router.post('/crear', verificarAutenticacion, crearOrden);

// Ruta para ver todas las órdenes de un cliente autenticado
router.get('/cliente', verificarAutenticacion, verOrdenesPorCliente);

// Ruta para ver una orden específica por ID
router.get('/:id', verificarAutenticacion, verOrdenPorId);

// Ruta para eliminar una orden por ID
router.delete('/:id', verificarAutenticacion, eliminarOrden);

// Ruta para cambiar el estado de la orden
router.put('/:id/estado', verificarAutenticacion, cambiarEstadoOrden);

export default router;
