import Image = Phaser.GameObjects.Image;
import Graphics = Phaser.GameObjects.Graphics;
import Pointer = Phaser.Input.Pointer;
import {Controller} from "./controller";

export class Slider {
  protected scene: Phaser.Scene;
  protected bar: Graphics;
  private button: Image;
  private action: () => void;
  private _value: number = Controller.TIMEFACTOR;
  private x: number;
  private size: number = 100;
  private range: number;
  private factor: number;

  constructor(scene: Phaser.Scene, x: number, y: number, range: number) {
    this.scene = scene;
    this.x = x;
    this.range = range;
    this.factor = this.size / this.range;
    this.create(x, y);
  }

  create(x: number, y: number): void {
    this.createBar(x, y);

    let buttonGfx = this.scene.add.graphics({
      x: x+(this.size/2),
      y: y,
      fillStyle: {
        color: 0x000000,
      },
    });
    buttonGfx.fillRect(0, 0, 20, 40);
    buttonGfx.generateTexture('sliderbuttontexture', 20, 40);
    buttonGfx.destroy();

    this.button = this.scene.add.image(x+(this.size/2), y+5, 'sliderbuttontexture');
    this.button.setInteractive({
      draggable: true
    });
    this.button.setDepth(2);
    this.scene.input.setDraggable(this.button);

    this.button.on('drag', (pointer: Pointer, button: Image, dragX: number, dragY: number) => {
      if (pointer.x >= this.x && pointer.x <= (this.x+this.size)) {
        this.button.setX(pointer.x);
        let real = (pointer.x-this.x) / this.factor;
        this._value = Math.floor(real);
      }
    });
  }

  protected createBar(x: number, y: number): void {
    this.bar = this.scene.add.graphics({
      fillStyle: {
        color: 0x000000
      }
    });
    this.bar.fillRect(x, y, 100, 10);
  }

  visible(on: boolean) {
    this.bar.setVisible(on);
    this.button.setVisible(on);
  }

  toggleVisible(): void {
    this.bar.setVisible(!this.bar.visible)
    this.button.setVisible(!this.button.visible)
  }

  setAction(action: () => void) {
    this.button.on('dragend', action);
  }


  get value(): number {
    return this._value;
  }
}
