const Usuario = require("../models/usuario");
const ProductoAsignacion = require("../models/producto-asignacion");

const crearAsignacion = async (req, res, next) => {
  try {
    const {
      usuarioId,
      solicitudId,
      nombreProducto,
      cantidad,
      precioUnitario,
    } = req.body;

    const destinatario = await Usuario.findById(usuarioId);
    if (!destinatario || !destinatario.estado || destinatario.rol !== "USER_ROLE") {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró un usuario activo elegible para recibir la asignación",
      });
    }

    const precioUnitarioRedondeado = Number(Number(precioUnitario).toFixed(2));
    const asignacion = await ProductoAsignacion.create({
      solicitudId,
      administradorId: req.usuario.id,
      usuarioId: destinatario.id,
      nombreProducto,
      cantidad,
      precioUnitario: precioUnitarioRedondeado,
      precioTotal: Number((cantidad * precioUnitarioRedondeado).toFixed(2)),
    });

    return res.status(201).json({
      ok: true,
      msg: "Producto asignado exitosamente al usuario",
      asignacion: {
        id: asignacion.id || String(asignacion._id),
        solicitudId: asignacion.solicitudId,
        administradorId: String(asignacion.administradorId),
        usuarioId: String(asignacion.usuarioId),
        nombreProducto: asignacion.nombreProducto,
        cantidad: asignacion.cantidad,
        precioUnitario: asignacion.precioUnitario,
        precioTotal: asignacion.precioTotal,
        estado: asignacion.estado,
        fechaCreacion: asignacion.fechaCreacion,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crearAsignacion,
};
