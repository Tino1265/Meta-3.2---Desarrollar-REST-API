import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controller/AuthController.js";
import { validationError } from "../middleware/error.js";
import { verificarToken } from "../middleware/verificarToken.js";
const auth = Router();

auth.post("/register",
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("email").trim().isEmail().withMessage("Debe ser un email válido").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    validationError,
    AuthController.register
)
auth.get("/me", verificarToken, AuthController.me)
auth.post("/login",
    body("email").trim().isEmail().withMessage("Debe ser un email válido").normalizeEmail(),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    validationError,
    AuthController.login
)

auth.post("/logout", verificarToken, AuthController.logout)

export default auth;