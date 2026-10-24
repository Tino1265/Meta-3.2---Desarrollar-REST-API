import db from "../../models/index.js";

export const duenioORoster = async (req, res, next) => {
    try {
        const roster = await db.Roster.findByPk(req.params.id);
        if (!roster) {
            return res.status(404).json({ message: "El roster no existe" });
        }
        const esAdmin = req.usuario.perfil === "admin";
        const esDuenio = roster.id_usuario === req.usuario.id;
        if (!esAdmin && !esDuenio) {
            return res.status(403).json({ message: "No eres el dueño de este roster" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ errors: error.message });
    }
};