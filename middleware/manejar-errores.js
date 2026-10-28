const mongoose = require("mongoose");

const notFound = (req, res) => {
  return res.status(404).json({
    ok: false,
    msg: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

const manejarErrores = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let status = 500;
  let msg = "Error interno del servidor";
  let detalles;

  if (error.type === "entity.parse.failed" || error instanceof mongoose.Error.CastError) {
    status = 400;
    msg = "La solicitud contiene datos inválidos";
  } else if (error instanceof mongoose.Error.ValidationError) {
    status = 400;
    msg = "Error de validación";
    detalles = Object.values(error.errors).map(({ message }) => message);
  } else if (error.code === 11000) {
    status = 409;
    msg = "Ya existe un registro con esos datos";
  } else if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    status = error.status;
    msg = status === 413
      ? "El cuerpo de la solicitud es demasiado grande"
      : "La solicitud no pudo ser procesada";
  }

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({
    ok: false,
    msg,
    ...(detalles && { errores: detalles }),
  });
};

module.exports = {
  notFound,
  manejarErrores,
};
