export default class GameState {
  // static from(object) {
  //   // TODO: create object
  //   return null;
  // }

  constructor(data) {
    this.positionsCharacters = data.positionsCharacters;
    this.level = data.level;
    this.points = data.points;
    this.activePositionCharacter = data.activePositionCharacter;
    this.strokeNumber = data.strokeNumber;
    this.points = data.points;
    this.bestPoints = data.bestPoints;
  }

  saveBestPoints(points) {
    if (points > this.bestPoints) {
      this.bestPoints = points;
    }
  }
}
