import {CellStateEnum} from "./cell-state.enum";

export class Cell {
  state: CellStateEnum;
  value: number;
  visited: boolean;

  constructor(state?: CellStateEnum) {
    this.state = state ? state : CellStateEnum.Available;
  }
}
