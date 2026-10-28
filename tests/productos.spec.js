jest.mock("../models/usuario", () => ({
  findById: jest.fn(),
}));

jest.mock("../models/producto-asignacion", () => ({
  create: jest.fn(),
}));

const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const Usuario = require("../models/usuario");
const ProductoAsignacion = require("../models/producto-asignacion");
const productosRouter = require("../routes/productos");

const ADMIN_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439012";
const ASIGNACION_ID = "507f1f77bcf86cd799439013";
const SECRET = "productos-test-secret";
const app = express();
app.use(express.json());
app.use("/api/productos", productosRouter);

const crearToken = (uid) => jwt.sign({ uid }, SECRET);

const solicitudAsignacion = (token, body = {}) =>
  request(app)
    .post("/api/productos/asignaciones")
    .set("Authorization", `Bearer ${token}`)
    .send({
      usuarioId: USER_ID,
      solicitudId: "SOL-2026-089",
      nombreProducto: "Alfajor Triple Chocotorta",
      cantidad: 2,
      precioUnitario: 2,
      ...body,
    });

describe("POST /api/productos/asignaciones", () => {
  const originalSecret = process.env.SECRETORPRIVATEKEY;

  beforeEach(() => {
    process.env.SECRETORPRIVATEKEY = SECRET;
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.SECRETORPRIVATEKEY;
    } else {
      process.env.SECRETORPRIVATEKEY = originalSecret;
    }
  });

  test("crea la asignación y toma administradorId del token", async () => {
    const administrador = { id: ADMIN_ID, rol: "ADMIN_ROLE", estado: true };
    const destinatario = { id: USER_ID, rol: "USER_ROLE", estado: true };
    Usuario.findById.mockImplementation((id) =>
      Promise.resolve(id === ADMIN_ID ? administrador : destinatario),
    );
    ProductoAsignacion.create.mockImplementation(async (data) => ({
      ...data,
      _id: ASIGNACION_ID,
      id: ASIGNACION_ID,
      estado: "PENDIENTE",
      fechaCreacion: new Date("2026-10-27T14:30:00.000Z"),
    }));

    const response = await solicitudAsignacion(crearToken(ADMIN_ID), {
      administradorId: USER_ID,
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      msg: "Producto asignado exitosamente al usuario",
      asignacion: {
        id: ASIGNACION_ID,
        solicitudId: "SOL-2026-089",
        administradorId: ADMIN_ID,
        usuarioId: USER_ID,
        nombreProducto: "Alfajor Triple Chocotorta",
        cantidad: 2,
        precioUnitario: 2,
        precioTotal: 4,
        estado: "PENDIENTE",
        fechaCreacion: "2026-10-27T14:30:00.000Z",
      },
    });
    expect(ProductoAsignacion.create).toHaveBeenCalledWith(
      expect.objectContaining({ administradorId: ADMIN_ID }),
    );
  });

  test("rechaza con 403 a un usuario que no es administrador", async () => {
    Usuario.findById.mockResolvedValue({
      id: USER_ID,
      rol: "USER_ROLE",
      estado: true,
    });

    const response = await solicitudAsignacion(crearToken(USER_ID));

    expect(response.status).toBe(403);
    expect(ProductoAsignacion.create).not.toHaveBeenCalled();
  });

  test("rechaza con 400 un cuerpo inválido", async () => {
    Usuario.findById.mockResolvedValue({
      id: ADMIN_ID,
      rol: "ADMIN_ROLE",
      estado: true,
    });

    const response = await solicitudAsignacion(crearToken(ADMIN_ID), {
      cantidad: 0,
    });

    expect(response.status).toBe(400);
    expect(ProductoAsignacion.create).not.toHaveBeenCalled();
  });

  test("rechaza con 404 un destinatario no elegible", async () => {
    Usuario.findById.mockImplementation((id) =>
      Promise.resolve(id === ADMIN_ID
        ? { id: ADMIN_ID, rol: "ADMIN_ROLE", estado: true }
        : null),
    );

    const response = await solicitudAsignacion(crearToken(ADMIN_ID));

    expect(response.status).toBe(404);
    expect(ProductoAsignacion.create).not.toHaveBeenCalled();
  });
});
