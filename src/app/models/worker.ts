import {Direction} from './direction.enum';
import {GameFlat} from './game-flat';
import {ICoordinates} from './coordinates';
import {CellStateEnum} from './cell-state.enum';

export class Worker {
  public direction?: Direction;
  public currentPosition: ICoordinates = {x: 0, y: 0};
  public aim: ICoordinates = {x: 0, y: 0};

  public log: Array<string> = [];

  public turnDirection: 'right' | 'left' = 'right';

  get borderLeft() {
    return this.currentPosition.x === 0;
  }

  get borderRight() {
    return this.currentPosition.x === this.flat.config[0].length - 1;
  }

  get borderTop() {
    return this.currentPosition.y === 0;
  }

  get borderBelow() {
    return this.currentPosition.y === this.flat.config.length - 1;
  }

  get cellFrontIsFree(): boolean {
    switch (this.direction) {
      case Direction.xminus:
        return this.cellXYIsFree(this.currentPosition.x - 1, this.currentPosition.y);
      case Direction.xminusyminus:
        return this.cellXYIsFree(this.currentPosition.x - 1, this.currentPosition.y - 1);
      case Direction.yminus:
          return this.cellXYIsFree(this.currentPosition.x, this.currentPosition.y - 1);
      case Direction.xminusyplus:
        return this.cellXYIsFree(this.currentPosition.x - 1, this.currentPosition.y + 1);
      case Direction.xplus:
        return this.cellXYIsFree(this.currentPosition.x + 1, this.currentPosition.y);
      case Direction.xplusyminus:
        return this.cellXYIsFree(this.currentPosition.x + 1, this.currentPosition.y - 1);
      case Direction.xplusyplus:
        return this.cellXYIsFree(this.currentPosition.x + 1, this.currentPosition.y + 1);
      case Direction.yplus:
        return this.cellXYIsFree(this.currentPosition.x, this.currentPosition.y + 1);
      default:
        return false;
    }
  }

  get nextCell(): ICoordinates {
    switch (this.direction) {
      case Direction.xminus:
        return {x: this.currentPosition.x - 1, y: this.currentPosition.y};
      case Direction.xminusyminus:
        return {x: this.currentPosition.x - 1, y: this.currentPosition.y - 1};
      case Direction.yminus:
        return {x: this.currentPosition.x, y: this.currentPosition.y - 1};
      case Direction.xminusyplus:
        return {x: this.currentPosition.x - 1, y: this.currentPosition.y + 1};
      case Direction.xplus:
        return {x: this.currentPosition.x + 1, y: this.currentPosition.y};
      case Direction.xplusyminus:
        return {x: this.currentPosition.x + 1, y: this.currentPosition.y - 1};
      case Direction.xplusyplus:
        return {x: this.currentPosition.x + 1, y: this.currentPosition.y + 1};
      case Direction.yplus:
        return {x: this.currentPosition.x, y: this.currentPosition.y + 1};
      default:
        return {x: this.currentPosition.x, y: this.currentPosition.y};
    }
  }

  get completed(): boolean {
    return this.currentPosition.x === this.aim.x && this.currentPosition.y === this.aim.y;
  }

  constructor(public flat: GameFlat, initialTurnDirection: 'left' | 'right') {
    this.turnDirection = initialTurnDirection;
    const startPosition = flat.getStartPosition();
    const finishPosition = flat.getFinishPosition();
    this.setPos(startPosition.x, startPosition.y);
    this.setAim(finishPosition.x, finishPosition.y);

    this.calcNextDirRight();
  }

  setPos(x: number, y: number) {
    this.currentPosition = {
      x,
      y
    };

    this.flat.config[y][x] = CellStateEnum.Visited;
  }

  setAim(x: number, y: number) {
    this.aim = {
      x,
      y
    };
  }

  setDir(dir: Direction) {
    this.direction = dir;
  }

  step1() {
    const nextCell = this.nextCell;

    if (this.cellXYIsFree(nextCell.x, nextCell.y)) {
      this.setPos(nextCell.x, nextCell.y);
    }
  }

  turnRight(): Direction {
    switch (this.direction) {
      case Direction.xminus:
        return Direction.xminusyminus;
      case Direction.xminusyminus:
        return Direction.yminus;
      case Direction.yminus:
        return Direction.xplusyminus;
      case Direction.xplusyminus:
        return Direction.xplus;
      case Direction.xplus:
        return Direction.xplusyplus;
      case Direction.xplusyplus:
        return Direction.yplus;
      case Direction.yplus:
        return Direction.xminusyplus;
      case Direction.xminusyplus:
        return Direction.xminus;
      default:
        return this.direction;
    }
  }

  turnLeft(): Direction {
    switch (this.direction) {
      case Direction.xminus:
        return Direction.xminusyplus;
      case Direction.xminusyplus:
        return Direction.yplus;
      case Direction.yplus:
        return Direction.xplusyplus;
      case Direction.xplusyplus:
        return Direction.xplus;
      case Direction.xplus:
        return Direction.xplusyminus;
      case Direction.xplusyminus:
        return Direction.yminus;
      case Direction.yminus:
        return Direction.xminusyminus;
      case Direction.xminusyminus:
        return Direction.xminus;
      default:
        return this.direction;
    }
  }

  calcNextDirRight() {
    this.log.push('----------------------');
    if (!this.borderRight) {
      if ((this.aim.x - this.currentPosition.x) >= Math.abs(this.aim.y - this.currentPosition.y)) {
        this.direction = Direction.xplus;
      } else if (this.aim.y < this.currentPosition.y){
        this.direction = Direction.xplusyminus;
      } else if (this.aim.y > this.currentPosition.y) {
        this.direction = Direction.xplusyplus;
      }
    } else {
      this.direction = this.aim.y > this.currentPosition.y ? Direction.yplus : Direction.yminus;
    }

    this.log.push('Current position - { x:' + this.currentPosition.x + ', y:' + this.currentPosition.y + ' }');
    this.log.push('Direction is - ' + this.direction);

    let infinityLoopFuse = 0;

    while (!this.cellFrontIsFree && infinityLoopFuse < 10) {
      this.log.push('Next cell is disabled, turning ' + this.turnDirection);
      infinityLoopFuse++;

      if (this.isNextCellOutOfFlat() && this.borderBelow) {
        this.log.push('switching to left turn');
        this.turnDirection = 'left';
      }

      if (this.isNextCellOutOfFlat() && this.borderTop) {
        this.log.push('switching to right turn');
        this.turnDirection = 'right';
      }

      this.direction = this.turnDirection === 'left' ? this.turnLeft() : this.turnRight();

      this.log.push('Direction is - ' + this.direction);
    }

    this.log.push('Next cell is available');
  }

  cellXYIsFree(x: number, y: number) {
    return (x < this.flat.config[0].length && x >= 0 && y < this.flat.config.length && y >= 0) &&
      this.flat.config[y][x] !== CellStateEnum.Disabled;
  }

  isNextCellOutOfFlat() {
    const nextCell = this.nextCell;
    return nextCell.x >= this.flat.config[0].length || nextCell.x < 0 ||
      nextCell.y >= this.flat.config.length || nextCell.y < 0;
  }


}
