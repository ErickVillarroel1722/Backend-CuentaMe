import Product from '../database/models/Objects/Product.js';
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

// ** Listar Producto por ID **
export const listarProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el producto por su ID
        const producto = await Product.findById(id);

        // Verificar si el producto existe
        if (!producto) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }

        // Devolver el producto encontrado
        res.status(200).json({ producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el producto" });
    }
};