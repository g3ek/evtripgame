import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;

export class ChoseNumberComponent {

  private _values: number[];
  private valueIndex: number = 0;
  private container: Container;
  private action: () => void = null;
  private field: Text;
  private prefix: string;

  constructor(values: number[]) {
    this._values = values;
  }

  set values(values: number[]) {
    this._values = values;
  }

  create(scene: Scene, length: number, prefix: string = '', addToScene?: boolean): Container {
    this.prefix = prefix;
    let config = {
      fillStyle: {
        color: 0x909090,
        alpha: 1
      }
    }

    const left = scene.make.graphics(config);
    const right = scene.make.graphics(config);
    left.fillRoundedRect(0, 0, 60, 50, 20);
    right.fillRoundedRect(length, 0, 60, 50, 20);
    this.setupHighlight(left, 0, 0, 60, 50, 20);
    this.setupHighlight(right, length, 0, 60, 50, 20);

    let configArrow = {
      fillStyle: {
        color: 0xffffff,
        alpha: 1
      }
    };

    const leftarrow = scene.make.graphics(configArrow);
    leftarrow.fillTriangle(35, 5, 15, 25, 35, 45);
    const rightarrow = scene.make.graphics(configArrow);
    rightarrow.fillTriangle(length+20, 5, length+40, 25, length+20, 45);

    this.field = scene.make.text(CommonStyle.NORMAL_STYLE);
    this.field.x = 70;
    this.field.y = 10;
    this.field.setText(prefix+this._values[0]+"");
    this.field.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    if (addToScene) {
      this.container = scene.add.container();
    } else {
      this.container = scene.make.container({});
    }

    this.container.add(left);
    this.container.add(right);
    this.container.add(leftarrow);
    this.container.add(this.field);
    this.container.add(rightarrow);

    left.on('pointerup', () => {
      if (this.valueIndex > 0) {
        this.valueIndex--;
        this.field.setText(prefix+this._values[this.valueIndex]);
        if (this.action !== null) {
          this.action();
        }
      }
    });
    right.on('pointerup', () => {
      if (this.valueIndex < (this._values.length-1)) {
        this.valueIndex++;
        this.field.setText(prefix+this._values[this.valueIndex]);
        if (this.action !== null) {
          this.action();
        }
      }
    });
    return this.container;
  }

  setupHighlight(button: Graphics, x: number, y: number, width: number, height: number, radius: number): void {
    button.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);
    button.on('pointerover', () => {
      button.lineStyle(10, 0x000000, 1);
      button.strokeRoundedRect(x, y, width, height, radius);
    });
    button.on('pointerout', () => {
      button.clear();
      button.fillRoundedRect(x, y, width, height, radius);
    });
  }

  visible(on: boolean): void {
    this.container.setVisible(on);
  }

  getValue(): number {
    return this._values[this.valueIndex];
  }

  setValue(value: number): void {
    this.valueIndex = this._values.indexOf(value);
    this.field.setText(this.prefix+this._values[this.valueIndex]);
  }

  setAction(action: () => void) {
    this.action = action;
  }
}
