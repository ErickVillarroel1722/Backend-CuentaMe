/*
** Acciones que realiza el administrador: **
* Iniciar Sesión
* Registrarse
* Recuperar Contraseña
* Ingresa Productos
* Ingresa Cajas Predefinidas
* Lista productos
* Lista cajas predefinidas
* Lista clientes
* Lista órdenes de compra
* Cambia el estado de las cajas personalizadas
* Lista dirección basándose en el cliente seleccionado
* */


import express from 'express';
import {
    listadoClientes,
    eliminarCliente,
    listadoOrdenesCompra,
    verPerfil,
    login,
    registrarse,
    confirmarEmail,
    recuperarContrasena,
    comprobarTokenContrasena,
    nuevaContrasena,
    logout
} from '../controller/adminController.js';

import verificarAutenticacion from '../middleware/authService.js';

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

// ** Rutas de clientes (usuarios) **

// Listado de clientes
router.get('/clientes', verificarAutenticacion, listadoClientes);

// Eliminar cliente
router.delete('/cliente/:id', verificarAutenticacion, eliminarCliente);

// ** Rutas de órdenes de compra **

// Listado de órdenes de compra
router.get('/ordenes', verificarAutenticacion, listadoOrdenesCompra);

// Cerrar sesión
router.post("/logout", verificarAutenticacion, logout);

export default router;