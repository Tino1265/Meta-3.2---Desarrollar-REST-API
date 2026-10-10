'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roster_Jugadores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_roster: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Rosters",
          key: "id"
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_jugador: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
          model: "Jugadores",
          key: "id"
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rol_en_roster: {
        type: Sequelize.ENUM("Titular","Suplente"),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roster_Jugadores');
  }
};