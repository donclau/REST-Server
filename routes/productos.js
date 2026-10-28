const { Router } = require("express");
const { body } = require("express-validator");

const { validarCampos, validarJWT, esAdminRole } = require("../middleware");
const { crearAsignacion } = require("../controllers/productos");

const router = Router();

router.post(
  "/asignaciones",
  [
    validarJWT,
    esAdminRole,
    body("usuarioId")
      .isMongoId()
      .withMessage("usuarioId debe ser un ID de MongoDB válido"),
    body("solicitudId")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("solicitudId es obligatorio"),
    body("nombreProducto")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("nombreProducto es obligatorio"),
    body("cantidad")
      .isInt({ min: 1 })
      .withMessage("cantidad debe ser un número entero mayor que cero")
      .toInt(),
    body("precioUnitario")
      .isFloat({ min: 0 })
      .withMessage("precioUnitario debe ser un número mayor o igual a cero")
      .toFloat(),
    validarCampos,
  ],
  crearAsignacion,
);

module.exports = router;
