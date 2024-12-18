import User from '../database/models/Users/User.js';
import Address from '../database/models/Address/Address.js';
import jwt from 'jsonwebtoken';
import {sendOtpEmail, sendRecoveryPassword_UserEmail} from "../config/nodemailer.js";

// ** Registro de usuario sin dirección y envío de OTP **
export const registrarse = async (req, res) => {
    const { nombre, correo, password, telefono, direccion } = req.body;

    if (!nombre || !correo || !password || !telefono || !direccion) {
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
        const nuevoUsuario = new User({ nombre, correo, telefono, password, direccion });
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

export const agregarDireccion = async (req, res) => {
    const { alias, parroquia, callePrincipal, calleSecundaria, numeroCasa, referencia, isDefault } = req.body;

    if (!callePrincipal || !numeroCasa) {
        return res.status(400).json({ msg: "Datos incompletos: Calle principal y Número de casa son obligatorios" });
    }

    try {
        const usuarioId = req.user.id; // Se obtiene del token

        // Verificar cuántas direcciones tiene el usuario
        const direccionesUsuario = await Address.find({ usuario: usuarioId });
        if (direccionesUsuario.length >= 5) {
            return res.status(400).json({ msg: "Has alcanzado el límite máximo de 5 direcciones" });
        }

        // Verificar si ya existe una dirección con el mismo número de casa
        const direccionDuplicada = direccionesUsuario.find(
            direccion => direccion.numeroCasa === numeroCasa
        );
        if (direccionDuplicada) {
            return res.status(400).json({ msg: "Ya tienes una dirección registrada con este número de casa" });
        }

        // Si la nueva dirección es predeterminada, asegúrate de desmarcar las demás como predeterminadas
        if (isDefault) {
            // Desmarcar todas las demás direcciones del usuario como predeterminadas
            await Address.updateMany({ usuario: usuarioId }, { isDefault: false });
        }

        // Crear una nueva dirección
        const nuevaDireccion = new Address({
            usuario: usuarioId,
            alias,
            parroquia,
            callePrincipal,
            calleSecundaria,
            numeroCasa,
            referencia,
            isDefault: isDefault, // Establecer si es predeterminada
        });

        // Guardar la nueva dirección
        await nuevaDireccion.save();

        // Actualizar el campo "direccion" del usuario con el ID de la nueva dirección
        await User.findByIdAndUpdate(usuarioId, {
            $push: { direccion: nuevaDireccion._id }
        });

        res.status(201).json({ msg: "Dirección registrada correctamente", direccion: nuevaDireccion });
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

// ** Eliminar dirección del usuario autenticado **
export const eliminarDireccion = async (req, res) => {
    const { direccionId } = req.params; // ID de la dirección que se desea eliminar

    try {
        // Verificar si el direccionId es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(direccionId)) {
            return res.status(400).json({ msg: "ID de dirección no válido" });
        }

        // Convertir el direccionId a ObjectId
        const direccion = await Address.findById(direccionId);

        // Verificar si la dirección existe
        if (!direccion) {
            return res.status(404).json({ msg: "Dirección no encontrada" });
        }

        // Verificar si la dirección pertenece al usuario autenticado
        if (direccion.usuario.toString() !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar esta dirección" });
        }

        // Eliminar la dirección
        await Address.findByIdAndDelete(direccionId);

        // Eliminar la dirección en el array de direcciones del usuario
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { direccion: direccionId }
        });

        res.status(200).json({ msg: "Dirección eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la dirección:", error);
        res.status(500).json({ msg: "Error al eliminar la dirección" });
    }
};

// ** Actualizar dirección del usuario autenticado **
export const actualizarDireccion = async (req, res) => {
    const { direccionId } = req.params; // ID de la dirección que se desea actualizar
    const { alias, parroquia, callePrincipal, calleSecundaria, numeroCasa, referencia } = req.body;

    // Validar si los datos obligatorios están presentes
    if (!callePrincipal || !numeroCasa) {
        return res.status(400).json({ msg: "Calle principal y Número de casa son obligatorios" });
    }

    try {
        // Verificar si la dirección existe
        const direccion = await Address.findById(direccionId);
        if (!direccion) {
            return res.status(404).json({ msg: "Dirección no encontrada" });
        }

        // Verificar si la dirección pertenece al usuario autenticado
        if (direccion.usuario.toString() !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para actualizar esta dirección" });
        }

        // Actualizar la dirección con los nuevos datos
        direccion.alias = alias || direccion.alias;
        direccion.parroquia = parroquia || direccion.parroquia;
        direccion.callePrincipal = callePrincipal || direccion.callePrincipal;
        direccion.calleSecundaria = calleSecundaria || direccion.calleSecundaria;
        direccion.numeroCasa = numeroCasa || direccion.numeroCasa;
        direccion.referencia = referencia || direccion.referencia;

        await direccion.save();

        res.status(200).json({ msg: "Dirección actualizada correctamente", direccion });
    } catch (error) {
        console.error("Error al actualizar la dirección:", error);
        res.status(500).json({ msg: "Error al actualizar la dirección" });
    }
};

export const actualizarDireccionPredeterminada = async (req, res) => {
    const { direccionId } = req.params;
    const { isDefault } = req.body;

    if (typeof isDefault !== 'boolean') {
        return res.status(400).json({ msg: "El campo 'isDefault' debe ser un valor booleano (true o false)" });
    }

    try {
        const usuarioId = req.user.id; // Se obtiene del token

        // Verificar si la dirección pertenece al usuario
        const direccion = await Address.findOne({ _id: direccionId, usuario: usuarioId });
        if (!direccion) {
            return res.status(404).json({ msg: "La dirección no existe o no pertenece al usuario" });
        }

        // Si se marca como predeterminada, actualizar las demás a `isDefault: false`
        if (isDefault) {
            await Address.updateMany(
                { usuario: usuarioId },
                { $set: { isDefault: false } }
            );
        }

        // Actualizar el campo isDefault de la dirección específica
        direccion.isDefault = isDefault;
        await direccion.save();

        res.status(200).json({ msg: "Dirección actualizada correctamente", direccion });
    } catch (error) {
        console.error("Error al actualizar el campo isDefault:", error);
        res.status(500).json({ msg: "Error al actualizar el campo isDefault" });
    }
};

