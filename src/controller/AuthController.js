import bcrypt from 'bcrypt'
import crypto from "crypto"
import jwt from 'jsonwebtoken'
import db from '../../models/index.js'
import { where } from "sequelize";
const generarTokenCSRF = () => crypto.randomBytes(32).toString("hex"); 

const opcionesCookie = ()=> ({
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE)
})

export class AuthController {
    static register = async(req,res)=>{
        try{
            const {nombre,email,password} = req.body;
            const existente = await db.Usuario.findOne({
                where: {email}
            })

            if (existente) {
                return res.status(409).json({ message: "El email ya está registrado" });
            }
            const hash = await bcrypt.hash(password,10);
            const usuario =  await db.Usuario.create({nombre,email,password:hash});
            return res.status(201).json({
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                perfil: usuario.perfil
            });
        }catch(error) {
            return res.status(500).json({ errors: error.message });
        }
    }
    static login = async (req, res) => {
        try {
            const { email, password } = req.body;

            const usuario = await db.Usuario.findOne({ where: { email } });

            // Mismo mensaje en todos los casos para no revelar si el email existe
            const credencialesValidas =
                usuario && usuario.activo && await bcrypt.compare(password, usuario.password);
            if (!credencialesValidas) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const csrfToken = generarTokenCSRF();
            const tokenJWT = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil, csrfToken },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.cookie("jwt_token", tokenJWT, { ...opcionesCookie(), httpOnly: true });
            res.cookie("csrf_token", csrfToken, opcionesCookie());

            return res.status(200).json({
                message: "Login exitoso",
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    perfil: usuario.perfil
                },
                csrfToken
            });
        } catch (error) {
            return res.status(500).json({ errors: error.message });
        }
    }
    static logout = async (req, res) => {
        res.clearCookie("jwt_token");
        res.clearCookie("csrf_token");
        return res.status(200).json({ message: "Sesión cerrada" });
    }
    static me = async (req, res) => {
        try {
            const usuario = await db.Usuario.findByPk(req.usuario.id, {
                attributes: ['id', 'nombre', 'email', 'perfil']
            });
            if (!usuario) return res.status(401).json({ message: "No autenticado" });
            return res.status(200).json(usuario);
        } catch (error) {
            return res.status(500).json({ errors: error.message });
        }
    }
}

