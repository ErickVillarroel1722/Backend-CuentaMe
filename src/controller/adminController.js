import Product from "../database/models/Objects/Product.js";
import Caja from "../database/models/Objects/Box.js"
import Usuario from "../database/models/Users/User.js"
import OrdenCompra from "../database/models/Actions/OrdenCompra.js";
import Administrador from "../database/models/Users/Administrator.js";
import { sendMailToAdmin } from '../config/nodemailer.js';
import cloudinary from "../services/cloudinary.js";
import jwt from "jsonwebtoken";

// ** Crear Producto **
export const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        const image = req.file ? req.file.path : null;

        const nuevoProducto = new Product({
            nombre,
            descripcion,
            precio,
            stock,
            imagen: image,
        });

        await nuevoProducto.save();
        res.status(201).json({ msg: "Producto creado exitosamente", producto: nuevoProducto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al crear producto" });
    }
};

// ** Actualizar Producto **
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;
        const image = req.file ? req.file.path : null;

        const productoExistente = await Product.findById(id);
        if (!productoExistente) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        productoExistente.nombre = nombre || productoExistente.nombre;
        productoExistente.descripcion = descripcion || productoExistente.descripcion;
        productoExistente.precio = precio || productoExistente.precio;
        productoExistente.stock = stock || productoExistente.stock;
        if (image) productoExistente.imagen = image;

        await productoExistente.save();
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
        const { nombre, descripcion, precio, stock } = req.body;
        const image = req.file ? req.file.path : null;

        const nuevaCaja = new Caja({
            nombre,
            descripcion,
            precio,
            stock,
            imagen: image,
        });

        await nuevaCaja.save();
        res.status(201).json({ msg: "Caja creada exitosamente", caja: nuevaCaja });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al crear caja" });
    }
};

// ** Actualizar Caja **
export const actualizarCaja = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;
        const image = req.file ? req.file.path : null;

        const cajaExistente = await Caja.findById(id);
        if (!cajaExistente) {
            return res.status(404).json({ msg: "Caja no encontrada" });
        }

        cajaExistente.nombre = nombre || cajaExistente.nombre;
        cajaExistente.descripcion = descripcion || cajaExistente.descripcion;
        cajaExistente.precio = precio || cajaExistente.precio;
        cajaExistente.stock = stock || cajaExistente.stock;
        if (image) cajaExistente.imagen = image;

        await cajaExistente.save();
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
export const verPerfil = async (req, res) => {
    try {
        const admin = await Administrador.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }
        res.status(200).json({ perfil: admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener perfil de administrador" });
    }
};

// ** Iniciar sesión **
export const login = async (req, res) => {
    try {
        // Extrae el correo y password de la solicitud
        const { correo, password } = req.body;

        // Verifica si algún campo del cuerpo de la solicitud está vacío
        if (Object.values(req.body).includes("")) {
            return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        // Busca un administrador en la base de datos por su correo
        const adminBDD = await Administrador.findOne({ correo }).select("-status -__v -token -updatedAt -createdAt");

        // Verifica si no se encontró ningún administrador con el correo proporcionado
        if (!adminBDD) {
            return res.status(404).json({ msg: "Lo sentimos, correo o contraseña incorrectos" });
        }

        // Verifica si la contraseña proporcionada no coincide con la almacenada en la base de datos
        const verificarPassword = await adminBDD.matchPassword(password);
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, correo o contraseña incorrectos" });
        }

        // Verifica si el administrador no ha confirmado su correo
        if (adminBDD.confirmEmail === false) {
            return res.status(403).json({ msg: "Lo sentimos, debe verificar su cuenta" });
        }

        // Genera un token JWT para el administrador autenticado
        const payload = { id: adminBDD._id, rol: adminBDD.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Extrae algunos campos del administrador para la respuesta
        const { nombre, telefono, _id } = adminBDD;

        // Responde con el token JWT y la información del administrador
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
}

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

// ** Recuperar Contraseña **
export const recuperarContraseña = async (req, res) => {
    const { correo } = req.body;
    try {
        const admin = await Administrador.findOne({ correo });
        if (!admin) {
            return res.status(404).json({ msg: "Administrador no encontrado" });
        }

        // Aquí puedes agregar la lógica para enviar un correo con el link para recuperar la contraseña

        res.status(200).json({ msg: "Te hemos enviado un correo para recuperar tu contraseña" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al recuperar contraseña" });
    }
};
