const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/usuario");

// 401 unauthorized

const validarJWT = async (req, res, next) => {
    const secret = process.env.SECRETORPRIVATEKEY;
    if (!secret) {
        return next(new Error("SECRETORPRIVATEKEY no está configurada."));
    }

    const authorization = req.get("authorization");
    let token = req.get("x-token");

    if (authorization) {
        const bearerToken = authorization.match(/^Bearer\s+(\S+)$/i);
        if (!bearerToken) {
            return res.status(401).json({
                ok: false,
                msg: "El encabezado Authorization debe usar el esquema Bearer"
            });
        }
        token = bearerToken[1];
    }

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "No hay token en la peticion"
        });
    }

    let uid;
    try {
        const payload = jwt.verify(token, secret, {
            algorithms: ["HS256"]
        });

        if (
            !payload ||
            typeof payload !== "object" ||
            typeof payload.uid !== "string" ||
            !mongoose.isValidObjectId(payload.uid)
        ) {
            return res.status(401).json({
                ok: false,
                msg: "Token no valido"
            });
        }

        uid = payload.uid;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ ok: false, msg: "Token expirado" });
        }

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.NotBeforeError
        ) {
            return res.status(401).json({ ok: false, msg: "Token no valido" });
        }

        return next(error);
    }

    try {
        const usuario = await Usuario.findById(uid);

        if (!usuario || !usuario.estado) {
            return res.status(401).json({
                ok: false,
                msg: "Token no valido"
            });
        }

        req.usuario = usuario;
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    validarJWT
};