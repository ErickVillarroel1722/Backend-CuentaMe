/*
** Acciones con base en los productos: **
* CRUD completo de productos:
* - Crear
* - Listar
* - Modificar
* - Eliminar
* */


import express from 'express';
import {
    crearProducto,
    actualizarProducto,
    listadoProductos,
    eliminarProducto, listarProductoPorId
} from '../controller/productos.controller.js';

import verificarAutenticacion from '../middleware/authService.js';
import upload from '../middleware/uploadService.js';  // Middleware para subir imágenes

const router = express.Router();

// ** Ruta para crear un producto **
// Esta ruta será utilizada para crear nuevos productos. Usa la verificación de autenticación y subida de imagen
router.post('/crear_productos', verificarAutenticacion, upload.single('imagen'), crearProducto);

// ** Ruta para obtener el listado de productos **
// Esta ruta obtiene todos los productos almacenados en la base de datos.
router.get('/lista_productos', listadoProductos);

router.get("/producto/:id", listarProductoPorId);

// ** Ruta para actualizar un producto **
// Esta ruta permite actualizar la información de un producto existente. Usa la verificación de autenticación y subida de imagen
router.put('/actualizar_productos/:id', verificarAutenticacion, upload.single('imagen'), actualizarProducto);

// ** Ruta para eliminar un producto **
// Esta ruta elimina un producto basándonos en su ID. Solo los usuarios autenticados pueden eliminar productos.
router.delete('/eliminar_productos/:id', verificarAutenticacion, eliminarProducto);

export default router;