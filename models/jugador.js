'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jugador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Jugador.belongsToMany(models.Roster, {
        through: models.Roster_Jugador,
        foreignKey: 'id_jugador',
        otherKey: 'id_roster',
        as: 'rosters'
      });
    }
  }
  Jugador.init({
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'El nickname ya está en uso' 
      }
    },
    nombre_real: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pais: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rol: {
      type: DataTypes.ENUM('Top', 'Jungle', 'Mid', 'ADC', 'Support'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Top', 'Jungle', 'Mid', 'ADC', 'Support']],
          msg: 'Rol inválido'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM("activo","inactivo"),
      allowNull: false,
      defaultValue: 'inactivo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo']],
          msg: 'Estado inválido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Jugador',
    tableName: 'Jugadores'
  });
  return Jugador;
};