import User from '../database/models/Users/User.js';
import Address from '../database/models/Address/Address.js';
import jwt from 'jsonwebtoken';
import {sendOtpEmail, sendRecoveryPassword_UserEmail} from "../config/nodemailer.js";

// ** Registro de usuario sin dirección y envío de OTP **
export const registrarse = async (req, res) => {
    const { nombre, correo, password, telefono } = req.body;

    if (!nombre || !correo || !password || !telefono) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    try {
        // Verificar si el correo ya está registrado
        const usuarioExistente = await User.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ msg: "Este correo ya está registrado" });
        }

        // Crear OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generar OTP de 6 dígitos

        // Crear usuario temporal
        const nuevoUsuario = new User({ nombre, correo, telefono, password });
        nuevoUsuario.password = await nuevoUsuario.encryptPassword(password);
        nuevoUsuario.otp = otp;
        nuevoUsuario.isVerified = false;

        await nuevoUsuario.save();

        // Enviar OTP al correo
        await sendOtpEmail(correo, otp);

        res.status(201).json({ msg: "Usuario registrado. Se ha enviado un OTP para la verificación." });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ msg: "Error al registrar usuario" });
    }
};

// ** Iniciar sesión **
export const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ msg: "Debes proporcionar correo y contraseña" });
    }

    try {
        const usuario = await User.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (!usuario.isVerified) {
            return res.status(400).json({ msg: "Verifica tu cuenta antes de iniciar sesión" });
        }

        const verificarPassword = await usuario.matchPassword(password);

        if (!verificarPassword) {
            return res.status(400).json({ msg: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            msg: "Inicio de sesión exitoso",
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
            },
        });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ msg: "Error al iniciar sesión" });
    }
};

export const verificarOtp = async (req, res) => {
    const { correo, otp, action } = req.body;

    if (!correo || !otp || !action) {
        return res.status(400).json({ msg: "Correo, OTP y acción son obligatorios" });
    }

    try {
        const usuario = await User.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        console.log('OTP en la DB:', usuario.otp); // Muestra el OTP guardado en la DB
        console.log('OTP recibido:', otp);

        // Eliminar posibles espacios en blanco en el OTP recibido
        const otpTrimmed = otp.trim();

        // Verificar si el OTP coincide
        if (usuario.otp !== otpTrimmed) {
            return res.status(400).json({ msg: "OTP inválido" });
        }

        // Verificar si el OTP ha expirado
        if (usuario.otpExpiration < Date.now()) {
            return res.status(400).json({ msg: "El OTP ha expirado. Por favor solicita uno nuevo." });
        }

        if (action === "verifyAccount") {
            // Verificar cuenta
            if (usuario.isVerified) {
                return res.status(400).json({ msg: "Usuario ya está verificado" });
            }
            usuario.isVerified = true;
            usuario.otp = null; // Limpiar el OTP después de la verificación exitosa
            usuario.otpExpiration = null; // Limpiar la expiración del OTP
            await usuario.save();

            return res.status(200).json({ msg: "OTP verificado correctamente. Ya puedes iniciar sesión." });
        } else if (action === "resetPassword") {
            // Verificar OTP para cambio de contraseña
            return res.status(200).json({ msg: "OTP verificado correctamente. Procede a cambiar tu contraseña." });
        } else {
            return res.status(400).json({ msg: "Acción no válida" });
        }
    } catch (error) {
        console.error("Error al verificar OTP:", error);
        res.status(500).json({ msg: "Error al verificar OTP" });
    }
};

// ** Ver perfil del usuario (autenticado) **
export const verPerfil = async (req, res) => {
    try {
        const usuario = await User.findById(req.user.id)
            .select('-password -__v')
            .populate('direccion');  // Esto incluye la dirección si está asociada al usuario

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        res.status(200).json({ perfil: usuario });
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ msg: "Error al obtener perfil" });
    }
};

// ** Agregar dirección del usuario autenticado **
export const agregarDireccion = async (req, res) => {
    const { callePrincipal, calleSecundaria, numeroCasa, referencia } = req.body;

    if (!callePrincipal || !numeroCasa) {
        return res.status(400).json({ msg: "Datos incompletos: Calle principal y Número de casa son obligatorios" });
    }

    try {
        const usuarioId = req.user.id; // Se obtiene del token

        // Verificar si ya tiene una dirección
        const direccionExistente = await Address.findOne({ usuario: usuarioId });
        if (direccionExistente) {
            return res.status(400).json({ msg: "Ya tienes una dirección registrada" });
        }

        const nuevaDireccion = new Address({
            usuario: usuarioId,
            callePrincipal,
            calleSecundaria,
            numeroCasa,
            referencia,
        });

        // Guardar la nueva dirección
        await nuevaDireccion.save();

        // Ahora actualizamos el campo "direccion" del usuario con el ID de la nueva dirección
        await User.findByIdAndUpdate(usuarioId, {
            $push: { direccion: nuevaDireccion._id }
        });

        res.status(201).json({ msg: "Dirección registrada correctamente" });
    } catch (error) {
        console.error("Error al agregar dirección:", error);
        res.status(500).json({ msg: "Error al registrar la dirección" });
    }
};



// ** Recuperar contraseña **
export const recuperarContrasena = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ msg: "Debes proporcionar un correo electrónico" });
    }

    try {
        const usuarioBDD = await User.findOne({ correo });

        if (!usuarioBDD) {
            return res.status(404).json({ msg: "Correo electrónico no registrado" });
        }

        // Generar un OTP
        const otp = usuarioBDD.generarOtp(); // Genera el OTP

        // Enviar el OTP al correo del usuario
        await sendRecoveryPassword_UserEmail(correo, otp); // Envía el OTP por correo

        await usuarioBDD.save();

        res.status(200).json({ "msg": "Correo de recuperación enviado. Revisa tu bandeja de entrada." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al procesar la solicitud de recuperación de contraseña" });
    }
};

// ** Nueva contraseña **
export const nuevaContrasena = async (req, res) => {
    const { password, confirmpassword, correo } = req.body; // Asegúrate de obtener el correo desde req.body

    // Validaciones iniciales
    if (!correo) {
        return res.status(400).json({ msg: "Debe proporcionar el correo electrónico" });
    }

    if (!password || !confirmpassword) {
        return res.status(400).json({ msg: "Debes proporcionar ambas contraseñas" });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({ msg: "Las contraseñas no coinciden" });
    }

    try {
        // Buscar el usuario por correo
        const usuarioBDD = await User.findOne({ correo });

        if (!usuarioBDD) {
            return res.status(404).json({ msg: "Usuario no encontrado con el correo proporcionado" });
        }

        // Actualizar la contraseña
        usuarioBDD.password = await usuarioBDD.encryptPassword(password); // Cifra la nueva contraseña
        usuarioBDD.otp = null;
        usuarioBDD.isVerified = true; // Opcional: marcar el usuario como verificado si es necesario

        await usuarioBDD.save(); // Guardar los cambios en la base de datos

        res.status(200).json({ msg: "Contraseña cambiada correctamente. Ya puedes iniciar sesión con la nueva contraseña" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al cambiar la contraseña" });
    }
};

// ** Cerrar sesión **
export const logout = async (req, res) => {
    try {
        const usuario = await User.findById(req.user.id);

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Eliminar el token
        usuario.token = null;
        await usuario.save();

        res.status(200).json({ msg: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).json({ msg: "Error al cerrar sesión" });
    }
};

// Mecanismo e verificación OTP

// ** Enviar OTP **
export const enviarOtp = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ msg: "Debes proporcionar un correo electrónico" });
    }

    try {
        // Buscar el usuario por correo
        const usuario = await User.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Verificar si el usuario ya está verificado
        if (usuario.isVerified) {
            return res.status(400).json({ msg: "El usuario ya está verificado" });
        }

        // Generar OTP
        const otp = usuario.generarOtp();

        // Enviar correo con el OTP
        await sendOtpEmail(correo, otp); // Función que deberás crear para enviar el correo

        // Guardar el OTP y la expiración en el usuario
        await usuario.save();

        res.status(200).json({ msg: "Código OTP enviado a tu correo" });
    } catch (error) {
        console.error("Error al enviar OTP:", error);
        res.status(500).json({ msg: "Error al enviar el código OTP" });
    }
};


