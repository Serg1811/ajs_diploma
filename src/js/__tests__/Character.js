import Character from '../Character';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test.each([
  [Bowman, {
    level: 1, attack: 25, defence: 25, health: 50, type: 'bowman', attackRange: 2, movement: 2,
  }],
  [Magician, {
    level: 1, attack: 10, defence: 40, health: 50, type: 'magician', attackRange: 4, movement: 1,
  }],
  [Swordsman, {
    level: 1, attack: 40, defence: 10, health: 50, type: 'swordsman', attackRange: 1, movement: 4,
  }],
  [Daemon, {
    level: 1, attack: 10, defence: 40, health: 50, type: 'daemon', attackRange: 4, movement: 1,
  }],
  [Undead, {
    level: 1, attack: 40, defence: 10, health: 50, type: 'undead', attackRange: 1, movement: 4,
  }],
  [Vampire, {
    level: 1, attack: 25, defence: 25, health: 50, type: 'vampire', attackRange: 2, movement: 2,
  }],
])('create childs Character', (Char, expected) => {
  const result = new Char(1);
  expect(result).toEqual(expected);
});

test('new Character error', () => {
  expect(() => new Character(1)).toThrowError(new Error('invalid Character() class used'));
});
