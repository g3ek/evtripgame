import {Scene} from "phaser";
import {Controller} from "./controller";
import {CommonStyle} from "./common-style";
import Text = Phaser.GameObjects.Text;

export class Clock {

  private scene: Phaser.Scene;

  private clockText: Text;
  private startTime: number;
  private date: Date = new Date();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  create() {
    this.startTime = Date.now();
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
    let elapsedTime: number = (Date.now() - this.startTime) * Controller.TIMEFACTOR;
    this.date.setTime(elapsedTime);
    // todo why do I have to -1 on the hour?
    this.clockText.setText("Time: "+(this.date.getHours()-1)+":"+this.date.getMinutes()+":"+this.date.getSeconds());
  }
}
