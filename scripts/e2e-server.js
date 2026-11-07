import 'dotenv/config';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const require = createRequire(import.meta.url);
const config = require('../config/config.json');
const development = config.development;
const fallback = new URL('mysql://localhost/roster_e2e');
fallback.hostname = development.host;
fallback.username = development.username;
fallback.password = development.password || '';
const testUrl = new URL(process.env.TEST_DATABASE_URL || fallback.href);
const database = decodeURIComponent(testUrl.pathname.slice(1));
if (!/^[a-zA-Z0-9_]+_e2e$/.test(database) || database === development.database) {
    throw new Error('Las pruebas requieren una base separada cuyo nombre termine en _e2e');
}
process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL = testUrl.href;
process.env.PORT = process.env.E2E_API_PORT || '4100';
process.env.FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3100';
process.env.JWT_SECRET = process.env.E2E_JWT_SECRET || crypto.randomBytes(48).toString('hex');
process.env.JWT_EXPIRES_IN = '1h';
process.env.COOKIE_MAX_AGE = '3600000';

const connection = await mysql.createConnection({
    host: testUrl.hostname,
    port: Number(testUrl.port || 3306),
    user: decodeURIComponent(testUrl.username),
    password: decodeURIComponent(testUrl.password)
});
try {
    await connection.query('CREATE DATABASE IF NOT EXISTS `' + database + '`');
} finally {
    await connection.end();
}
const { default: db } = await import('../models/index.js');
// Ejecuta las migraciones reales, sin borrar ni sincronizar a la fuerza tablas.
const query = db.sequelize.getQueryInterface();
const Meta = db.sequelize.define('SequelizeMeta', {
    name: { type: db.Sequelize.STRING, primaryKey: true }
}, { tableName: 'SequelizeMeta', timestamps: false });
await Meta.sync();
const applied = new Set((await Meta.findAll()).map(row => row.name));
const migrationDir = new URL('../migrations/', import.meta.url);
for (const filename of (await readdir(migrationDir)).filter(name => name.endsWith('.js')).sort()) {
    if (applied.has(filename)) continue;
    const migration = require(fileURLToPath(new URL(filename, migrationDir)));
    await migration.up(query, db.Sequelize);
    await Meta.create({ name: filename });
}
const password = process.env.E2E_PASSWORD || 'Roster-e2e-12345';
const hash = await bcrypt.hash(password, 10);
for (const [email, nombre, perfil] of [
    [process.env.E2E_ADMIN_EMAIL || 'admin.e2e@example.com', 'Admin E2E Uno', 'admin'],
    ['admin2.e2e@example.com', 'Admin E2E Dos', 'admin'],
    ['usuario.e2e@example.com', 'Usuario E2E', 'usuario']
]) {
    const [user] = await db.Usuario.findOrCreate({
        where: { email }, defaults: { nombre, perfil, password: hash, activo: true }
    });
    await user.update({ nombre, perfil, password: hash, activo: true });
    if (perfil !== 'admin') continue;
    const [player] = await db.Jugador.findOrCreate({
        where: { nickname: 'E2E Fixture ' + user.id },
        defaults: { nombre_real: nombre, pais: 'México', rol: 'Mid', estado: 'activo', id_usuario: user.id }
    });
    const [roster] = await db.Roster.findOrCreate({
        where: { nombre: 'E2E Fixture ' + user.id, id_usuario: user.id },
        defaults: { juego: 'League of legends', tipo: 'Principal', temporada: '2026' }
    });
    await db.Roster_Jugador.findOrCreate({
        where: { id_roster: roster.id, id_jugador: player.id },
        defaults: { rol_en_roster: 'Titular' }
    });
}
const { default: server } = await import('../src/server.js');
const http = server.listen(Number(process.env.PORT), () => console.log('API E2E lista; base aislada: ' + database));
async function close() {
    http.close();
    await db.sequelize.close();
    process.exit(0);
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
