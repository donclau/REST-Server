require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Usuario = require("./models/usuario");

const nombres = [
  "Agustina", "Alejandro", "Camila", "Diego", "Florencia", "Gabriel",
  "Lucia", "Mateo", "Milagros", "Nicolas", "Sofia", "Tomas",
  "Valentina", "Benjamin", "Catalina", "Facundo", "Julieta", "Lautaro",
  "Renata", "Santiago", "Daniela", "Eduardo", "Fernanda", "Joaquin",
  "Mariana", "Pablo", "Paola", "Rodrigo", "Sebastian", "Thiago",
];

const apellidos = [
  "Alvarez", "Benitez", "Castro", "Diaz", "Fernandez", "Flores",
  "Gonzalez", "Herrera", "Jimenez", "Lopez", "Mamani", "Mendoza",
  "Morales", "Perez", "Quispe", "Ramirez", "Rojas", "Romero",
  "Sanchez", "Torres", "Vargas", "Vasquez", "Aguirre", "Cabrera",
  "Cardozo", "Gutierrez", "Medina", "Silva", "Suarez", "Villalba",
];

const crearUsuarios = async () => {
  const mongoUri = process.env.MONGODB_CNN_DOCKER || process.env.MONGODB_CNN;
  if (!mongoUri) {
    throw new Error("Debe configurar MONGODB_CNN_DOCKER o MONGODB_CNN en .env");
  }

  await mongoose.connect(mongoUri);

  try {
    const usuarios = await Promise.all(
      Array.from({ length: 300 }, async (_, indice) => {
        const nombre = nombres[indice % nombres.length];
        const apellido = apellidos[Math.floor(indice / nombres.length)];
        const dominio = indice % 2 === 0 ? "gmail.com" : "hotmail.com";
        const correo = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${String(indice + 1).padStart(3, "0")}@${dominio}`;
        const password = await bcrypt.hash("User1234!", 10);

        return {
          nombre: `${nombre} ${apellido}`,
          correo,
          password,
          rol: "USER_ROLE",
        };
      }),
    );

    await Usuario.insertMany(usuarios);
    console.log("Se crearon 300 usuarios con rol USER_ROLE.");
    console.log("Contraseña inicial para todos los usuarios: User1234!");
  } finally {
    await mongoose.disconnect();
  }
};

crearUsuarios().catch((error) => {
  console.error("No se pudieron crear los usuarios:", error);
  process.exitCode = 1;
});
