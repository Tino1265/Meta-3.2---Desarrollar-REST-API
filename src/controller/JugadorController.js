import { Op, where } from "sequelize";
import db from "../../models/index.js"
export class JugadorController {
    static listarJugadores = async (req, res) => {
        try {
            const { rol, estado, search } = req.query;
            const whereConditions = {};

            if (rol) whereConditions.rol = rol;
            if (estado) whereConditions.estado = estado;

            if (search) {
                whereConditions.nickname = {
                    [Op.like]: `%${search}%`
                };
            }

            // Rosters pertenecientes al usuario autenticado
            const rosters = await db.Roster.findAll({
                where: { id_usuario: req.usuario.id },
                attributes: ["id"],
                raw: true
            });

            const rosterIds = rosters.map(roster => roster.id);

            if (rosterIds.length === 0) {
                return res.status(200).json([]);
            }

            // Jugadores relacionados con esos rosters
            const relaciones = await db.Roster_Jugador.findAll({
                where: {
                    id_roster: { [Op.in]: rosterIds }
                },
                attributes: ["id_jugador"],
                raw: true
            });

            const jugadorIds = [
                ...new Set(relaciones.map(relacion => relacion.id_jugador))
            ];

            if (jugadorIds.length === 0) {
                return res.status(200).json([]);
            }

            const jugadores = await db.Jugador.findAll({
                where: {
                    ...whereConditions,
                    id: { [Op.in]: jugadorIds }
                }
            });

            return res.status(200).json(jugadores);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
    static listarJugadoresById = async (req,res)=>{
        try{
            const {id} = req.params;
            if(isNaN(id) || undefined){
                return res.status(400).json({error:"El id debe ser un entero"})
            }
            const jugadoresById = await db.Jugador.findByPk(id);
            if (!jugadoresById) {
                return res.status(404).json({ 
                mensaje: `No se encontró ningún jugador con el ID ${id}` 
                });
            }
            res.status(200).json(jugadoresById)
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
    static crearJugador = async(req,res) => {
        try {
            const {nickname,nombre_real,pais,rol,estado} = req.body;
            const nickRepetido = await db.Jugador.findOne({
                where: {nickname}
            })
            if(nickRepetido){
                return res.status(409).json("El nickname ya esta registrado intenca con otro")
            }
            const nuevoJugador = await db.Jugador.create({
                nickname,
                nombre_real,
                pais,
                rol,
                estado
            })

            return res.status(201).json(nuevoJugador);
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
    static actualizarJugador = async(req,res)=>{
        try{
            const { id } = req.params;
            const { nickname, nombre_real, pais, rol, estado } = req.body;
            const jugador = await db.Jugador.findByPk(id);
            if(!jugador) {
                return res.status(404).json({mensaje: `No se encontro ningun jugador con el id ${id}`})
            }
            await jugador.update({
                nickname: nickname ?? jugador.nickname,
                nombre_real: nombre_real ?? jugador.nombre_real,
                pais: pais ?? jugador.pais,
                rol: rol ?? jugador.rol,
                estado: estado ?? jugador.estado
            });

            return res.status(200).json(jugador);
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
    static eliminarJugador= async(req,res)=>{
        try{
            const {id} = req.params;
            const jugador = await db.Jugador.findByPk(id);
            if(!jugador) {
                return res.status(404).json({message:`No se encontro el usuario con el id ${id}`})
            }
            jugador.destroy();
            return res.status(204).json("Eliminado exitosamente")
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
}