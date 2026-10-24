import { Router } from "express";
import { body, param, query } from "express-validator";
import { RostersController } from "../controller/RostersController.js";
import { validationError } from "../middleware/error.js";
import { verificarToken } from "../middleware/verificarToken.js";
import { duenioORoster } from "../middleware/duenioORoster.js";
/**
 * @openapi
 * components:
 *   schemas:
 *     Roster:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nombre: { type: string, example: Team Alpha }
 *         juego: { type: string, example: League of legends }
 *         tipo: { type: string, enum: [Principal, Academy] }
 *         temporada: { type: string, example: "2026" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     RosterInput:
 *       type: object
 *       required: [nombre, juego, tipo, temporada]
 *       properties:
 *         nombre: { type: string }
 *         juego: { type: string }
 *         tipo: { type: string, enum: [Principal, Academy] }
 *         temporada: { type: string }
 *     JugadorEnRoster:
 *       allOf:
 *         - $ref: '#/components/schemas/Jugador'
 *         - type: object
 *           properties:
 *             Roster_Jugador:
 *               type: object
 *               properties:
 *                 rol_en_roster: { type: string, enum: [Titular, Suplente] }
 *     RosterConJugadores:
 *       allOf:
 *         - $ref: '#/components/schemas/Roster'
 *         - type: object
 *           properties:
 *             jugadores:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JugadorEnRoster'
 *     RosterJugador:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         id_roster: { type: integer }
 *         id_jugador: { type: integer }
 *         rol_en_roster: { type: string, enum: [Titular, Suplente] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
const rosters = Router();

/**
 * @openapi
 * /rosters:
 *   get:
 *     summary: Listar rosters
 *     tags: [Rosters]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [Principal, Academy] }
 *         description: Filtrar por tipo de roster
 *       - in: query
 *         name: temporada
 *         schema: { type: string }
 *         description: Filtrar por temporada
 *     responses:
 *       200:
 *         description: Lista de rosters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Parámetros de consulta inválidos
 *       500:
 *         description: Error interno del servidor
 */
rosters.get("/",
    verificarToken,
    query("tipo").optional().isIn(["Principal","Academy"]).withMessage("este atributo solo debe contener Principal o Academy"),
    query("temporada").optional().isString().withMessage("la temporada debe ser un string"),
    validationError,
    RostersController.obtenerTodosLosRosters
)

/**
 * @openapi
 * /rosters/{id}:
 *   get:
 *     summary: Obtener un roster con sus jugadores
 *     tags: [Rosters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Roster con su lista de jugadores y el rol de cada uno en el roster
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RosterConJugadores'
 *       400:
 *         description: Id inválido
 *       404:
 *         description: El roster no existe
 *       500:
 *         description: Error interno del servidor
 */
rosters.get("/:id",
    verificarToken,
    param("id").isInt({min:1}).withMessage("Debe ser un numero positivo y entero"),
    validationError,
    RostersController.obtenerRostersJugadores
)

/**
 * @openapi
 * /rosters:
 *   post:
 *     summary: Crear un roster
 *     tags: [Rosters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RosterInput'
 *     responses:
 *       201:
 *         description: Roster creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
rosters.post("/",
    verificarToken,
    body("nombre").notEmpty().withMessage("El nombre del roster es obligatorio").isString().withMessage("debe ser un string el nombre"),
    body("juego").notEmpty().withMessage("El juego no debe estar vacio").withMessage("debe ser un string el nombre"),
    body("tipo").isIn(["Principal","Academy"]).withMessage("Solo puede ser Principal o Academy"),
    body("temporada").notEmpty().withMessage("No debe estar vacia la temporada"),
    validationError,
    RostersController.crearRoster
)

/**
 * @openapi
 * /rosters/{id}:
 *   put:
 *     summary: Actualizar un roster
 *     tags: [Rosters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RosterInput'
 *     responses:
 *       200:
 *         description: Roster actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Roster'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: El roster no existe
 *       500:
 *         description: Error interno del servidor
 */
rosters.put("/:id",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    body("nombre").notEmpty().withMessage("El nombre del roster es obligatorio").isString().withMessage("debe ser un string el nombre"),
    body("juego").notEmpty().withMessage("El juego no debe estar vacio").withMessage("debe ser un string el nombre"),
    body("tipo").isIn(["Principal","Academy"]).withMessage("Solo puede ser Principal o Academy"),
    body("temporada").notEmpty().withMessage("No debe estar vacia la temporada"),
    validationError,
    duenioORoster,
    RostersController.actualizarRoster
)

/**
 * @openapi
 * /rosters/{id}:
 *   delete:
 *     summary: Eliminar un roster
 *     description: También elimina las relaciones del roster con sus jugadores (borrado en cascada). Los jugadores no se eliminan.
 *     tags: [Rosters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Roster eliminado
 *       400:
 *         description: Id inválido
 *       404:
 *         description: El roster no existe
 *       500:
 *         description: Error interno del servidor
 */
rosters.delete("/:id",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    validationError,
    duenioORoster,
    RostersController.borrarRoster
)

/**
 * @openapi
 * /rosters/{id}/jugadores:
 *   get:
 *     summary: Listar los jugadores de un roster
 *     tags: [Rosters - Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Roster con sus jugadores y el rol de cada uno (Titular o Suplente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RosterConJugadores'
 *       400:
 *         description: Id inválido
 *       404:
 *         description: El roster no existe
 *       500:
 *         description: Error interno del servidor
 */
rosters.get("/:id/jugadores",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    validationError,
    RostersController.obtenerRostersJugadores    
)


/**
 * @openapi
 * /rosters/{id}/jugadores:
 *   post:
 *     summary: Asignar un jugador a un roster
 *     description: |
 *       Reglas de negocio:
 *       - Un roster puede tener máximo 5 titulares.
 *       - No puede haber dos titulares con el mismo rol de juego.
 *       - Un jugador no puede estar dos veces en el mismo roster.
 *     tags: [Rosters - Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_jugador, rol_en_roster]
 *             properties:
 *               id_jugador: { type: integer, minimum: 1 }
 *               rol_en_roster: { type: string, enum: [Titular, Suplente] }
 *     responses:
 *       201:
 *         description: Jugador asignado al roster
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RosterJugador'
 *       400:
 *         description: Datos inválidos, más de 5 titulares o rol de juego repetido entre titulares
 *       404:
 *         description: El roster o el jugador no existe
 *       409:
 *         description: El jugador ya está en este roster
 *       500:
 *         description: Error interno del servidor
 */
rosters.post("/:id/jugadores",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    body("id_jugador").notEmpty().withMessage("no debe estar vacio el id_jugador")
    .isInt({min:1}).withMessage("Debe ser un entero mayor a 0"),
    body("rol_en_roster").notEmpty().withMessage("no debe estar vacio el id_jugador").isIn(["Titular","Suplente"]).
    withMessage("El rol debe tener la categoria Titular o Suplente"),
    validationError,
    duenioORoster,
    RostersController.agregarJugadorARoster
)

/**
 * @openapi
 * /rosters/{id}/jugadores/{id_jugador}:
 *   put:
 *     summary: Cambiar el rol de un jugador en el roster (Titular o Suplente)
 *     description: Al pasar a Titular se aplican las mismas reglas que al asignar (máximo 5 titulares y sin roles de juego repetidos).
 *     tags: [Rosters - Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Id del roster
 *       - in: path
 *         name: id_jugador
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Id del jugador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol_en_roster]
 *             properties:
 *               rol_en_roster: { type: string, enum: [Titular, Suplente] }
 *     responses:
 *       200:
 *         description: Rol actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RosterJugador'
 *       400:
 *         description: Datos inválidos, más de 5 titulares o rol de juego repetido entre titulares
 *       404:
 *         description: El jugador no está en este roster
 *       500:
 *         description: Error interno del servidor
 */
rosters.put("/:id/jugadores/:id_jugador",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    param("id_jugador").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    body("rol_en_roster").notEmpty().withMessage("No debe estar vacio el rol").isIn(["Titular","Suplente"]).withMessage("El rol debe ser Titular o Suplente")
    ,validationError,
    duenioORoster,
    RostersController.actualizarRolesJugadores
)

/**
 * @openapi
 * /rosters/{id}/jugadores/{id_jugador}:
 *   delete:
 *     summary: Quitar un jugador del roster
 *     description: Solo elimina la relación. Ni el jugador ni el roster se eliminan.
 *     tags: [Rosters - Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Id del roster
 *       - in: path
 *         name: id_jugador
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Id del jugador
 *     responses:
 *       200:
 *         description: Jugador quitado del roster
 *       400:
 *         description: Ids inválidos
 *       404:
 *         description: El jugador no está en este roster
 *       500:
 *         description: Error interno del servidor
 */
rosters.delete("/:id/jugadores/:id_jugador",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    param("id_jugador").isInt({min:1}).withMessage("El id debe ser mayor a 0 y ser un entero"),
    validationError,
    duenioORoster,
    RostersController.eliminarJugadoresRoles
)
export default rosters;