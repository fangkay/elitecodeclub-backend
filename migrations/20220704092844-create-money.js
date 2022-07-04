"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("money", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      1000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      2000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      3000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      4000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      6000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      8000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      10000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      12000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      15000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      20000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      25000: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("money");
  },
};
