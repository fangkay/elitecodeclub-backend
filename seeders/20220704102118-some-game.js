"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "games",
      [
        {
          name: "Test Game 1",
          turn: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test Game 2",
          turn: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test Game 3",
          turn: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test Game 4",
          turn: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Test Game 5",
          turn: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("games", null, {});
  },
};
