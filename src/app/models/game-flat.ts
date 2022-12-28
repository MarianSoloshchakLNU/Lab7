import {CellStateEnum} from './cell-state.enum';
import {ICoordinates} from './coordinates';

export class GameFlat {
  config: Array<Array<CellStateEnum>>;

  constructor(flatConfig: Array<Array<CellStateEnum>>) {
    this.config = JSON.parse(JSON.stringify(flatConfig))
  }

  getStartPosition(): ICoordinates {
    return {
      x: 0,
      y: this.config.findIndex(x => x[0] === CellStateEnum.Start)
    };
  }

  getFinishPosition(): ICoordinates {
    return {
      x: this.config[0].length - 1,
      y: this.config.findIndex(x => x[x.length - 1] === CellStateEnum.Finish)
    }
  }
}
