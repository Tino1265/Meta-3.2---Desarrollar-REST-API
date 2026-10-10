import server from "./server.js";

const port = 4000 || process.env.port;

server.listen(port,()=>{
    console.log(`Server ejecutandose en http://localhost:${port}`)
})