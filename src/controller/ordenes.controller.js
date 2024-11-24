import OrdenCompra from '../database/models/Actions/OrdenCompra.js';

// Crear Orden
export const crearOrden = async (req, res) => {

    const { contenido, tipoEntrega, direccion } = req.body;

    if (!contenido || !tipoEntrega) {
        return res.status(400).json({ msg: "El contenido y el tipo de entrega son obligatorios" });
    }

    try {
        // Crear una nueva orden
        const nuevaOrden = new OrdenCompra({
            usuario: req.user.id, // ID del usuario autenticado
            contenido,
            tipoEntrega,
            direccion: tipoEntrega === 'domicilio' ? direccion : null,
        });

        // Guardar la orden y calcular el total
        await nuevaOrden.save();

        res.status(201).json({ msg: "Orden creada exitosamente", orden: nuevaOrden });
    } catch (error) {
        console.error("Error al crear la orden:", error);
        res.status(500).json({ msg: "Error al crear la orden" });
    }
};

// Ver Ordenes por ID del cliente

export const verOrdenesPorCliente = async (req, res) => {
    try {
        const ordenes = await OrdenCompra.find({ usuario: req.user.id })
            .populate('contenido.cajasPredeterminadas.caja', 'nombre precio')
            .populate('contenido.cajasPersonalizadas.caja', 'nombre precioBase')
            .populate('contenido.productosIndividuales.producto', 'nombre precio')
            .populate('direccion', 'callePrincipal calleSecundaria numeroCasa referencia');

        res.status(200).json({ ordenes });
    } catch (error) {
        console.error("Error al obtener las órdenes del cliente:", error);
        res.status(500).json({ msg: "Error al obtener las órdenes" });
    }
};

// ver ordenes según ID de la orden
export const verOrdenPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const orden = await OrdenCompra.findById(id)
            .populate('contenido.cajasPredeterminadas.caja', 'nombre precio')
            .populate('contenido.cajasPersonalizadas.caja', 'nombre precioBase')
            .populate('contenido.productosIndividuales.producto', 'nombre precio')
            .populate('direccion', 'callePrincipal calleSecundaria numeroCasa referencia');

        if (!orden) {
            return res.status(404).json({ msg: "Orden no encontrada" });
        }

        res.status(200).json({ orden });
    } catch (error) {
        console.error("Error al obtener la orden:", error);
        res.status(500).json({ msg: "Error al obtener la orden" });
    }
};


// Eliminar orden
export const eliminarOrden = async (req, res) => {
    const { id } = req.params;

    try {
        const orden = await OrdenCompra.findById(id);

        if (!orden) {
            return res.status(404).json({ msg: "Orden no encontrada" });
        }

        // Verificar que la orden pertenece al usuario autenticado
        if (orden.usuario.toString() !== req.user.id) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar esta orden" });
        }

        await OrdenCompra.findByIdAndDelete(id);

        res.status(200).json({ msg: "Orden eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la orden:", error);
        res.status(500).json({ msg: "Error al eliminar la orden" });
    }
};

// ** Cambiar el estado de una orden **
export const cambiarEstadoOrden = async (req, res) => {
    const { id } = req.params; // ID de la orden a actualizar
    const { estado } = req.body; // Nuevo estado

    // Verificar que el estado proporcionado es válido
    const estadosPermitidos = ['pendiente', 'pagada', 'enviado', 'entregada', 'cancelada'];
    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ msg: 'Estado no válido' });
    }

    try {
        // Buscar la orden por ID
        const orden = await OrdenCompra.findById(id);

        // Verificar si la orden existe
        if (!orden) {
            return res.status(404).json({ msg: 'Orden no encontrada' });
        }

        // Verificar si el usuario autenticado es el dueño de la orden
        if (orden.usuario.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'No tienes permiso para modificar esta orden' });
        }

        // Actualizar el estado de la orden
        orden.estado = estado;
        await orden.save();

        res.status(200).json({ msg: 'Estado de la orden actualizado correctamente', orden });
    } catch (error) {
        console.error('Error al cambiar el estado de la orden:', error);
        res.status(500).json({ msg: 'Error al cambiar el estado de la orden' });
    }
};
