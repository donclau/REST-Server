
# REST Server API

API REST para administrar usuarios y registrar asignaciones de productos realizadas por administradores.

**Installation of dependencies:** 

```bash
npm install
```

**Database - Configure .env file to connect with database:**
```
PORT=8080
MONGODB_CNN=mongodb+srv://<user>:<password>@miclustercafe.m0xlh.mongodb.net/CLIENTES?retryWrites=true&w=majority
MONGODB_CNN_DOCKER='mongodb://localhost:27017/Clientes'
SECRETORPRIVATEKEY=Est0EsMyPubl1cKey23@66601992
```

**Database - Execute createDocumentsForRole.js to create documents for roles in database:**

```bash
node createDocumentsForRole.js
```

**Create 300 users with the USER_ROLE role:**

```bash
node createUsers.js
```

The generated users use Gmail or Hotmail addresses and the initial password `User1234!`.

**Execute backend app:** 
```bash
npm start
```

```bash
nodemon app.js
```

## API Reference

#### Get: Get all users

```http
  GET {{url}}/api/usuarios?limite=19
```


#### Post: Create user

```http
  Post {{url}}/api/usuarios
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `nombre`      | `string` | Name of the user |
| `correo`      | `string` | Mail of the user |
| `edad`      | `int` | Age of the user |
| `password`      | `string` | Password of the user |
| `rol`      | `rol` | Rol of the user: USER_ROLE or ADMIN_ROLE|



#### Post: Log in (only with ADMIN_ROLE)

```http
  Post {{url}}/api/auth/login
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `correo`      | `string` | Mail of the user |
| `password`      | `string` | Password of the user |


#### Put: Update user

```http
  Put {{url}}/api/usuarios/{MONGO_ID of user to update}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `nombre`      | `string` | Name of the user |
| `correo`      | `string` | Mail of the user |
| `edad`      | `int` | Age of the user |
| `password`      | `string` | Password of the user |
| `rol`      | `rol` | Rol of the user: USER_ROLE or ADMIN_ROLE|

#### Delete: Delete an user (only with ADMIN_ROLE)

```http
  Delete {{url}}/api/usuarios/{MONGO_ID of user to delete}
```
| Header | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `x-token`      | `string` | Token generated when an admin log in. |

#### Post: Assign a product to a user (only with ADMIN_ROLE)

```http
  POST {{url}}/api/productos/asignaciones
```

Send the JWT in the `Authorization: Bearer <token>` header. The legacy `x-token`
header is also accepted.

```json
{
  "usuarioId": "651a2f9b8c1234567890abcd",
  "solicitudId": "SOL-2026-089",
  "nombreProducto": "Alfajor Triple Chocotorta",
  "cantidad": 2,
  "precioUnitario": 2.00
}
```

The recipient must be an active user with the `USER_ROLE` role. A successful
request returns `201 Created`, including the generated assignment ID, the
authenticated administrator ID, the calculated total, status, and creation
date. Invalid request data returns `400 Bad Request`; missing or ineligible
recipients return `404 Not Found`; authenticated users without the admin role
receive `403 Forbidden`.