import { Op } from "sequelize";
import db from "../../models/index.js";

const creadorJugador = {
    model: db.Usuario,
    as: "creador",
    attributes: ["id", "nombre"]
};

const propietarioRoster = {
    model: db.Usuario,
    as: "usuario",
    attributes: ["id", "nombre"]
};

export class PublicoController {
    static jugadores = async (req, res) => {
        try {
            const { rol, estado, search } = req.query;
            const where = {};

            if (rol) where.rol = rol;
            if (estado) where.estado = estado;
            if (search) {
                where.nickname = { [Op.like]: `%${search}%` };
            }

            const jugadores = await db.Jugador.findAll({
                where,
                include: [creadorJugador]
            });

            return res.json(jugadores);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    static rosters = async (req, res) => {
        try {
            const { tipo, temporada } = req.query;
            const where = {};

            if (tipo) where.tipo = tipo;
            if (temporada) where.temporada = temporada;

            const rosters = await db.Roster.findAll({
                where,
                include: [propietarioRoster]
            });

            return res.json(rosters);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    static detalleRoster = async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isSafeInteger(id) || id < 1) {
                return res.status(400).json({
                    message: "El id debe ser un entero positivo"
                });
            }

            const roster = await db.Roster.findByPk(id, {
                include: [
                    propietarioRoster,
                    {
                        model: db.Jugador,
                        as: "jugadores",
                        include: [creadorJugador]
                    }
                ]
            });

            if (!roster) {
                return res.status(404).json({
                    message: "Roster no encontrado"
                });
            }

            return res.json(roster);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}