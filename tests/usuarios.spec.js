jest.mock("../models/usuario", () => ({
  findById: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  exists: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../models/role", () => ({
  exists: jest.fn(),
}));

const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const Usuario = require("../models/usuario");
const Role = require("../models/role");
const usuariosRouter = require("../routes/usuarios");
const { notFound, manejarErrores } = require("../middleware/manejar-errores");

const ADMIN_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const SECRET = "usuarios-test-secret";
const app = express();
app.use(express.json());
app.use("/api/usuarios", usuariosRouter);
app.use(notFound);
app.use(manejarErrores);

describe("HTTP status codes for user endpoints", () => {
  const originalSecret = process.env.SECRETORPRIVATEKEY;

  beforeEach(() => {
    process.env.SECRETORPRIVATEKEY = SECRET;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.SECRETORPRIVATEKEY;
    } else {
      process.env.SECRETORPRIVATEKEY = originalSecret;
    }
  });

  test("lists users with 200 OK", async () => {
    const usuarios = [{ uid: USER_ID }];
    Usuario.countDocuments.mockResolvedValue(1);
    Usuario.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(usuarios),
      }),
    });

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ total: 1, usuarios });
  });

  test("rejects invalid pagination with 400 Bad Request", async () => {
    const response = await request(app).get("/api/usuarios?limite=0");

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errores).toHaveLength(1);
    expect(Usuario.find).not.toHaveBeenCalled();
  });

  test("creates users with 201 Created", async () => {
    Role.exists.mockResolvedValue(true);
    Usuario.exists.mockResolvedValue(false);
    Usuario.create.mockResolvedValue({ uid: USER_ID, correo: "user@example.com" });

    const response = await request(app).post("/api/usuarios").send({
      nombre: "Usuario Prueba",
      correo: "user@example.com",
      password: "secreto123",
      rol: "USER_ROLE",
    });

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Usuario creado exitosamente");
    expect(Usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({ correo: "user@example.com", rol: "USER_ROLE" }),
    );
    expect(Usuario.create.mock.calls[0][0].password).not.toBe("secreto123");
  });

  test("returns 409 Conflict when the email already exists", async () => {
    Role.exists.mockResolvedValue(true);
    Usuario.exists.mockResolvedValue(true);

    const response = await request(app).post("/api/usuarios").send({
      nombre: "Usuario Prueba",
      correo: "user@example.com",
      password: "secreto123",
      rol: "USER_ROLE",
    });

    expect(response.status).toBe(409);
    expect(Usuario.create).not.toHaveBeenCalled();
  });

  test("returns 404 when an update target no longer exists", async () => {
    Role.exists.mockResolvedValue(true);
    Usuario.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/usuarios/${USER_ID}`)
      .send({ rol: "USER_ROLE" });

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Usuario no encontrado");
  });

  test("returns 404 when a delete target no longer exists", async () => {
    Usuario.findById.mockResolvedValue({
      id: ADMIN_ID,
      rol: "ADMIN_ROLE",
      estado: true,
    });
    Usuario.findByIdAndUpdate.mockResolvedValue(null);
    const token = jwt.sign({ uid: ADMIN_ID }, SECRET);

    const response = await request(app)
      .delete(`/api/usuarios/${USER_ID}`)
      .set("x-token", token);

    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Usuario no encontrado");
  });

  test("maps database failures to 500 instead of leaving the request open", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    Usuario.countDocuments.mockRejectedValue(new Error("database unavailable"));

    const response = await request(app).get("/api/usuarios");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      msg: "Error interno del servidor",
    });
  });
});
