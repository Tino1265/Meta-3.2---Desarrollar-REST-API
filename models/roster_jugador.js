'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Roster_Jugador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Roster_Jugador.belongsTo(models.Jugador,{foreignKey: "id_jugador"})
      Roster_Jugador.belongsTo(models.Roster, {foreignKey: "id_roster"})
      // define association here
    }
  }
  Roster_Jugador.init({
    id_roster: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_jugador: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rol_en_roster: {
      type: DataTypes.ENUM("Titular","Suplente"),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Roster_Jugador',
    tableName: 'Roster_Jugadores'
  });
  return Roster_Jugador;
};