"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      player.belongsTo(models.game, { foreignKey: "gameId" });
      player.hasOne(models.money, { foreignKey: "playerId" });
      player.hasOne(models.score, { foreignKey: "playerId" });
    }
  }
  player.init(
    {
      username: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "player",
    }
  );
  return player;
};
