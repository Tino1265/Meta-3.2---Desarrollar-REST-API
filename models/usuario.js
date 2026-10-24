'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Usuario.hasMany(models.Roster, {
        foreignKey: 'id_usuario',
        as: 'rosters'
      });
    }
  }
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      unique: { msg: "El email ya está en uso" },
      validate: { isEmail: { msg: "Email inválido" } }
    }
    ,
    password: {
      type: DataTypes.STRING, allowNull:false
    },
    perfil: {
      type: DataTypes.ENUM("admin", "usuario"),
      allowNull: false,
      defaultValue: "usuario"
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: "Usuarios"
  });
  return Usuario;
};