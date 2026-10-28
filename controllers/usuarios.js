const bcrypt = require("bcryptjs");

const Usuario = require("../models/usuario");
const Role = require("../models/role");

const usuariosGet = async (req, res, next) => {
  try {
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query).skip(Number(desde)).limit(Number(limite)),
    ]);

    return res.status(200).json({
      total,
      usuarios,
    });
  } catch (error) {
    return next(error);
  }
};

const usuariosPost = async (req, res, next) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    const rolExiste = await Role.exists({ rol });
    if (!rolExiste) {
      return res.status(400).json({
        ok: false,
        msg: "El rol indicado no está registrado",
      });
    }

    const correoExiste = await Usuario.exists({ correo });
    if (correoExiste) {
      return res.status(409).json({
        ok: false,
        msg: "Ya existe un usuario con ese correo",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      nombre,
      correo,
      password: passwordHash,
      rol,
    });

    return res.status(201).json({
      msg: "Usuario creado exitosamente",
      usuario,
    });
  } catch (error) {
    return next(error);
  }
};

const usuariosDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true, runValidators: true },
    );

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Usuario desactivado exitosamente",
      usuario,
      usuarioAutenticado: req.usuario,
    });
  } catch (error) {
    return next(error);
  }
};

const usuariosPut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, password, google, __v, ...resto } = req.body;

    const rolExiste = await Role.exists({ rol: resto.rol });
    if (!rolExiste) {
      return res.status(400).json({
        ok: false,
        msg: "El rol indicado no está registrado",
      });
    }

    if (password) {
      resto.password = await bcrypt.hash(password, 10);
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto, {
      new: true,
      runValidators: true,
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Usuario actualizado exitosamente",
      usuario,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  usuariosGet,
  usuariosPost,
  usuariosDelete,
  usuariosPut,
};
