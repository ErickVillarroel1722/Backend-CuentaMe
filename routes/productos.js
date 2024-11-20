const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para crear un producto (solo admin)
router.post('/productos', authMiddleware, async (req, res) => {
    try {
        // Solo el admin puede crear productos
        if (!req.user.isAdmin) return res.status(403).json({ message: 'Acceso denegado.' });

        const { nombre, descripcion, precio } = req.body;

        // Validar campos obligatorios
        if (!nombre || !descripcion || !precio) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Crear un nuevo producto
        const producto = new Producto({
            nombre,
            descripcion,
            precio
        });

        await producto.save();
        res.status(201).json({ message: 'Producto creado exitosamente', producto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para actualizar un producto (solo admin)
router.put('/productos/:id', authMiddleware, async (req, res) => {
    try {
        // Solo el admin puede actualizar productos
        if (!req.user.isAdmin) return res.status(403).json({ message: 'Acceso denegado.' });

        const { nombre, descripcion, precio } = req.body;
        const producto = await Producto.findByIdAndUpdate(req.params.id, {
            nombre,
            descripcion,
            precio
        }, { new: true });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: 'Producto actualizado exitosamente', producto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para eliminar un producto (solo admin)
router.delete('/productos/:id', authMiddleware, async (req, res) => {
    try {
        // Solo el admin puede eliminar productos
        if (!req.user.isAdmin) return res.status(403).json({ message: 'Acceso denegado.' });

        const producto = await Producto.findByIdAndDelete(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
