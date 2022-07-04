"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "players",
      [
        {
          username: "John",
          gameId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Peter",
          gameId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Laura",
          gameId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Victor",
          gameId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Ashley",
          gameId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Nick",
          gameId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "George",
          gameId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "Trisha",
          gameId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("players", null, {});
  },
};
