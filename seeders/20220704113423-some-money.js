"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "money",
      [
        {
          playerId: 1,
          1000: true,
          2000: true,
          3000: true,
          4000: true,
          6000: true,
          8000: true,
          10000: true,
          12000: true,
          15000: true,
          20000: true,
          25000: true,
        },
        {
          playerId: 2,
          1000: true,
          2000: true,
          3000: true,
          4000: true,
          6000: true,
          8000: true,
          10000: true,
          12000: true,
          15000: true,
          20000: true,
          25000: true,
        },
        {
          playerId: 3,
          1000: true,
          2000: true,
          3000: true,
          4000: true,
          6000: true,
          8000: true,
          10000: true,
          12000: true,
          15000: true,
          20000: true,
          25000: true,
        },
        {
          playerId: 4,
          1000: true,
          2000: true,
          3000: true,
          4000: true,
          6000: true,
          8000: true,
          10000: true,
          12000: true,
          15000: true,
          20000: true,
          25000: true,
        },
        {
          playerId: 5,
          1000: true,
          2000: true,
          3000: true,
          4000: true,
          6000: true,
          8000: true,
          10000: true,
          12000: true,
          15000: true,
          20000: true,
          25000: true,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("money", null, {});
  },
};
