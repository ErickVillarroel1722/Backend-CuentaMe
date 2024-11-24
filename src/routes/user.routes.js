import express from 'express';
import {
    login,
    agregarDireccion,
    registrarse,
    verPerfil,
    logout,
    enviarOtp,
    verificarOtp,
    recuperarContrasena,
    comprobarTokenContrasena,
    nuevaContrasena
} from '../controller/user.controller.js';
import verificarAutenticacion from '../middleware/authService.js';

const router = express.Router();

/**
 * @route POST /api/usuarios/login
 * @desc Inicia sesión de usuario
 * @access Público
 */
router.post('/login', login);

/**
 * @route POST /api/usuarios/agregar-direccion-temporal
 * @desc Guarda la dirección temporalmente para el registro
 * @access Público
 */
router.post('/agregar-direccion', verificarAutenticacion, agregarDireccion);

/**
 * @route POST /api/usuarios/registro-definitivo
 * @desc Registra al usuario definitivamente combinando datos básicos y dirección
 * @access Público
 */
router.post('/registrarse', registrarse);

/**
 * @route GET /api/usuarios/perfil
 * @desc Obtiene el perfil del usuario autenticado
 * @access Privado
 */
router.get('/perfil', verificarAutenticacion, verPerfil);

/**
 * @route POST /api/usuarios/logout
 * @desc Cierra sesión del usuario autenticado
 * @access Privado
 */
router.post('/logout', verificarAutenticacion, logout);

/**
 * @route POST /api/usuarios/recuperar-contrasena
 * @desc Solicita un enlace para recuperar contraseña
 * @access Público
 */
router.post('/recuperar-contrasena', recuperarContrasena);

/**
 * @route GET /api/usuarios/recuperar-contrasena/:token
 * @desc Verifica si el token de recuperación es válido
 * @access Público
 */
router.get('/recuperar-contrasena/:token', comprobarTokenContrasena);

/**
 * @route POST /api/usuarios/recuperar-contrasena/:token
 * @desc Cambia la contraseña después de verificar el token
 * @access Público
 */
router.post('/recuperar-contrasena/:token', nuevaContrasena);

/**
 * @route POST /api/usuarios/enviar-otp
 * @desc Envía un OTP al usuario
 * @access Público
 */
router.post('/enviar-otp', enviarOtp);

/**
 * @route POST /api/usuarios/verificar-otp
 * @desc Verifica el OTP enviado al usuario
 * @access Público
 */
router.post('/verificar-otp', verificarOtp);

export default router;
