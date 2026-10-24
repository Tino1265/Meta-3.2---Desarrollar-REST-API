import db from "../../models/index.js"
export class RostersController {
    static obtenerTodosLosRosters = async(req,res)=>{
        try {
            const {tipo,temporada} = req.query
            const whereConditions = {}
            if(tipo) {
                whereConditions.tipo = tipo
            }
            if(temporada) {
                whereConditions.temporada = temporada
            }
            const rosters = await db.Roster.findAll({
                where: whereConditions
            })
            if(rosters.length == 0){
                return res.status(400).json("No hay Jugadores")
            }
            return res.status(200).json(rosters);
        } catch (error) {
            res.status(500).json({errors:error.message})
        }
    }
    static obtenerRostersJugadores = async(req,res)=> {
        try {
            const {id} = req.params;
            const roster = await db.Roster.findByPk(id,{
                include: [{
                    model: db.Jugador,
                    as: 'jugadores',
                }]
            })
            if(!roster){
                return res.status(400).json({message: "No existe el roster especificado"})
            }
            return res.status(200).json(roster)
        } catch (error) {
            res.status(500).json({errors:error.message})
        }
    }
    static crearRoster = async (req,res) => {
        try {
            const {nombre,juego,tipo,temporada} = req.body;
            const nuevoRoster = await db.Roster.create({
                nombre,
                juego,
                tipo,
                temporada,
                id_usuario: req.usuario.id
            })
            return res.status(200).json(nuevoRoster)
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
    static actualizarRoster = async (req,res) => {
        try {
            const {id} = req.params;
            const {nombre,juego,tipo,temporada} = req.body;
            const rosterExistente = await db.Roster.findByPk(id);
            if(!rosterExistente){
                return res.status(404).json({message: "No se encontro el roster"})
            }
            const actualizacion = await rosterExistente.update({
                nombre: nombre ?? rosterExistente.nombre,
                juego: juego ?? rosterExistente.juego,
                tipo: tipo ?? rosterExistente.tipo,
                temporada: temporada ?? rosterExistente.temporada
            })

            return res.status(200).json(actualizacion)
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
    static borrarRoster = async (req,res) => {
        try {
            const {id} = req.params;
            const rosterAEliminar = await db.Roster.findByPk(id);
            if(!rosterAEliminar){
                return res.status(404).json({message:"no se encontro el roster"})
            }
            await rosterAEliminar.destroy();
            return res.status(200).json("Eliminado Correctamente")
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
    static agregarJugadorARoster = async(req,res)=> {
        try {
            const {id} = req.params;
            const {id_jugador,rol_en_roster} = req.body;
            const jugadorExistente = await db.Jugador.findByPk(id_jugador);
            const roster = await db.Roster.findByPk(id);
            if (!roster) {
                return res.status(404).json({ message: "El roster no existe" });
            }
            if(!jugadorExistente){
                return res.status(404).json({message:"El jugador no existe"})
            }
            const yaAsignado = await db.Roster_Jugador.findOne({
                where: { id_roster: id, id_jugador }
            });
            if (yaAsignado) {
                return res.status(409).json({ message: "El jugador ya está en este roster" });
            }
            if (rol_en_roster === "Titular") {
                const titulares = await db.Roster_Jugador.findAll({
                    where: { id_roster:id, rol_en_roster: "Titular" },
                    include: [{ model: db.Jugador, attributes: ['rol'] }]
                });
                if (titulares.length >= 5) {
                    return res.status(400).json({ message: "El roster solo puede tener máximo 5 titulares" });
                }
                if (titulares.some(t => t.Jugador.rol === jugadorExistente.rol)) {
                    return res.status(400).json({message:"Ya hay un titular con el mismo rol"});
                }
            }
            const relacion = await db.Roster_Jugador.create({
                id_roster: id,
                id_jugador,
                rol_en_roster
            });
            return res.status(201).json(relacion);
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
    static actualizarRolesJugadores = async (req,res)=>{
        try {
            const {id_jugador,id} = req.params;
            const {rol_en_roster} = req.body;
            const jugadorExistente = await db.Roster_Jugador.findOne({
                where: {id_jugador,id_roster:id}
            })
            if(!jugadorExistente){
                return res.status(404).json({message:"No existe el jugador"})
            }
            if(rol_en_roster === "Titular" && jugadorExistente.rol_en_roster !== "Titular"){
                const jugador = await db.Jugador.findByPk(id_jugador);
                const titulares = await db.Roster_Jugador.findAll({
                    where: { id_roster:id, rol_en_roster: "Titular" },
                    include: [{ model: db.Jugador, attributes: ['rol'] }]
                });
                if (titulares.length >= 5) {
                    return res.status(400).json({ message: "El roster solo puede tener máximo 5 titulares" });
                }
                if (titulares.some(t => t.Jugador.rol === jugador.rol)) {
                    return res.status(400).json({message:"Ya hay un titular con el mismo rol"});
                }
            }
            await jugadorExistente.update(
                {
                    id_roster: id,
                    id_jugador,
                    rol_en_roster
                }
            )
            return res.status(200).json(jugadorExistente)
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
    static eliminarJugadoresRoles = async (req,res) =>{
        try {
            const {id,id_jugador} = req.params;
            const jugadorRoster = await db.Roster_Jugador.findOne({
                where: {id_roster:id,id_jugador}
            })
            if(!jugadorRoster){
                return res.status(404).json({message:"El roster o el jugador no tienen una relacion o no existen"})
            }
            await jugadorRoster.destroy();
            return res.status(200).json("Eliminado Correctamente")
        } catch (error) {
            return res.status(500).json({errors:error.message})
        }
    }
}