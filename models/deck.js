"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class deck extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      deck.hasOne(models.game, { foreignKey: "gameId" });
    }
  }
  deck.init(
    {
      1: DataTypes.BOOLEAN,
      2: DataTypes.BOOLEAN,
      3: DataTypes.BOOLEAN,
      4: DataTypes.BOOLEAN,
      5: DataTypes.BOOLEAN,
      6: DataTypes.BOOLEAN,
      7: DataTypes.BOOLEAN,
      8: DataTypes.BOOLEAN,
      9: DataTypes.BOOLEAN,
      10: DataTypes.BOOLEAN,
      divide: DataTypes.BOOLEAN,
      multiplyFirst: DataTypes.BOOLEAN,
      multiplySecond: DataTypes.BOOLEAN,
      multiplyThird: DataTypes.BOOLEAN,
      minusFive: DataTypes.BOOLEAN,
      discardPoints: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "deck",
    }
  );
  return deck;
};
