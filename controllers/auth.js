const bcryptjs = require("bcryptjs");
const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/generar-jwt");

const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo });
    const credencialesValidas = usuario
      ? await bcryptjs.compare(password, usuario.password)
      : false;

    if (!usuario || !usuario.estado || !credencialesValidas) {
      return res.status(401).json({
        ok: false,
        msg: "Correo o contraseña incorrectos",
      });
    }

    const token = await generarJWT(usuario.id);

    return res.status(200).json({
      usuario,
      token,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
};
