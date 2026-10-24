'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Roster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Roster.belongsToMany(models.Jugador, {
        through: models.Roster_Jugador,
        foreignKey: 'id_roster',
        otherKey: 'id_jugador',
        as: 'jugadores'
      });
      Roster.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
    }
  }
  Roster.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    juego: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "League of legends"
    },
    tipo: {
      type: DataTypes.ENUM("Principal","Academy"),
      allowNull: false
    },
    temporada: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Roster',
    tableName: 'Rosters'
  });
  return Roster;
};