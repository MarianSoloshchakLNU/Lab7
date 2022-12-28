import {CellStateEnum} from './cell-state.enum';
import {ICoordinates} from './coordinates';
import {Cell} from "./cell";

export class GameFlat {
  config: Array<Array<Cell>>;

  constructor(flatConfig: Array<Array<Cell>>) {
    this.config = JSON.parse(JSON.stringify(flatConfig))
  }

  getStartPosition(): ICoordinates {
    let xResult = 0;
    let yResult = 0;
    for(let i=0;i<this.config.length;++i){
      for(let j=0;j<this.config[i].length;++j) {
        if (this.config[i][j].state === CellStateEnum.Start) {
          xResult = j;
          yResult = i
        }
      }
    }
    return {
      x: xResult,
      y: yResult
    };
  }

  getFinishPosition(): ICoordinates {
    let xResult = 0;
    let yResult = 0;
    for(let i=0;i<this.config.length;++i){
      for(let j=0;j<this.config[i].length;++j) {
        if (this.config[i][j].state === CellStateEnum.Finish) {
          xResult = j;
          yResult = i
        }
      }
    }
    return {
      x: xResult,
      y: yResult
    };
  }
}
