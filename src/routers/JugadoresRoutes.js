import { Router } from "express";
import { validationError } from "../middleware/error.js";
import { JugadorController } from "../controller/JugadorController.js";
import { body, param, query } from "express-validator";
import db from "../../models/index.js";
import { verificarToken } from "../middleware/verificarToken.js";
/**
 * @openapi
 * components:
 *   schemas:
 *     Jugador:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nickname: { type: string, example: Faker }
 *         nombre_real: { type: string, nullable: true, example: Lee Sang-hyeok }
 *         pais: { type: string, nullable: true, example: Corea del Sur }
 *         rol: { type: string, enum: [Top, Jungle, Mid, ADC, Support] }
 *         estado: { type: string, enum: [activo, inactivo] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     JugadorInput:
 *       type: object
 *       required: [nickname, rol, estado]
 *       properties:
 *         nickname: { type: string }
 *         nombre_real: { type: string }
 *         pais: { type: string }
 *         rol: { type: string, enum: [Top, Jungle, Mid, ADC, Support] }
 *         estado: { type: string, enum: [activo, inactivo] }
 *     Error:
 *       type: object
 *       properties:
 *         message: { type: string }
 */
const jugadores = Router()
/**
 * @openapi
 * /jugadores:
 *   get:
 *     summary: Listar jugadores
 *     tags: [Jugadores]
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema: { type: string, enum: [Top, Jungle, Mid, ADC, Support] }
 *         description: Filtrar por rol
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [activo, inactivo] }
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Texto de búsqueda
 *     responses:
 *       200:
 *         description: Lista de jugadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Parámetros de consulta inválidos
 *       500:
 *         description: Error interno del servidor
 */
jugadores.get("/",
    verificarToken,
    query("rol").optional().isIn(['Top', 'Jungle', 'Mid', 'ADC', 'Support']).withMessage("El rol del filtro debe ser: Top,Jungle,ADC y Support"),
    query('estado').optional()
    .isIn(['activo', 'inactivo'])
    .withMessage('El estado del filtro debe ser "activo" o "inactivo"'),
    query("search")
    .optional()
    .trim()
    .isString()
    .withMessage('El parámetro search debe ser un texto'),
    validationError,
    JugadorController.listarJugadores
)
/**
 * @openapi
 * /jugadores/{id}:
 *   get:
 *     summary: Obtener un jugador por id
 *     tags: [Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Jugador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Id inválido
 *       404:
 *         description: El jugador no existe
 *       500:
 *         description: Error interno del servidor
 */
jugadores.get("/:id",
    verificarToken,
    param('id').isInt({min:1}).withMessage("El id debe ser numerico"),
    validationError,
    JugadorController.listarJugadoresById
)

/**
 * @openapi
 * /jugadores:
 *   post:
 *     summary: Crear un jugador
 *     tags: [Jugadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JugadorInput'
 *     responses:
 *       201:
 *         description: Jugador creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Datos inválidos o nickname ya en uso
 *       500:
 *         description: Error interno del servidor
 */
jugadores.post("/",
    verificarToken,
    body("nickname").notEmpty().withMessage("El nickname no debe estar vacio").isString().withMessage("El nickname debe ser un strint"),
    body("nombre_real").optional().isString().withMessage("Debe ser un string"),
    body("pais").optional().isString().withMessage("Debe ser un string"),
    body("rol").notEmpty().withMessage("El rol no debe estar vacio")
    .isIn(['Top', 'Jungle', 'Mid', 'ADC', 'Support']).withMessage("El rol debe ser Top, Jungle, Mid o Support"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").isIn(["activo","inactivo"]).withMessage("El estado debe ser activo o inactivo"),
    validationError,
    JugadorController.crearJugador
)
/**
 * @openapi
 * /jugadores/{id}:
 *   put:
 *     summary: Actualizar un jugador
 *     tags: [Jugadores]
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
 *             required: [rol, estado]
 *             properties:
 *               nickname: { type: string }
 *               nombre_real: { type: string }
 *               pais: { type: string }
 *               rol: { type: string, enum: [Top, Jungle, Mid, ADC, Support] }
 *               estado: { type: string, enum: [activo, inactivo] }
 *     responses:
 *       200:
 *         description: Jugador actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jugador'
 *       400:
 *         description: Datos inválidos o nickname en uso por otro jugador
 *       404:
 *         description: El jugador no existe
 *       500:
 *         description: Error interno del servidor
 */
jugadores.put("/:id",
    verificarToken,
    param("id").isInt({min:1}).withMessage("el id debe ser un entero"),
    body("nickname").optional().trim().notEmpty().withMessage("El nickname no debe estar vacio")
    .isString().withMessage("El nickname debe ser un string").custom(async (value, { req }) => {
      const jugadorExistente = await db.Jugador.findOne({ where: { nickname: value } });
      if (jugadorExistente && jugadorExistente.id !== parseInt(req.params.id)) {
        throw new Error('El nickname ya está en uso por otro jugador');
      }
      return true;
    }),
    body("nombre_real").optional().isString().withMessage("Debe ser un string"),
    body("pais").optional().isString().withMessage("Debe ser un string"),
    body("rol").notEmpty().withMessage("El rol no debe estar vacio")
    .isIn(['Top', 'Jungle', 'Mid', 'ADC', 'Support']).withMessage("El rol debe ser Top, Jungle, Mid o Support"),
    body("estado").notEmpty().withMessage("El estado no debe estar vacio").isIn(["activo","inactivo"]).withMessage("El estado debe ser activo o inactivo")
    ,validationError, JugadorController.actualizarJugador)

/**
 * @openapi
 * /jugadores/{id}:
 *   delete:
 *     summary: Eliminar un jugador
 *     description: También elimina sus relaciones con rosters (borrado en cascada). Los rosters no se eliminan.
 *     tags: [Jugadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Jugador eliminado
 *       400:
 *         description: Id inválido
 *       404:
 *         description: El jugador no existe
 *       500:
 *         description: Error interno del servidor
 */
jugadores.delete("/:id",
    verificarToken,
    param("id").isInt({min:1}).withMessage("El id debe ser un entero"),
    validationError,
    JugadorController.eliminarJugador
)
export default jugadores;