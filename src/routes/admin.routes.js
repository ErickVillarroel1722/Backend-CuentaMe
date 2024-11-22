import express from 'express';
import {
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    listadoProductos,
    crearCaja,
    actualizarCaja,
    eliminarCaja,
    listadoCajas,
    listadoClientes,
    eliminarCliente,
    listadoOrdenesCompra,
    verPerfil,
    login,
    registrarse,
    recuperarContraseña
} from '../controller/adminController.js';

import { verifyToken } from '../middleware/authService.js';  // Middleware para verificar token
import upload from '../middleware/uploadService.js';  // Middleware para subir imágenes

const router = express.Router();

// ** Rutas de Autenticación **

// Iniciar sesión
router.post('/login', login);

// Registro de administrador
router.post('/registrarse', registrarse);

// Recuperar contraseña
router.post('/recuperar-contraseña', recuperarContraseña);

// ** Rutas protegidas (requieren autenticación de administrador) **

// Ver perfil del administrador
router.get('/perfil', verifyToken, verPerfil);

// ** Rutas de productos **

// Crear un nuevo producto (requiere imagen)
router.post('/producto', verifyToken, upload.single('imagen'), crearProducto);

// Actualizar producto existente (requiere imagen)
router.put('/producto/:id', verifyToken, upload.single('imagen'), actualizarProducto);

// Eliminar producto
router.delete('/producto/:id', verifyToken, eliminarProducto);

// Listado de productos
router.get('/productos', verifyToken, listadoProductos);

// ** Rutas de cajas **

// Crear una nueva caja (requiere imagen)
router.post('/caja', verifyToken, upload.single('imagen'), crearCaja);

// Actualizar caja existente (requiere imagen)
router.put('/caja/:id', verifyToken, upload.single('imagen'), actualizarCaja);

// Eliminar caja
router.delete('/caja/:id', verifyToken, eliminarCaja);

// Listado de cajas
router.get('/cajas', verifyToken, listadoCajas);

// ** Rutas de clientes (usuarios) **

// Listado de clientes
router.get('/clientes', verifyToken, listadoClientes);

// Eliminar cliente
router.delete('/cliente/:id', verifyToken, eliminarCliente);

// ** Rutas de ordenes de compra **

// Listado de órdenes de compra
router.get('/ordenes', verifyToken, listadoOrdenesCompra);

export default router;
