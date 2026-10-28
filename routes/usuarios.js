const { Router } = require("express");

//Gran conjunto de validaciones para utilizar antes de disparar la ruta del controlador
//Si falla algo del mdw entonces no se ejecuta la ruta
const { check, query } = require("express-validator");

// const { validarCampos } = require("../middleware/validar-campos");
// const { validarJWT } = require("../middleware/validar-jwt");
// const { esAdminRole, tieneRole } = require("../middleware/validar-roles");
const {
    validarCampos,
    validarJWT,
    esAdminRole,
 } = require("../middleware");

const {usuariosGet, 
    usuariosPost, 
    usuariosDelete,
    usuariosPut,
    } = require("../controllers/usuarios");


const router = Router();

router.get('/', [
    query("limite")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limite debe ser un entero entre 1 y 100")
        .toInt(),
    query("desde")
        .optional()
        .isInt({ min: 0 })
        .withMessage("desde debe ser un entero mayor o igual a cero")
        .toInt(),
    validarCampos,
], usuariosGet);

router.put('/:id', [
    check("id", "No es un ID valido").isMongoId(),
    check("nombre")
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage("nombre debe ser una cadena no vacía"),
    check("correo")
        .optional()
        .isEmail()
        .withMessage("correo debe tener formato de email"),
    check("password")
        .optional()
        .isString()
        .isLength({ min: 6 })
        .withMessage("password debe tener al menos 6 caracteres"),
    check("rol", "No es un rol valido").isIn(["USER_ROLE", "ADMIN_ROLE", "VENTAS_ROLE"]),
    validarCampos,
], usuariosPut);

router.post('/', [
    check("correo", "El correo no es valido").isEmail(),
    check("nombre", "El nombre es obligatorio").isString().trim().notEmpty(),
    check("password", "La password debe tener al menos 6 caracteres")
        .isString()
        .isLength({min:6}),
    check("rol", "No es un rol valido").isIn(["USER_ROLE", "ADMIN_ROLE", "VENTAS_ROLE"]),
    validarCampos,
],  usuariosPost);

//Se recibe el ID (Mongo) como segmento del URL
router.delete('/:id', [  
    validarJWT,
    esAdminRole,
    check("id", "No es un ID valido").isMongoId(),
    validarCampos,
], usuariosDelete);

module.exports = router;