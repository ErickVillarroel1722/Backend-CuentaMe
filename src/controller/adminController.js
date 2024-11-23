import Product from "../database/models/Objects/Product.js";
import Caja from "../database/models/Objects/Box.js"
import Usuario from "../database/models/Users/User.js"
import OrdenCompra from "../database/models/Actions/OrdenCompra.js";
import Administrador from "../database/models/Users/Administrator.js";
import {sendMailToAdmin, sendRecoveryPassword_AdminEmail} from '../config/nodemailer.js';
import jwt from "jsonwebtoken";
import cloudinary from "../services/cloudinary.js";

// ** Crear Producto **
export const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio } = req.body;
        let imagenUrl = null;

        // Verificar si ya existe un producto con el mismo nombre (puedes agregar más validaciones si es necesario)
        const productoExistente = await Product.findOne({ nombre });
        if (productoExistente) {
            return res.status(400).json({ msg: 'El producto con este nombre ya existe.' });
        }

        // Crear el nuevo producto sin la imagen inicialmente
        const nuevoProducto = new Product({
            nombre,
            descripcion,
            precio,
            imagen: null, // Sin imagen al principio
        });

        // Guardar el nuevo producto en la base de datos para generar el _id
        await nuevoProducto.save();

        // Si hay una imagen en la solicitud, sube la imagen a Cloudinary
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `productos/${nuevoProducto._id}`, // Usar el _id generado por MongoDB
                overwrite: true, // Sobrescribir si ya existe una imagen con ese nombre
            });

            // La URL de la imagen será la URL proporcionada por Cloudinary
            imagenUrl = uploadResponse.secure_url;

            // Actualizar el producto con la URL de la imagen
            nuevoProducto.imagen = imagenUrl;
            await nuevoProducto.save();  // Guardar el producto nuevamente con la URL de la imagen
        } else {
            return res.status(400).json({ msg: 'No se ha recibido ninguna imagen' });
        }

        // Devolver la respuesta con el producto creado
        res.status(201).json({ msg: 'Producto creado exitosamente', producto: nuevoProducto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear producto' });
    }
};

// ** Actualizar Producto **
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio } = req.body;
        let imagenUrl = null;

        // Buscar el producto por ID
        const productoExistente = await Product.findById(id);
        if (!productoExistente) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        // Actualizar los campos que se pasen
        productoExistente.nombre = nombre || productoExistente.nombre;
        productoExistente.descripcion = descripcion || productoExistente.descripcion;
        productoExistente.precio = precio || productoExistente.precio;

        // Si se sube una nueva imagen, la subimos a Cloudinary
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cuenta_me/productos/${id}`,  // Usamos el ID del producto como parte del nombre
                overwrite: true,
            });
            imagenUrl = uploadResponse.secure_url;
            productoExistente.imagen = imagenUrl;
        }

        // Guardar el producto actualizado
        await productoExistente.save();

        // Responder con el producto actualizado
        res.status(200).json({ msg: "Producto actualizado exitosamente", producto: productoExistente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar producto" });
    }
};


// ** Eliminar Producto **
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const productoExistente = await Product.findById(id);
        if (!productoExistente) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        await productoExistente.remove();
        res.status(200).json({ msg: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar producto" });
    }
};

// ** Ver listado de Productos **
export const listadoProductos = async (req, res) => {
    try {
        const productos = await Product.find();
        res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los productos" });
    }
};

// ** Crear Caja **
export const crearCaja = async (req, res) => {
    try {
        const { nombre, tipo, dimensiones, colores, decorado, extras } = req.body;
        let imagenUrl = null;

        // Verificar si ya existe una caja con el mismo nombre
        const cajaExistente = await Caja.findOne({ nombre });
        if (cajaExistente) {
            return res.status(400).json({ msg: 'La caja con este nombre ya existe.' });
        }

        // Verificar si la caja es personalizable y si tiene los campos necesarios
        if (tipo === 'personalizable') {
            if (!dimensiones) {
                return res.status(400).json({ msg: 'Las dimensiones son obligatorias para cajas personalizables.' });
            }
            if (!colores) {
                return res.status(400).json({ msg: 'Los colores son obligatorios para cajas personalizables.' });
            }
            if (!decorado) {
                return res.status(400).json({ msg: 'El campo decorado es obligatorio para cajas personalizables.' });
            }
        }

        // Crear la nueva caja sin la imagen inicialmente
        const nuevaCaja = new Caja({
            nombre,
            tipo,
            dimensiones,
            colores,
            decorado,
            extras,
            totalPrecio: 0.00,
            imagen: null,  // Sin imagen al principio
        });

        // Guardar la nueva caja en la base de datos para generar el _id
        await nuevaCaja.save();

        // Si se proporciona una imagen, subirla a Cloudinary
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cajas/${nuevaCaja._id}`,  // Usar el _id generado por MongoDB
                overwrite: true,  // Sobrescribir si ya existe una imagen con ese nombre
            });

            // La URL de la imagen será la URL proporcionada por Cloudinary
            imagenUrl = uploadResponse.secure_url;

            // Actualizar la caja con la URL de la imagen
            nuevaCaja.imagen = imagenUrl;
            await nuevaCaja.save();  // Guardar el producto nuevamente con la URL de la imagen
        } else {
            return res.status(400).json({ msg: 'No se ha recibido ninguna imagen' });
        }

        // Responder con la caja creada y su imagen
        res.status(201).json({ msg: 'Caja creada exitosamente', caja: nuevaCaja });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear caja' });
    }
};


// ** Actualizar Caja **
export const actualizarCaja = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precioBase, stock } = req.body;
        let imagenUrl = null;

        // Buscar la caja por ID
        const cajaExistente = await Caja.findById(id);
        if (!cajaExistente) {
            return res.status(404).json({ msg: "Caja no encontrada" });
        }

        // Verificar si la caja es predefinida antes de permitir la actualización
        if (cajaExistente.tipo !== 'predefinida') {
            return res.status(400).json({ msg: "Solo las cajas predefinidas pueden ser actualizadas" });
        }

        // Actualizar los campos
        cajaExistente.nombre = nombre || cajaExistente.nombre;
        cajaExistente.descripcion = descripcion || cajaExistente.descripcion;
        cajaExistente.precioBase = precioBase || cajaExistente.precioBase;
        cajaExistente.stock = stock || cajaExistente.stock;

        // Si se sube una nueva imagen, subirla a Cloudinary
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                public_id: `cajas/${id}`,  // Usamos el ID de la caja como nombre
                overwrite: true,
            });
            imagenUrl = uploadResponse.secure_url;
            cajaExistente.imagen = imagenUrl;
        }

        // Guardar la caja actualizada
        await cajaExistente.save();

        // Responder con la caja actualizada
        res.status(200).json({ msg: "Caja actualizada exitosamente", caja: cajaExistente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar caja" });
    }
};

// ** Eliminar Caja **
export const eliminarCaja = async (req, res) => {
    try {
        const { id } = req.params;

        const cajaExistente = await Caja.findById(id);
        if (!cajaExistente) {
            return res.status(404).json({ msg: "Caja no encontrada" });
        }

        await cajaExistente.remove();
        res.status(200).json({ msg: "Caja eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar caja" });
    }
};

// ** Ver listado de Cajas **
export const listadoCajas = async (req, res) => {
    try {
        const cajas = await Caja.find();
        res.status(200).json({ cajas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las cajas" });
    }
};

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