import GameController from '../GameController';
import GamePlay from '../GamePlay';

test('findShow', () => {
  const check = `\u{1F396} ${3} \u{2694} ${20} \u{1F6E1} ${20} \u{2764} ${50}`;
  const character1 = {
    level: 3,
    attack: 20,
    defence: 20,
    health: 50,
  };

  expect(GameController.findShow(character1)).toEqual(check);
});

const gamePlay = new GamePlay();
const gameCtrl = new GameController(gamePlay);
gameCtrl.positionsCharacters = [
  {
    character: {
      level: 1,
      attack: 40,
      defence: 10,
      health: 50,
      type: 'swordsman',
      attackRange: 1,
      movement: 4,
    },
    position: 29,
  },
  {
    character: {
      level: 1,
      attack: 25,
      defence: 25,
      health: 50,
      type: 'bowman',
      attackRange: 2,
      movement: 2,
    },
    position: 24,
  },
  {
    character: {
      level: 1,
      attack: 25,
      defence: 25,
      health: 50,
      type: 'vampire',
      attackRange: 2,
      movement: 2,
    },
    position: 63,
  },
  {
    character: {
      level: 1,
      attack: 40,
      defence: 10,
      health: 50,
      type: 'undead',
      attackRange: 1,
      movement: 4,
    },
    position: 38,
  },
];

gameCtrl.gameZone = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47],
  [48, 49, 50, 51, 52, 53, 54, 55],
  [56, 57, 58, 59, 60, 61, 62, 63],
];

test.each([
  [29, gameCtrl[0]],
  [24, gameCtrl[1]],
  [63, gameCtrl[2]],
  [38, gameCtrl[3]],
  [12, undefined],
  [7, undefined],
])('checkCharacterInCell', (index, expected) => {
  const result = gameCtrl.checkCharacterInCell(String(index));
  expect(result).toBe(expected);
});

test.each([
  [gameCtrl.positionsCharacters[0], [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 30, 31, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 60, 61, 62, 63]],
  [gameCtrl.positionsCharacters[1], [8, 9, 10, 16, 17, 18, 25, 26, 32, 33, 34, 40, 41, 42]],
  [gameCtrl.positionsCharacters[2], [45, 46, 47, 53, 54, 55, 61, 62]],
  [gameCtrl.positionsCharacters[3], [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 23, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 39, 42, 43, 44, 45, 46, 47, 50, 51, 52, 53, 54, 55, 58, 59, 60, 61, 62, 63]],
])('movement', (char, expected) => {
  const result = gameCtrl.zone('movement', char);
  expect(result).toEqual(expected);
});

test.each([
  [gameCtrl.positionsCharacters[0], [20, 21, 22, 28, 30, 36, 37, 38]],
  [gameCtrl.positionsCharacters[1], [8, 9, 10, 16, 17, 18, 25, 26, 32, 33, 34, 40, 41, 42]],
  [gameCtrl.positionsCharacters[2], [45, 46, 47, 53, 54, 55, 61, 62]],
  [gameCtrl.positionsCharacters[3], [29, 30, 31, 37, 39, 45, 46, 47]],
])('attackRange', (char, expected) => {
  const result = gameCtrl.zone('attackRange', char);
  expect(result.sort()).toEqual(expected.sort());
});
