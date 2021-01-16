import Timeline = Phaser.Tweens.Timeline;
import Graphics = Phaser.GameObjects.Graphics;
import {Scene} from "phaser";

export enum BlinkTime {
  FIRST = 1000,
  SECOND = 500,
  THIRD = 250,
  FOURTH = 128
}

export class Blinker {
  private currentTimeLine: Timeline = null;
  private stopped: boolean = false;
  private graphics: Graphics;
  private scene: Scene;

  constructor(scene: Scene, graphics: Graphics) {
    this.scene = scene;
    this.graphics = graphics;
  }

  public updateTimeScale(scale: number) {
    this.currentTimeLine.timeScale = scale;
  }

  public createUpdateTimeline(graphics: Graphics, blinkTime: BlinkTime): void {
    if (this.currentTimeLine !== null && blinkTime === this.currentTimeLine.data[0].duration) {
      return; // do nothing, no update of the blink time
    }
    if (this.currentTimeLine !== null) {
      this.currentTimeLine.stop();
    }
    this.currentTimeLine = this.scene.tweens.createTimeline();
    this.currentTimeLine.add({
      targets: graphics,
      duration: blinkTime,
      alpha: 0.1,
      ease: Phaser.Math.Easing.Stepped,
      timeScale: 1
    });
    this.currentTimeLine.add({
      targets: graphics,
      duration: blinkTime,
      alpha: 1,
      ease: Phaser.Math.Easing.Stepped,
    });
    this.currentTimeLine.loop = -1; // infinite loop
    this.currentTimeLine.play();
  }

  public stop() {
    this.stopped = true;
    this.graphics.setAlpha(1);
    this.currentTimeLine.stop();
  }
}
