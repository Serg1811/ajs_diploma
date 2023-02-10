/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) throw Error('invalid Character() class used');
    this.level = 1;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    if (level > 1) {
      for (let i = 1; i < level; i++) {
        this.raisingLevel();
      }
    }
    // TODO: выбросите исключение, если кто-то использует "new Character()"
  }

  raisingLevel() {
    this.level++;
    this.attack = +(Math.max(this.attack, (this.attack * (80 + this.health)) / 100)).toFixed(1);
    this.defence = +(Math.max(this.defence, (this.defence * (80 + this.health)) / 100)).toFixed(1);
    this.health = Math.min(100, this.health + 80);
  }
}
