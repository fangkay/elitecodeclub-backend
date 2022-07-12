"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("decks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      1: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      2: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      3: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      4: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      5: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      6: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      7: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      8: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      9: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      10: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      divide: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      multiplyFirst: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      multiplySecond: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      multiplyThird: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      minusFive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      discardPoints: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("decks");
  },
};
