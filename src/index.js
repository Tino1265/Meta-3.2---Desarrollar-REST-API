import server from "./server.js";

const port = Number(process.env.PORT || process.env.port || 4000);

server.listen(port,()=>{
    console.log(`Server ejecutandose en http://localhost:${port}`)
})