import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
    const token = req.cookies.jwt_token;
    if (!token) {
        return res.status(401).json({ message: "No autenticado" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const esLectura = ["GET", "HEAD", "OPTIONS"].includes(req.method);
        if (!esLectura && (typeof payload.csrfToken !== "string" ||
            !payload.csrfToken || req.headers["x-csrf-token"] !== payload.csrfToken)) {
            return res.status(403).json({ message: "Token CSRF inválido" });
        }

        req.usuario = payload;   
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};