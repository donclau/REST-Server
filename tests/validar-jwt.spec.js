const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const { validarJWT } = require("../middleware/validar-jwt");

describe("validarJWT", () => {
  const originalSecret = process.env.SECRETORPRIVATEKEY;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalSecret === undefined) {
      delete process.env.SECRETORPRIVATEKEY;
    } else {
      process.env.SECRETORPRIVATEKEY = originalSecret;
    }
  });

  const crearRespuesta = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const crearRequest = (token) => ({
    get: jest.fn((header) => (header === "x-token" ? token : undefined)),
  });

  test("responde 401 cuando el token expiró", async () => {
    process.env.SECRETORPRIVATEKEY = "test-secret";
    const token = jwt.sign({ uid: "usuario-id" }, process.env.SECRETORPRIVATEKEY, {
      expiresIn: -1,
    });
    const req = crearRequest(token);
    const res = crearRespuesta();
    const next = jest.fn();

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      msg: "Token expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rechaza un token sin el claim uid esperado", async () => {
    process.env.SECRETORPRIVATEKEY = "test-secret";
    const token = jwt.sign({ uid: "not-an-object-id" }, process.env.SECRETORPRIVATEKEY);
    jest.spyOn(Usuario, "findById");
    const req = crearRequest(token);
    const res = crearRespuesta();
    const next = jest.fn();

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      msg: "Token no valido",
    });
    expect(Usuario.findById).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("continúa con el usuario cuando el token es válido", async () => {
    process.env.SECRETORPRIVATEKEY = "test-secret";
    const uid = "507f1f77bcf86cd799439011";
    const token = jwt.sign({ uid }, process.env.SECRETORPRIVATEKEY);
    const usuario = { estado: true };
    jest.spyOn(Usuario, "findById").mockResolvedValue(usuario);
    const req = crearRequest(token);
    const res = crearRespuesta();
    const next = jest.fn();

    await validarJWT(req, res, next);

    expect(Usuario.findById).toHaveBeenCalledWith(uid);
    expect(req.usuario).toBe(usuario);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("pasa errores de base de datos al manejador de errores", async () => {
    process.env.SECRETORPRIVATEKEY = "test-secret";
    const uid = "507f1f77bcf86cd799439011";
    const token = jwt.sign({ uid }, process.env.SECRETORPRIVATEKEY);
    const error = new Error("Database unavailable");
    jest.spyOn(Usuario, "findById").mockRejectedValue(error);
    const req = crearRequest(token);
    const res = crearRespuesta();
    const next = jest.fn();

    await validarJWT(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
