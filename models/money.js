"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class money extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      money.belongsTo(models.player);
    }
  }
  money.init(
    {
      1000: DataTypes.BOOLEAN,
      2000: DataTypes.BOOLEAN,
      3000: DataTypes.BOOLEAN,
      4000: DataTypes.BOOLEAN,
      6000: DataTypes.BOOLEAN,
      8000: DataTypes.BOOLEAN,
      10000: DataTypes.BOOLEAN,
      12000: DataTypes.BOOLEAN,
      15000: DataTypes.BOOLEAN,
      20000: DataTypes.BOOLEAN,
      25000: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "money",
    }
  );
  return money;
};
