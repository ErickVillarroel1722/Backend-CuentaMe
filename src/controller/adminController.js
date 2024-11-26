import Usuario from "../database/models/Users/User.js"
import OrdenCompra from "../database/models/Actions/OrdenCompra.js";
import Administrador from "../database/models/Users/Administrator.js";
import {sendMailToAdmin, sendRecoveryPassword_AdminEmail} from '../config/nodemailer.js';
import jwt from "jsonwebtoken";

// ** Ver listado de Clientes (Usuarios) **
export const listadoClientes = async (req, res) => {
    try {
        const clientes = await Usuario.find();
        res.status(200).json({ clientes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los clientes" });
    }
};

// ** Eliminar Cliente **
export const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const clienteExistente = await Usuario.findById(id);
        if (!clienteExistente) {
            return res.status(404).json({ msg: "Cliente no encontrado" });
        }

        await clienteExistente.remove();
        res.status(200).json({ msg: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar cliente" });
    }
};

// ** Ver listado de Órdenes de Compra **
export const listadoOrdenesCompra = async (req, res) => {
    try {
        const ordenes = await OrdenCompra.find();
        res.status(200).json({ ordenes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las órdenes de compra" });
    }
};

// ** Ver Perfil de Administrador **
export const verPerfil = (req, res) => {
    try {
        const admin = req.user; // El administrador ya está en req.user gracias al middleware
        res.status(200).json({ perfil: admin });
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ msg: "Error al obtener perfil de administrador" });
    }
};

// ** Iniciar sesión **
export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        const adminBDD = await Administrador.findOne({ correo }).select("-status -__v -updatedAt -createdAt");

        if (!adminBDD) {
            return res.status(404).json({ msg: "Lo sentimos, el administrador no existe." });
        }

        const verificarPassword = await adminBDD.matchPassword(password);
        if (!verificarPassword) {
            return res.status(400).json({ msg: "Lo sentimos, correo o contraseña incorrectos" });
        }

        if (adminBDD.confirmEmail === false) {
            return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" });
        }

        const payload = { id: adminBDD._id, rol: adminBDD.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Guardar el token en la base de datos
        adminBDD.token = token;
        await adminBDD.save();

        const { nombre, telefono, _id } = adminBDD;

        res.status(200).json({
            token,
            nombre,
            telefono,
            _id,
            correo: adminBDD.correo,
            rol: adminBDD.rol
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al iniciar sesión" });
    }
};

// ** Registarse **
export const registrarse = async (req, res) => {
    // Desestructuramos los campos del cuerpo de la solicitud
    const { nombre, correo, password, telefono } = req.body;

    // Verificamos si algún campo está vacío
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Verificamos si el correo ya está registrado en la base de datos
        const adminExistente = await Administrador.findOne({ correo });
        if (adminExistente) {
            return res.status(400).json({ msg: "Este correo ya está registrado" });
        }

        // Creamos una instancia de Administrador
        const nuevoAdmin = new Administrador({ nombre, correo, telefono });

        // Encriptamos la contraseña antes de guardarla
        nuevoAdmin.password = await nuevoAdmin.encrypPassword(password);

        // Generamos un token de confirmación (suponiendo que tienes un método crearToken)
        const token = nuevoAdmin.crearToken();

        // Enviamos el correo de confirmación al nuevo administrador
        try {
            await sendMailToAdmin(correo, token);
            console.log("Correo de confirmación enviado correctamente");
        } catch (error) {
            console.error("Error al enviar el correo de confirmación:", error);
            return res.status(500).json({ msg: "Error al enviar el correo de confirmación. Por favor, intente nuevamente más tarde." });
        }

        // Guardamos el nuevo administrador en la base de datos
        await nuevoAdmin.save();

        // Respondemos con un mensaje indicando que el correo de confirmación fue enviado
        res.status(200).json({ msg: "Mensaje de confirmación enviado correctamente al nuevo administrador" });
        console.log("Registro de administrador completado");

    } catch (error) {
        console.error("Error al registrar el administrador:", error);
        return res.status(500).json({ msg: "Error al registrarse. Por favor, intente nuevamente más tarde." });
    }
};

// **Confirmar correo electrónico**
export const confirmarEmail = async (req, res) => {
    try {
        console.log("Comenzando confirmación de token");

        // Verifica si no se proporcionó un token en los parámetros de la solicitud
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
        }

        console.log("Buscando administrador mediante token");

        // Busca un administrador en la base de datos por el token proporcionado
        const adminBDD = await Administrador.findOne({ token });

        // Verifica si no se encontró ningún administrador con el token proporcionado
        if (!adminBDD) {
            return res.status(404).json({ msg: "La cuenta ya ha sido confirmada o el token no es válido" });
        }

        // Actualiza el token y el estado de confirmación de la cuenta del administrador
        adminBDD.token = null;
        adminBDD.confirmEmail = true;
        await adminBDD.save();

        console.log("Confirmación modificada en la base de datos");

        // Responde con un mensaje indicando que el token ha sido confirmado
        res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
        console.log("Token confirmado exitosamente");
    } catch (error) {
        console.error("Error al confirmar el email:", error);
        res.status(500).json({ msg: "Error al confirmar la cuenta. Por favor, intente nuevamente más tarde." });
    }
};

// ** Recuperar Contraseña **
export const recuperarContrasena = async (req, res) => {
    const { correo } = req.body; // Extrae el email de la solicitud

    console.log("Email recibido:", correo); // Verifica que el email se reciba correctamente

    // Validar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Buscar al administrador en la base de datos por email
        const adminBDD = await Administrador.findOne({ correo });

        // Verificar si no se encontró el administrador
        if (!adminBDD) {
            return res.status(404).json({ msg: "Lo sentimos, correo incorrecto o no se encuentra registrado" });
        }

        // Generar token para la recuperación de contraseña
        const token = adminBDD.crearToken();
        adminBDD.token = token;

        // Enviar correo electrónico con el token de recuperación
        await sendRecoveryPassword_AdminEmail(correo, token);  // Revisa si el email es correcto aquí
        await adminBDD.save();

        // Responder con un mensaje
        res.status(200).json({ msg: "Revisa tu correo electrónico para restablecer tu cuenta" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar la solicitud" });
    }
};

// Confirmación de Token para recuperación de contraseña
export const comprobarTokenContrasena = async (req, res) => {
    const { token } = req.params; // Extrae el token de los parámetros de la solicitud

    // Validar si no se proporcionó el token
    if (!token) {
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    try {
        // Buscar al administrador en la base de datos por token
        const adminBDD = await Administrador.findOne({ token });

        // Verificar si el token proporcionado coincide
        if (adminBDD?.token !== token) {
            return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
        }

        // Responder con mensaje de confirmación
        res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nueva contraseña" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al verificar el token" });
    }
};

// Cambio de contraseña mediante evaluación del token de acceso
export const nuevaContrasena = async (req, res) => {
    const { password, confirmpassword } = req.body; // Extrae la nueva contraseña y la confirmación
    const { token } = req.params; // Extrae el token de los parámetros de la solicitud

    // Validar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmpassword) {
        return res.status(404).json({ msg: "Lo sentimos, las contraseñas no coinciden" });
    }

    try {
        // Buscar al administrador en la base de datos por token
        const adminBDD = await Administrador.findOne({ token });

        // Verificar si el token proporcionado coincide
        if (adminBDD?.token !== token) {
            return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
        }

        // Actualizar la contraseña y borrar el token
        adminBDD.token = null;
        adminBDD.password = await adminBDD.encrypPassword(password); // Encriptar la nueva contraseña
        await adminBDD.save();

        // Responder con mensaje de éxito
        res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nueva contraseña" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al cambiar la contraseña" });
    }
};

// ** Cerrar sesión **
export const logout = async (req, res) => {
    try {
        const adminId = req.user.id; // Obtener el ID del administrador autenticado

        // Buscar al administrador en la base de datos
        const adminBDD = await Administrador.findById(adminId);

        if (!adminBDD) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }

        // Eliminar el token del administrador
        adminBDD.token = null;
        await adminBDD.save();

        res.status(200).json({ msg: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).json({ msg: "Error al cerrar sesión" });
    }
};