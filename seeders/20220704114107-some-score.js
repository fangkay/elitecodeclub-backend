"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "scores",
      [
        {
          playerId: 1,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 2,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 3,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 4,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 5,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 6,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 7,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
        {
          playerId: 8,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
          10: false,
          divide: false,
          multiplyFirst: false,
          multiplySecond: false,
          multiplyThird: false,
          minusFive: false,
          discardPoints: false,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("scores", null, {});
  },
};
