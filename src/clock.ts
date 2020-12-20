import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Text = Phaser.GameObjects.Text;

export class Clock {

  private scene: Phaser.Scene;
  private _time: number = 0;
  private previousRealTime: number = 0;
  private clockText: Text;
  private date: Date = new Date();
  private _timeScale: number = 1;
  private pauseStart: number = 0;
  private pauseTotal: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  create() {
    this.clockText = this.scene.add.text(30, 30, "Time: ", CommonStyle.NORMAL_STYLE);
    this.scene.time.addEvent({
      loop: true,
      delay: 100,
      callback: () => {
        this.update();
      }
    });
  }

  update(): void {
    if (this.pauseStart != 0) {
      this.pauseTotal += (this.scene.time.now - this.pauseStart);
      this.pauseStart = 0;
      this.previousRealTime = (this.scene.time.now - this.pauseTotal);
    }
    let now = this.scene.time.now - this.pauseTotal;
    let delta = (now - this.previousRealTime);
    this.previousRealTime = now;
    this._time += (delta * this._timeScale);
    this.date.setTime(this._time);
    // todo why do I have to -1 on the hour?
    this.clockText.setText("Time: "+(this.date.getHours()-1)+":"+this.date.getMinutes()+":"+this.date.getSeconds());
  }

  get time(): number {
    return this._time;
  }

  get timeScale(): number {
    return this._timeScale;
  }

  set timeScale(value: number) {
    this._timeScale = value;
  }

  pause() {
    this.pauseStart = this.scene.time.now;
  }
}
