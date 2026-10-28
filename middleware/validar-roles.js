const esAdminRole = (req, res, next) => {
    if (!req.usuario) {
        return next(new Error("Debe validar el JWT antes de verificar el rol."));
    }

    if (req.usuario.rol !== "ADMIN_ROLE") {
        return res.status(403).json({
            ok: false,
            msg: "No tiene permisos para realizar esta acción"
        });
    }

    return next();
};

const tieneRole = (...roles) => (req, res, next) => {
    if (!req.usuario) {
        return next(new Error("Debe validar el JWT antes de verificar el rol."));
    }

    if (!roles.includes(req.usuario.rol)) {
        return res.status(403).json({
            ok: false,
            msg: `El servicio requiere uno de estos roles: ${roles.join(", ")}`
        });
    }

    return next();
};

module.exports = {
    esAdminRole,
    tieneRole
};