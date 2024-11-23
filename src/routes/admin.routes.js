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
    confirmarEmail,
    recuperarContrasena,
    comprobarTokenContrasena,
    nuevaContrasena
} from '../controller/adminController.js';

import verificarAutenticacion from '../middleware/authService.js';
import upload from '../middleware/uploadService.js';  // Middleware para subir imágenes

const router = express.Router();

// ** Rutas de Autenticación **

// Iniciar sesión
router.post('/login', login);

// Registro de administrador
router.post('/registrarse', registrarse);

// Confirmar email
router.get("/confirmar/:token", confirmarEmail);  // Ruta para confirmar el email

// Recuperar contraseña
router.post('/recuperar-password', recuperarContrasena);

// Verificación de Token de acceso para permitir cambio de clave
router.get("/recuperar-password/:token", comprobarTokenContrasena);

// Reescritura de contraseña
router.post("/nuevo-password/:token", nuevaContrasena);

// ** Rutas protegidas (requieren autenticación de administrador) **

// Ver perfil del administrador
router.get('/perfil', verificarAutenticacion, verPerfil);

// ** Rutas de productos **
// Crear un nuevo producto (requiere imagen)
router.post('/producto', verificarAutenticacion, upload.single('imagen'), crearProducto);

// Actualizar producto existente (requiere imagen)
router.put('/producto/:id', verificarAutenticacion, upload.single('imagen'), actualizarProducto);

// Eliminar producto
router.delete('/producto/:id', verificarAutenticacion, eliminarProducto);

// Listado de productos
router.get('/productos', verificarAutenticacion, listadoProductos);

// ** Rutas de cajas **

// Crear una nueva caja (requiere imagen)
router.post('/caja', verificarAutenticacion, upload.single('imagen'), crearCaja);

// Actualizar caja existente (requiere imagen)
router.put('/caja/:id', verificarAutenticacion, upload.single('imagen'), actualizarCaja);

// Eliminar caja
router.delete('/caja/:id', verificarAutenticacion, eliminarCaja);

// Listado de cajas
router.get('/cajas', verificarAutenticacion, listadoCajas);

// ** Rutas de clientes (usuarios) **

// Listado de clientes
router.get('/clientes', verificarAutenticacion, listadoClientes);

// Eliminar cliente
router.delete('/cliente/:id', verificarAutenticacion, eliminarCliente);

// ** Rutas de órdenes de compra **

// Listado de órdenes de compra
router.get('/ordenes', verificarAutenticacion, listadoOrdenesCompra);

export default router;