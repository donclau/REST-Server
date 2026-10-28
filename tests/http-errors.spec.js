const express = require("express");
const request = require("supertest");
const { notFound, manejarErrores } = require("../middleware/manejar-errores");

const app = express();
app.use(express.json());
app.get("/internal-error", (req, res, next) => next(new Error("db details")));
app.get("/conflict", (req, res, next) => next({ code: 11000 }));
app.use(notFound);
app.use(manejarErrores);

describe("HTTP error handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns 404 JSON for unknown endpoints", async () => {
    const response = await request(app).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      ok: false,
      msg: "Ruta no encontrada: GET /missing",
    });
  });

  test("maps duplicate database keys to 409 without leaking details", async () => {
    const response = await request(app).get("/conflict");

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      ok: false,
      msg: "Ya existe un registro con esos datos",
    });
  });

  test("returns 400 JSON for malformed JSON bodies", async () => {
    const response = await request(app)
      .post("/missing")
      .set("Content-Type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      msg: "La solicitud contiene datos inválidos",
    });
  });

  test("returns a generic 500 and logs unexpected errors", async () => {
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(app).get("/internal-error");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      msg: "Error interno del servidor",
    });
    expect(JSON.stringify(response.body)).not.toContain("db details");
    expect(errorLog).toHaveBeenCalled();
  });
});
