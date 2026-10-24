'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env');
    }

    // Evita duplicar el admin si el seeder se ejecuta dos veces
    const [existente] = await queryInterface.sequelize.query(
      'SELECT id FROM Usuarios WHERE email = :email',
      { replacements: { email } }
    );
    if (existente.length > 0) return;

    const ahora = new Date();
    await queryInterface.bulkInsert('Usuarios', [{
      nombre: 'Administrador',
      email,
      password: await bcrypt.hash(password, 10),
      perfil: 'admin',
      activo: true,
      createdAt: ahora,
      updatedAt: ahora
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Usuarios', { email: process.env.ADMIN_EMAIL });
  }
};