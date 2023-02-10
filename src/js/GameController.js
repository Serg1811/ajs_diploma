/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import themes from './themes';
import { generateTeam } from './generators';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  #userCharacter = [Bowman, Swordsman, Magician];

  #compCharacter = [Vampire, Undead, Daemon];

  #typeCharacter = {
    bowman: this.#userCharacter[0],
    swordsman: this.#userCharacter[1],
    magician: this.#userCharacter[2],
    vampire: this.#compCharacter[0],
    undead: this.#compCharacter[1],
    daemon: this.#compCharacter[2],
  };

  init() {
    this.users = new Map();
    this.comps = new Map();
    // TODO: add event listeners to gamePlay events
    this.level = 1;
    this.gamePlay.drawUi(themes[Object.keys(themes)[this.level - 1]]);
    this.startGame();

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    const characterInCell = this.checkCharacterInCell(index); // Ищем персонажа в ячейке

    if (this.activePositionCharacter) {
      if (characterInCell && characterInCell === this.activePositionCharacter) {
        this.heroDeactivation();
        this.gamePlay.redrawPositions(this.positionsCharacters);
      } else if (characterInCell && this.users.has(characterInCell)) {
        this.heroDeactivation();
        this.gamePlay.selectCell(index);
        this.activePositionCharacter = characterInCell;
      } else if (characterInCell && this.comps.has(characterInCell) && this.users.get(this.activePositionCharacter).attackRange.includes(index)) {
        this.attack(this.activePositionCharacter, characterInCell);
        this.strokeNumber++;
        this.gamePlay.strokeNumber = this.strokeNumber;
        this.heroDeactivation();
        // Остался кто в команде компа?
        setTimeout(() => {
          if (this.comps.size > 0) {
            this.turnComp();
          } else {
            this.levelUp();
          }
        }, 600);
      } else if (!characterInCell && this.users.get(this.activePositionCharacter).movement.includes(index)) {
        this.movement(this.activePositionCharacter, index);
        this.strokeNumber++;
        this.gamePlay.strokeNumber = this.strokeNumber;
        this.heroDeactivation();
        this.gamePlay.redrawPositions(this.positionsCharacters);
        setTimeout(() => {
          this.turnComp();
        }, 600);
      }
    } else if (characterInCell && this.users.has(characterInCell)) {
      this.gamePlay.selectCell(index);
      this.activePositionCharacter = characterInCell;
    } else if (characterInCell && this.comps.has(characterInCell)) {
      GamePlay.showError('Это не твой игрок');
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const characterInCell = this.checkCharacterInCell(index); // Ищем персонажа в ячейке

    if (characterInCell) {
      // Показываем информацию о персонаже
      this.gamePlay.showCellTooltip(GameController.findShow(characterInCell.character), index);

      // Курсор pointer, если персонаж свой
      if (this.users.has(characterInCell)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }

    // Если выбран активный персонаж
    if (this.activePositionCharacter) {
      if (!characterInCell && this.users.get(this.activePositionCharacter).movement.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else if (characterInCell && this.comps.has(characterInCell) && this.users.get(this.activePositionCharacter).attackRange.includes(index)) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor(cursors.crosshair);
        //       this.canAttack = true;
      } else if (!characterInCell || (characterInCell && this.comps.has(characterInCell))) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    const characterInCell = this.checkCharacterInCell(index); // Ищем персонажа в ячейке

    this.gamePlay.setCursor(cursors.auto); // Сбрасываем курсор

    // Убираем инфу персонажа
    if (characterInCell) {
      this.gamePlay.hideCellTooltip(index);
    }
    if (this.activePositionCharacter) {
      // Убираем подсветку доступного хода
      if (!characterInCell && this.users.get(this.activePositionCharacter).movement.includes(index)) {
        this.gamePlay.deselectCell(index);
      } else if (characterInCell && this.comps.has(characterInCell) && this.users.get(this.activePositionCharacter).attackRange.includes(index)) {
      // Убираем подсветку доступной атаки
        this.gamePlay.deselectCell(index);
      }
    }
  }

  onNewGameClick() {
    this.startGame();
  }

  onSaveGameClick() {
    this.gameState = new GameState(this);
    this.stateService.save(this.gameState);
    GamePlay.showError('Игра сохранина');
  }

  onLoadGameClick() {
    if (this.stateService.storage.length === 0) {
      GamePlay.showError('Нет сохранённой игры');
      // return;
    } else {
      const load = this.stateService.load();
      const positionsCharacters = this.createPositionsCharacters(load.positionsCharacters);
      this.startGame(positionsCharacters, load.level, load.activePosition, load.strokeNumber, load.points, load.bestPoints);
    }
    GamePlay.showError('Игра загружена');
  }

  createPositionsCharacters(value) {
    const positionsCharacters = [];
    value.forEach((e) => {
      const TypeCharacter = this.#typeCharacter[e.character.type];
      const character = new TypeCharacter(e.character.level);
      character.attack = e.character.attack;
      character.defence = e.character.defence;
      character.health = e.character.health;
      positionsCharacters.push(new PositionedCharacter(character, e.position));
    });
    return positionsCharacters;
  }

  // Список возможных ячеек, в которых может появиться персонаж игрока
  #getAllowUserPositions() {
    this.allowUserPositions = new Set();
    for (let i = 0; i < this.gamePlay.boardSize; i++) {
      this.allowUserPositions.add(i * this.gamePlay.boardSize);
      this.allowUserPositions.add(i * this.gamePlay.boardSize + 1);
    }
  }

  // Список возможных ячеек, в которых может появиться персонаж компа
  #getAllowCompPositions() {
    this.allowCompPositions = new Set();
    for (let i = 1; i < this.gamePlay.boardSize + 1; i++) {
      this.allowCompPositions.add(i * this.gamePlay.boardSize - 2);
      this.allowCompPositions.add(i * this.gamePlay.boardSize - 1);
    }
  }

  #getAllowPositions() {
    this.allowUserPositions = new Set();
    this.allowCompPositions = new Set();
    for (const element of this.gameZone) {
      this.allowUserPositions.add(element[0]);
      this.allowUserPositions.add(element[1]);
      this.allowCompPositions.add(element.at(-2));
      this.allowCompPositions.add(element.at(-1));
    }
  }

  #gameZone(size = this.gamePlay.boardSize) {
    this.gameZone = [];
    for (let i = 0; i < size; i++) {
      this.gameZone.push([]);
      for (let j = 0; j < size; j++) {
        this.gameZone[i].push(i * size + j);
      }
    }
  }

  startTeam(_user = [], _comp = []) {
    const maxLevel = Math.floor(1 + Math.random() * 4);
    let characterCount = Math.floor(1 + Math.random() * this.gamePlay.boardSize);
    if (_user.length >= characterCount || _comp.length >= characterCount) {
      characterCount = Math.max(_user.length, _comp.length);
    }
    return {
      user: [..._user, ...generateTeam(this.#userCharacter, maxLevel, characterCount - _user.length).characters],
      comp: [..._comp, ...generateTeam(this.#compCharacter, maxLevel, characterCount - _comp.length).characters],
    };
  }

  startPositions(characters) {
    this.#getAllowPositions();
    const positionsCharacters = [];
    characters.user.forEach((element) => {
      const allowUserPositions = Array.from(this.allowUserPositions);
      const position = allowUserPositions[Math.floor(Math.random() * allowUserPositions.length)];
      const positionUser = new PositionedCharacter(element, position);
      this.positionCharacterAdd(this.users, positionUser);
      positionsCharacters.push(positionUser);
      this.allowUserPositions.delete(position);
    });
    characters.comp.forEach((element) => {
      const allowCompPositions = Array.from(this.allowCompPositions);
      const position = allowCompPositions[Math.floor(Math.random() * allowCompPositions.length)];
      const positionComp = new PositionedCharacter(element, position);
      this.positionCharacterAdd(this.comps, positionComp);
      positionsCharacters.push(positionComp);
      this.allowCompPositions.delete(position);
    });
    delete this.allowUserPositions;
    delete this.allowCompPositions;
    return positionsCharacters;
  }

  startGame(positionsCharacters = null, level = 1, activePosition = null, strokeNumber = 1, points = 0, bestPoints = 0) {
    this.users.clear();
    this.comps.clear();
    this.level = level;
    this.strokeNumber = strokeNumber;
    this.points = points;
    this.bestPoints = bestPoints;
    const propertyThemes = Object.keys(themes);
    this.gamePlay.drawUi(themes[propertyThemes[(this.level - 1) % propertyThemes.length]]);
    this.#gameZone(this.gamePlay.boardSize);
    if (positionsCharacters === null) {
      const characters = this.startTeam();
      positionsCharacters = this.startPositions(characters);
    } else {
      positionsCharacters.forEach((positionCharacter) => {
        const team = (this.#userCharacter.find((value) => positionCharacter.character instanceof value)) ? this.users : this.comps;
        this.positionCharacterAdd(team, positionCharacter);
        if (positionCharacter.position === activePosition) {
          this.activePositionCharacter = positionCharacter;
        }
      });
    }
    this.positionsCharacters = positionsCharacters;
    this.gamePlay.redrawPositions(this.positionsCharacters);
    this.gamePlay.redrawStatistic({
      level: this.level,
      strokeNumber: this.strokeNumber,
      points: this.points,
      bestPoints: this.bestPoints,
    });
  }

  // Поиск персонажа в ячейке
  checkCharacterInCell(index) {
    return this.positionsCharacters.find((item) => item.position === index);
  }

  static findShow(character) {
    return `\u{1F396} ${character.level} \u{2694} ${character.attack} \u{1F6E1} ${character.defence} \u{2764} ${character.health}`;
  }

  zone(name, positionCharacter, index) {
    if (!index) {
      index = positionCharacter.position;
    }
    const distance = positionCharacter.character[name];
    if (distance) {
      const rowPosition = Math.floor(index / this.gamePlay.boardSize);
      const columnPosition = index % this.gamePlay.boardSize;
      let startRow = rowPosition - distance;
      const endRow = rowPosition + distance + 1;
      let startColumn = columnPosition - distance;
      const endColumn = columnPosition + distance + 1;
      startRow = (startRow < 0) ? 0 : startRow;
      startColumn = (startColumn < 0) ? 0 : startColumn;
      // endRow = (endRow < this.gamePlay.boardSize) ? endRow : this.gamePlay.boardSize + 1;
      // endColumn = (endColumn < this.gamePlay.boardSize) ? endColumn : this.gamePlay.boardSize + 1;
      const distanceZone = [];
      this.gameZone.slice(startRow, endRow).forEach((e) => {
        distanceZone.push(...e.slice(startColumn, endColumn));
      });
      const i = distanceZone.indexOf(index);
      distanceZone.splice(i, 1);
      return distanceZone;
    }
    GamePlay.showError(`У ${positionCharacter.character} отсутствует свойство ${name}`);
  }

  positionCharacterAdd(team, positionCharacter) {
    return team.set(positionCharacter, {
      movement: this.zone('movement', positionCharacter),
      attackRange: this.zone('attackRange', positionCharacter),
    });
  }

  // heroActivation(positionCharacter) {
  //   this.activePositionCharacter = positionCharacter;
  //   this.movement = this.zone('movement', positionCharacter);
  //   this.attackRange = this.zone('attackRange', positionCharacter);
  // }

  // Деактивация активного персонажа
  heroDeactivation() {
    this.gamePlay.deselectCell(this.activePositionCharacter.position);
    this.gamePlay.setCursor(cursors.auto);
    this.activePositionCharacter = undefined;
  }

  // Атака персонажа
  attack(attacker, attacked) {
    let attackerTeam = this.users;
    let attackedTeam = this.comps;
    if (this.users.has(attacked)) {
      attackedTeam = this.users;
      attackerTeam = this.comps;
    }
    const damage = +(Math.max(
      attacker.character.attack - attacked.character.defence,
      attacker.character.attack * 0.1,
    )).toFixed(1);
    attacked.character.health -= damage;
    attacked.character.health = +(attacked.character.health).toFixed(1);

    (async () => {
      await this.gamePlay.showDamage(attacked.position, damage);
      this.gamePlay.redrawPositions(this.positionsCharacters);
    })();

    // Проверка на смерть противника
    if (attacked.character.health <= 0) {
      this.death(attackedTeam, attacked);
    }
    attackerTeam.get(attacker).attackRange = this.zone('attackRange', attacker);
    this.gamePlay.deselectCell(attacked.position);
  }

  // Ход персонажа
  movement(positionCharacter, index) {
    this.gamePlay.deselectCell(positionCharacter.position);
    positionCharacter.position = index;
    const team = (this.users.has(positionCharacter)) ? this.users : this.comps;
    this.positionCharacterAdd(team, positionCharacter);
  }

  // Смерть персонажа
  death(team, positionCharacter) {
    this.positionsCharacters.splice(this.positionsCharacters.findIndex((e) => e === positionCharacter), 1);
    team.delete(positionCharacter);
  }

  // Ход противника
  turnComp() {
    const compCharactersAttacksUserCharacters = [];
    const compCharactersMovement = [];
    const compCharactersMovementMap = new Map();
    const positions = this.positionsCharacters.map((e) => e.position);
    for (const [attackerPositionCharacter, attackerParams] of this.comps) {
      for (const [attackedPositionCharacter, attackedParams] of this.users) {
        if (attackerParams.attackRange.includes(attackedPositionCharacter.position)) {
          compCharactersAttacksUserCharacters.push({
            attacker: attackerPositionCharacter,
            attacked: attackedPositionCharacter,
          });
        } else {
          attackerParams.movement.forEach((movementPosition) => {
            if (!positions.includes(movementPosition)) {
              const object = {
                positionCharacter: attackerPositionCharacter,
                positionMovement: movementPosition,
              };
              const _damage = (attackedParams.movement.includes(movementPosition)) ? attackedPositionCharacter.character.attack : 0;
              if (!compCharactersMovementMap.has(object) || compCharactersMovementMap.get(object) < _damage) {
                compCharactersMovementMap.set(object, _damage);
              }
            }
          });
        }
      }
    }
    if (compCharactersAttacksUserCharacters.length > 0) {
      compCharactersAttacksUserCharacters.sort((x, y) => y.attacker.character.attack - x.attacker.character.attack || y.attacked.character.attack - x.attacked.character.attack);
      this.attack(compCharactersAttacksUserCharacters[0].attacker, compCharactersAttacksUserCharacters[0].attacked);

      // Остался кто в команде юзера?
      setTimeout(() => {
        if (this.users.size === 0) {
          this.gameOver();
        }
      }, 10000);
    } else {
      for (const [key, value] of compCharactersMovementMap) {
        compCharactersMovement.push({
          positionCharacter: key.positionCharacter,
          damage: value,
          positionMovement: key.positionMovement,
        });
      }
      compCharactersMovement.sort((x, y) => x.damage - y.damage || y.positionCharacter.character.attack - x.positionCharacter.character.attack);
      this.movement(compCharactersMovement[0].positionCharacter, compCharactersMovement[0].positionMovement);
    }
    setTimeout(() => {
      this.gamePlay.redrawPositions(this.positionsCharacters);
    }, 600);
  }

  levelUp() {
    this.level++;
    this.strokeNumber = 1;
    const userCharacters = [];
    for (const positionCharacter of this.users.keys()) {
      this.points += positionCharacter.character.health;
      this.points = +(this.points).toFixed(1);
      positionCharacter.character.raisingLevel();
      userCharacters.push(positionCharacter.character);
    }
    this.bestPoints = Math.max(this.points, this.bestPoints);
    const characters = this.startTeam(userCharacters);
    this.startGame(this.startPositions(characters), this.level, undefined, undefined, this.points, this.bestPoints);
  }

  gameOver() {
    GamePlay.showError('Game over!');
    this.clearCellListeners();
  }
}
