# Backend REST API – Rosters y Jugadores

API REST para gestionar **jugadores** y **rosters** de un equipo de eSports (League of Legends). Un roster tiene muchos jugadores y un jugador puede pertenecer a varios rosters (relación muchos a muchos), con el rol dentro del roster (`Titular` o `Suplente`) guardado en la tabla intermedia.

## Tecnologías

- Node.js (ES Modules)
- Express
- Sequelize + sequelize-cli (migraciones y seeders)
- express-validator
- swagger-jsdoc + swagger-ui-express (documentación)
- dotenv

## Requisitos previos

- Node.js 18 o superior
- npm
- Un servidor de base de datos compatible con Sequelize (MySQL, PostgreSQL, etc.) con una base de datos creada

## Instalación

1. Clona el repositorio e ingresa a la carpeta:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd backend-rest-api-roster
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo `.env` en la raíz del proyecto con tus datos (ajusta los nombres de las variables a los que lea tu `config/`):

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nombre_de_la_base
   ```

   > El archivo `.env` contiene credenciales y no debe subirse al repositorio. Verifica que esté en `.gitignore`.

4. Ejecuta las migraciones para crear las tablas (`Jugadores`, `Rosters` y `Roster_Jugadores`):

   ```bash
   npx sequelize-cli db:migrate
   ```

5. (Opcional) Carga los datos de ejemplo, si tienes seeders:

   ```bash
   npx sequelize-cli db:seed:all
   ```

## Ejecución

```bash
node src/index.js
```

Si tienes un script en `package.json`, también puedes usar `npm start` o `npm run dev`.

El servidor queda disponible en `http://localhost:3000` (o el puerto que definas en `PORT`).

## Documentación interactiva (Swagger)

Con el servidor en marcha, abre:

```
http://localhost:3000/docs
```

Desde ahí puedes ver todos los endpoints, sus parámetros y respuestas, y probarlos con el botón **Try it out**.

## Estructura del proyecto

```
backend-rest-api-roster/
├── config/          # Configuración de la base de datos (sequelize-cli)
├── migrations/      # Migraciones de las tablas
├── models/          # Modelos de Sequelize
├── seeders/         # Datos de ejemplo
├── src/
│   ├── controller/  # Lógica de cada endpoint
│   ├── middleware/  # Manejo de errores de validación
│   ├── routers/     # Rutas y validaciones (con documentación Swagger)
│   ├── index.js     # Punto de entrada: levanta el servidor
│   └── server.js    # Configuración de Express, rutas y Swagger
├── .env
└── package.json
```

## Endpoints

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verifica que la API y la base de datos responden |

### Jugadores

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/jugadores` | Lista jugadores. Filtros opcionales: `rol`, `estado`, `search` |
| GET | `/jugadores/:id` | Obtiene un jugador por id |
| POST | `/jugadores` | Crea un jugador |
| PUT | `/jugadores/:id` | Actualiza un jugador |
| DELETE | `/jugadores/:id` | Elimina un jugador (y sus relaciones con rosters) |

### Rosters

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/rosters` | Lista rosters. Filtros opcionales: `tipo`, `temporada` |
| GET | `/rosters/:id` | Obtiene un roster con sus jugadores |
| POST | `/rosters` | Crea un roster |
| PUT | `/rosters/:id` | Actualiza un roster |
| DELETE | `/rosters/:id` | Elimina un roster (y sus relaciones con jugadores) |

### Jugadores de un roster

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/rosters/:id/jugadores` | Lista los jugadores de un roster |
| POST | `/rosters/:id/jugadores` | Asigna un jugador al roster |
| PUT | `/rosters/:id/jugadores/:id_jugador` | Cambia el rol del jugador en el roster (Titular/Suplente) |
| DELETE | `/rosters/:id/jugadores/:id_jugador` | Quita al jugador del roster |

## Valores permitidos

| Campo | Valores |
|---|---|
| `rol` (jugador) | `Top`, `Jungle`, `Mid`, `ADC`, `Support` |
| `estado` (jugador) | `activo`, `inactivo` |
| `tipo` (roster) | `Principal`, `Academy` |
| `rol_en_roster` | `Titular`, `Suplente` |

## Reglas de negocio

- Un roster puede tener **máximo 5 titulares**.
- **No puede haber dos titulares con el mismo rol de juego** (`Top`, `Jungle`, `Mid`, `ADC`, `Support`) en un mismo roster.
- Un jugador no puede asignarse dos veces al mismo roster.
- El `nickname` de un jugador debe ser único.
- Al eliminar un roster se eliminan sus relaciones con jugadores, pero **no los jugadores**. Al eliminar un jugador se eliminan sus relaciones, pero **no los rosters**.

## Ejemplos de uso

### Crear un jugador

```http
POST /jugadores
Content-Type: application/json

{
  "nickname": "Faker",
  "nombre_real": "Lee Sang-hyeok",
  "pais": "Corea del Sur",
  "rol": "Mid",
  "estado": "activo"
}
```

### Crear un roster

```http
POST /rosters
Content-Type: application/json

{
  "nombre": "Team Alpha",
  "juego": "League of legends",
  "tipo": "Principal",
  "temporada": "2026"
}
```

### Asignar un jugador a un roster

```http
POST /rosters/1/jugadores
Content-Type: application/json

{
  "id_jugador": 1,
  "rol_en_roster": "Titular"
}
```

### Cambiar el rol del jugador en el roster

```http
PUT /rosters/1/jugadores/1
Content-Type: application/json

{
  "rol_en_roster": "Suplente"
}
```

### Consultar un roster con sus jugadores

```http
GET /rosters/1
```

Respuesta (ejemplo):

```json
{
  "id": 1,
  "nombre": "Team Alpha",
  "juego": "League of legends",
  "tipo": "Principal",
  "temporada": "2026",
  "jugadores": [
    {
      "id": 1,
      "nickname": "Faker",
      "rol": "Mid",
      "Roster_Jugador": { "rol_en_roster": "Titular" }
    }
  ]
}
```

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Datos inválidos o regla de negocio incumplida |
| 404 | Recurso no encontrado |
| 409 | Conflicto (por ejemplo, el jugador ya está en el roster) |
| 500 | Error interno del servidor |
| 503 | Base de datos no disponible (`/health`) |