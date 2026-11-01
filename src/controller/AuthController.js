import bcrypt from 'bcrypt'
import crypto from "crypto"
import jwt from 'jsonwebtoken'
import db from '../../models/index.js'
import { OAuth2Client } from "google-auth-library";

const crearClienteGoogle = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error(
            "Falta GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI"
        );
    }

    return new OAuth2Client(clientId, clientSecret, redirectUri);
};

const generarTokenCSRF = () => crypto.randomBytes(32).toString("hex"); 

const opcionesCookie = ()=> ({
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE)
})

const urlFrontend = (ruta = "/") => `${process.env.FRONTEND_URL}${ruta}`;
const falloGoogle = (res, mensaje) =>
    res.redirect(urlFrontend(`/login?error=${encodeURIComponent(mensaje)}`));

const iniciarSesion = (res, usuario) => {
    const csrfToken = generarTokenCSRF();
    const tokenJWT = jwt.sign(
        { id: usuario.id, perfil: usuario.perfil, csrfToken },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.cookie("jwt_token", tokenJWT, { ...opcionesCookie(), httpOnly: true });
    res.cookie("csrf_token", csrfToken, opcionesCookie());
};


export class AuthController {
    static googleLogin = (req, res) => {
        const clienteGoogle = crearClienteGoogle();
        // "state" protege el flujo contra peticiones falsas
        const state = crypto.randomBytes(16).toString("hex");
        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",          // "strict" no se enviaría al volver desde Google
            maxAge: 10 * 60 * 1000
        });

        const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

        if (!redirectUri) {
            return res.status(500).json({
                message: "GOOGLE_REDIRECT_URI no está cargada en el backend"
            });
        }

        const url = clienteGoogle.generateAuthUrl({
            redirect_uri: redirectUri,
            access_type: "online",
            scope: ["openid", "email", "profile"],
            state,
            prompt: "select_account"
        });

        console.log(
            "redirect_uri enviada:",
            new URL(url).searchParams.get("redirect_uri")
        );
        const parametros = new URL(url).searchParams;

        console.log("Google OAuth:", {
            client_id: parametros.get("client_id"),
            redirect_uri: parametros.get("redirect_uri"),
        });
        return res.redirect(url);
    }

    static googleCallback = async (req, res) => {
        
        try {
            const clienteGoogle = crearClienteGoogle();

            const { code, state, error } = req.query;
            const estadoGuardado = req.cookies.oauth_state;
            res.clearCookie("oauth_state");

            if (error) return falloGoogle(res, "Se canceló el inicio de sesión con Google");
            if (!code || !state || state !== estadoGuardado) {
                return falloGoogle(res, "Solicitud de inicio de sesión inválida");
            }

            // Cambia el código por tokens y verifica la firma del id_token
            const { tokens } = await clienteGoogle.getToken(code);
            const ticket = await clienteGoogle.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const datos = ticket.getPayload();

            if (!datos?.email || !datos.email_verified) {
                return falloGoogle(res, "Tu cuenta de Google no tiene el correo verificado");
            }

            const email = datos.email.trim().toLowerCase();
            let usuario = await db.Usuario.findOne({ where: { email } });

            if (!usuario) {
                // Cuenta nueva: perfil "usuario" por defecto. La contraseña es aleatoria,
                // así que esta cuenta solo puede entrar con Google.
                const hash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
                usuario = await db.Usuario.create({
                    nombre: datos.name || email,
                    email,
                    password: hash
                });
            }

            if (!usuario.activo) return falloGoogle(res, "Tu cuenta está desactivada");

            iniciarSesion(res, usuario);
            return res.redirect(urlFrontend("/"));
        } catch (error) {
            console.error("Error en callback de Google:", error.message);
            return falloGoogle(res, "No se pudo completar el login con Google");
        }
    }
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

