export const soloAdmin = (req, res, next) => {
    if (req.usuario.perfil !== "admin") {
        return res.status(403).json({ message: "Solo un administrador puede hacer esto" });
    }
    next();
};