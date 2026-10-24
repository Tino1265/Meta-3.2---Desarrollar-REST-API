'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Rosters', 'id_usuario', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Rosters', 'id_usuario');
  }
};