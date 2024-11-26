/*
** Acciones con base en a las cajas predefinidas: **
* CRUD completo:
* - Crear
* - Listar
* - Modificar
* - Eliminar
* */

import express from 'express';
import verificarAutenticacion from '../middleware/authService.js';
import {
    createCajaPersonalizada,
    getCajasPersonalizadas,
    getCajaPersonalizadaById,
    updateCajaPersonalizada,
    deleteCajaPersonalizada,
} from '../controller/caja_personalizada.controller.js';

const router = express.Router();

// Protegemos las rutas con el middleware verificarAutenticacion
router.post('/crear', verificarAutenticacion, createCajaPersonalizada); // Crear caja
router.get('/listar', verificarAutenticacion, getCajasPersonalizadas); // Obtener todas las cajas
router.get('/listar/:id', verificarAutenticacion, getCajaPersonalizadaById); // Obtener una caja por ID
router.put('/modificar/:id', verificarAutenticacion, updateCajaPersonalizada); // Actualizar caja
router.delete('/eliminar/:id', verificarAutenticacion, deleteCajaPersonalizada); // Eliminar caja

export default router;
