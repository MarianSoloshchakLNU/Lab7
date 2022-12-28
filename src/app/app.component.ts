import {Component, OnInit} from '@angular/core';
import {CellStateEnum} from './models/cell-state.enum';
import {GameFlat} from './models/game-flat';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {Worker} from './models/worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Lab6';

  flatConfig: Array<Array<CellStateEnum>> = [];

  gameFlat?: GameFlat;
  cellStateEnum = CellStateEnum;
  defaultFileLoaded: boolean = false;
  defaultFileData: any = null;
  worker?: Worker;
  workerJob?: any;

  workerTimeout = 100;
  workerTurnDirection: 'left' | 'right' = 'right';
  workerLoopFuse = 0;

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer ) {
  }

  ngOnInit() {
    this.loadDefaultConfigFile();
  }

  // triggers when file input changes
  public onFileChange(event: any): void {
    this.defaultFileLoaded = false;
    let file = event.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.onload = (x) => {
      this.parseFileDataIntoFlat(fileReader?.result as string);

      this.createGame();
    }
    fileReader.readAsText(file);
  }

  // parses data from file into flatConfig
  parseFileDataIntoFlat(data: string) {
    if (!data) {
      return;
    }
    // Create an array consisting of the lines in the file
    const contents = data?.replace(/(\r\n|\n|\r)/gm, "").split(',').filter(x => x);

    this.flatConfig = [];

    let i = 0;
    while (i < contents.length)
    {
      let valueToPush: Array<CellStateEnum> = [];

      for (let j = 0; j < contents[i].length; j++) {
        const value = parseFloat(contents[i][j]);
        valueToPush[j] = Object.values(CellStateEnum).includes(value) ? value: CellStateEnum.Available
      }

      this.flatConfig.push(valueToPush);

      i++;
    }

    // simple check if at least all rows have the same length
    for (let j = 1; j < this.flatConfig.length; j++) {
      if (this.flatConfig[j].length !== this.flatConfig[j - 1].length) {
        console.error('Data in the file are wrong');
        this.flatConfig = [];
      }
    }
  }

  createGame() {
    this.worker = null;
    this.gameFlat = new GameFlat(this.flatConfig);

    if (this.workerJob) {
      clearInterval(this.workerJob);
    }
  }

  loadDefaultConfigFile() {
    this.httpClient.get('assets/config.txt', {responseType: 'text'})
      .subscribe(data => {
        this.defaultFileData = data;
        this.parseFileDataIntoFlat(data);
        this.defaultFileLoaded = true;
        this.createGame();
      });
  }

  loadDefaultEmptyConfigFile() {
    this.httpClient.get('assets/config-empty.txt', {responseType: 'text'})
      .subscribe(data => {
        this.parseFileDataIntoFlat(data);
        this.createGame();
      });
  }

  onDownloadDefaultFile () {
    const blob = new Blob([this.defaultFileData], { type: 'application/octet-stream' });


    const a = document.createElement('a');

    a.download = 'config.txt';
    a.href = window.URL.createObjectURL(blob);
    a.click();
  }

  createWorker() {
    if (!this.gameFlat) {
      return;
    }
    this.worker = new Worker(this.gameFlat, this.workerTurnDirection);
    this.workerLoopFuse = 0;

    this.workerJob = setInterval(this.nextStep.bind(this), this.workerTimeout);
  }

  nextStep() {
    this.workerLoopFuse++;

    this.worker.step1();
    this.worker.calcNextDirRight();

    if (this.workerLoopFuse >= this.flatConfig[0].length * this.flatConfig.length || this.worker.completed) {
      clearInterval(this.workerJob);
    }
  }
}
