import express from 'express';
import {
    crearOrden,
    verOrdenesPorCliente,
    verOrdenPorId,
    eliminarOrden,
    cambiarEstadoOrden,
    verTodasLasOrdenes,
    verOrdenesPorUserId
} from '../controller/ordenes.controller.js';
import verificarAutenticacion from '../middleware/authService.js';

const router = express.Router();

// Ruta para crear una nueva orden
router.post('/crear', verificarAutenticacion, crearOrden);

// Ruta para ver todas las órdenes de un cliente autenticado
router.get('/cliente', verificarAutenticacion, verOrdenesPorCliente);

// Ruta para ver una orden específica por ID
router.get('/listar/:id', verificarAutenticacion, verOrdenPorId);

// Ruta para ver todas las órdenes
router.get('/listar', verificarAutenticacion, verTodasLasOrdenes);

// Ruta para eliminar una orden por ID
router.delete('/eliminar/:id', verificarAutenticacion, eliminarOrden);

// Ruta para cambiar el estado de la orden
router.put('/:id/estado', verificarAutenticacion, cambiarEstadoOrden);

router.get('/cliente/:user_id', verificarAutenticacion, verOrdenesPorUserId);

export default router;
