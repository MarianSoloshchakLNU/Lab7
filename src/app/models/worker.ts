import {Direction} from './direction.enum';
import {GameFlat} from './game-flat';
import {ICoordinates} from './coordinates';
import {CellStateEnum} from './cell-state.enum';

export class Worker {
  public direction?: Direction;
  public currentPosition: ICoordinates = {x: 0, y: 0};
  public startPosition: ICoordinates = {x: 0, y: 0};
  public aim: ICoordinates = {x: 0, y: 0};

  public log: Array<string> = [];

  public turnDirection: 'right' | 'left' = 'right';

  bEnd = false;
  workerTimeout: number;
  cancelExecution = false;

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

  constructor(public flat: GameFlat, timeout?: number) {
    const startPosition = flat.getStartPosition();
    const finishPosition = flat.getFinishPosition();
    this.setPos(startPosition.x, startPosition.y);
    this.setStartPos(startPosition.x, startPosition.y);
    this.setAim(finishPosition.x, finishPosition.y);

    this.workerTimeout = timeout ? timeout : 100;
  }

  setPos(x: number, y: number) {
    this.currentPosition = {
      x,
      y
    };

    this.flat.config[y][x].visited = true;
  }

  setStartPos(x: number, y: number) {
    this.startPosition = {
      x,
      y
    };

    this.flat.config[y][x].visited = true;
  }

  setAim(x: number, y: number) {
    this.aim = {
      x,
      y
    };
  }

  cellXYIsFree(x: number, y: number) {
    return (x < this.flat.config[0].length && x >= 0 && y < this.flat.config.length && y >= 0) &&
      this.flat.config[y][x].state !== CellStateEnum.Disabled;
  }

  isNextCellOutOfFlat() {
    const nextCell = this.nextCell;
    return nextCell.x >= this.flat.config[0].length || nextCell.x < 0 ||
      nextCell.y >= this.flat.config.length || nextCell.y < 0;
  }


  checkPoints(p: Array<ICoordinates>, iteration: number) {

    if (iteration >= 1000) {
      this.log.push('Circular loop error, stop execution');
      return;
    }

    let count = p.length;
    let points = new Array<ICoordinates>();

    if(count==0 || this.bEnd) return;

    for(let i=0;i<count;++i)
    {
      //если достигли конца, то тикаем
      if(p[i].x == this.aim.x && p[i].y == this.aim.y)
      {
        this.log.push('Found the shortest end, stop execution');
        this.bEnd = true;
        return;
      }

      // check nearest 8 cells
      for(let y=-1;y<=1;++y) {
        for(let x=-1;x<=1;++x) {
          if(!(x==0&&y==0))
            //проверка на выход за пределы поля
            if(this.checkPointLimit(p[i].x+y,p[i].y+x)) {
              if(this.flat.config[p[i].y+x][p[i].x+y].state !== CellStateEnum.Disabled && !this.flat.config[p[i].y+x][p[i].x+y].value)
              {
                //проверка на препятствия
                if(this.checkPointObstacle(p[i].x+y, p[i].y+x,p[i].x, p[i].y))
                {
                  //проверка значения
                  if(this.checkPointValue(p[i].x+y,p[i].y+x,  (this.flat.config[p[i].y][p[i].x].value ?? 0) +((Math.abs(x)==Math.abs(y))?1.6:1), points))
                    //если надо, рисуем волны
                  {
                  }
                }
              }
            }
        }
      }

    }

    if (!this.cancelExecution) {
      //повторяем для новых клеток
      setTimeout(() => {
        this.log.push('checked all points, switching to other');
        this.checkPoints(points, iteration++)
      }, this.workerTimeout);
    }
  }

  checkPointLimit(i: number, j: number)
  {
    return (!(i < 0 || j < 0 || i >= this.flat.config[0].length || j >= this.flat.config.length));
  }

  checkPointObstacle(i1: any,j1: any, i2: any, j2: any)
  {
    return (!((Math.abs(i1 - i2) + Math.abs(j1 - j2) == 2) && (this.flat.config[j2][i1].state == CellStateEnum.Disabled || this.flat.config[j1][i2].state == CellStateEnum.Disabled)));
  }

  checkPointValue(i: any,j: any, v: any, p: Array<ICoordinates>)
  {
    if(!(this.startPosition.x==i && this.startPosition.y==j))
      if(this.flat.config[j][i].state!==CellStateEnum.Disabled)
      {
        if(this.flat.config[j][i].state !== CellStateEnum.Disabled)
          p[p.length] = {x:i,y:j};
        if(!this.flat.config[j][i].value || this.flat.config[j][i].value>v)
        {
          this.flat.config[j][i].value = +v.toFixed(1);
          this.log.push('Point [' + j + ',' + i + '] value - ' + this.flat.config[j][i].value);
          return true;
        }

        return false;
      }

    return false;
  }

  stop() {
    this.cancelExecution = true;
  }

}
