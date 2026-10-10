import express from "express"
import dotenv from "dotenv"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import jugadores from "./routers/JugadoresRoutes.js";
import rosters from "./routers/RostersRoutes.js";
dotenv.config()
const server = express();

const spec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: { title: "API de Rosters", version: "1.0.0" }
    },
    apis: ["./src/routers/*.js"]   
})

server.use("/docs", swaggerUi.serve, swaggerUi.setup(spec))
server.use(express.json())
server.use("/jugadores",jugadores)
server.use("/rosters",rosters)
server.get("/roles",(req,res)=>{
    res.status(200).json({rolesValidos:["Top","Jungle","Mid","ADC","Support"]})
})
server.get("/estados",(req,res)=>{
    res.status(200).json({rolesValidos:["Activo","Inactivo"]})
})
server.get("/tipos-roster",(req,res)=>{
    res.status(200).json({rolesValidos:["Principal","Academy"]})
})
server.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})
export default server;