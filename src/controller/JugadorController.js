import { Op } from "sequelize";
import db from "../../models/index.js"
export class JugadorController {
    static listarJugadores = async (req, res) => {
        try {
            const { rol, estado, search } = req.query;
            const whereConditions = {};

            whereConditions.id_usuario = req.usuario.id;


            if (rol) whereConditions.rol = rol;
            if (estado) whereConditions.estado = estado;

            if (search) {
                whereConditions.nickname = {
                    [Op.like]: `%${search}%`
                };
            }

            const jugadores = await db.Jugador.findAll({
                where: whereConditions,
                include: [{
                    model: db.Usuario,
                    as: "creador",
                    attributes: ["id", "nombre"]
                }]
            });

            return res.status(200).json(jugadores);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    static listarJugadoresById = async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isSafeInteger(id) || id < 1) {
                return res.status(400).json({
                    error: "El id debe ser un entero positivo"
                });
            }

            const whereConditions = { id };
            whereConditions.id_usuario = req.usuario.id;


            const jugador = await db.Jugador.findOne({
                where: whereConditions,
                include: [{
                    model: db.Usuario,
                    as: "creador",
                    attributes: ["id", "nombre"]
                }]
            });

            if (!jugador) {
                return res.status(404).json({
                    mensaje: "Jugador no encontrado"
                });
            }

            return res.status(200).json(jugador);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
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
                estado,
                id_usuario: req.usuario.id
            });

            return res.status(201).json(nuevoJugador);
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
    static actualizarJugador = async(req,res)=>{
        try{
            const { id } = req.params;
            const { nickname, nombre_real, pais, rol, estado } = req.body;
            const jugador = await db.Jugador.findOne({
                where: { id, id_usuario: req.usuario.id }
            });
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
            const jugador = await db.Jugador.findOne({
                where: { id, id_usuario: req.usuario.id }
            });
            if(!jugador) {
                return res.status(404).json({message:`No se encontro el usuario con el id ${id}`})
            }
            await jugador.destroy();
            return res.status(204).end();
        }catch(e){
            return res.status(500).json({error:e.message})
        }
    }
}
