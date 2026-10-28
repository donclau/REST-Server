const { Schema, model } = require("mongoose");

const ProductoAsignacionSchema = new Schema({
  solicitudId: {
    type: String,
    required: true,
    trim: true,
  },
  administradorId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  nombreProducto: {
    type: String,
    required: true,
    trim: true,
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isInteger,
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0,
  },
  precioTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  estado: {
    type: String,
    enum: ["PENDIENTE", "ENTREGADO"],
    default: "PENDIENTE",
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("ProductoAsignacion", ProductoAsignacionSchema);
