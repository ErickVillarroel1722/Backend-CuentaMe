/*
** Acciones con base en a las cajas predefinidas: **
* CRUD completo:
* - Crear
* - Listar
* - Modificar
* - Eliminar
* */

import express from 'express';
import {
    crearCajaPredefinida,
    eliminarCajaPredefinida,
    actualizarCajaPredefinida,
    obtenerCajasPredefinidas,
    obtenerCajaPredefinidaPorId
} from '../controller/caja_predefinida.controller.js';
import verificarAutenticacion from '../middleware/authService.js';
import upload from '../middleware/uploadService.js';

const router = express.Router();

// Crear una nueva caja predefinida
router.post('/crear', verificarAutenticacion, upload.single('image'), crearCajaPredefinida);

// Obtener todas las cajas predefinidas
router.get('/listar', verificarAutenticacion, obtenerCajasPredefinidas);

// Obtener información de una caja por ID
router.get('/listar/:id', verificarAutenticacion, obtenerCajaPredefinidaPorId);

// Actualizar una caja predefinida
router.put('/actualizar/:id', verificarAutenticacion, upload.single('image'), actualizarCajaPredefinida);

// Eliminar una caja predefinida
router.delete('/eliminar/:id', verificarAutenticacion, eliminarCajaPredefinida);

export default router;