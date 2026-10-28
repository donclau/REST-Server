const express = require('express');
const cors = require('cors');
const { dbConection } = require('../database/config');
const { notFound, manejarErrores } = require('../middleware/manejar-errores');

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.usuariosPath = "/api/usuarios";
        this.authPath = "/api/auth";
        this.productosPath = "/api/productos";

        // Conectar a base de datos
        this.conectarDB();

        // Middlewares: una funcion que se ejecuta antes de llamar el controlador o seguir con las ejecuciones de las peticinoes
        this.middlewares();

        // Rutas de mi aplicacion
        this.routes();
    }

    async conectarDB(){
        await dbConection();
    }

    middlewares(){
        // CORS
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json());

        // Directorio publico
        this.app.use(express.static("public"));
    }

    routes(){
        this.app.use(this.authPath, require("../routes/auth"));

        this.app.use(this.usuariosPath, require("../routes/usuarios"));

        this.app.use(this.productosPath, require("../routes/productos"));

        this.app.use(notFound);
        this.app.use(manejarErrores);
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto:", this.port)
        })
    }

}

module.exports = Server;