import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;

export class ChoseNumberComponent {

  private values: number[];
  private valueIndex: number = 0;
  private container: Container;
  private action: () => void = null;

  constructor(values: number[]) {
    this.values = values;
  }

  create(scene: Scene, length: number, prefix: string = '', addToScene?: boolean): Container {
    let config = {
      fillStyle: {
        color: 0x909090,
        alpha: 1
      }
    };

    const leftarrow = scene.make.graphics(config);
    leftarrow.fillTriangle(20, 0, 0, 20, 20, 40);
    const rightarrow = scene.make.graphics(config);
    rightarrow.fillTriangle(length, 0, length+20, 20, length, 40);

    let field = scene.make.text(CommonStyle.NORMAL_STYLE);
    field.x = 25;
    field.y = 0;
    field.setText(prefix+this.values[0]+"");
    field.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    if (addToScene) {
      this.container = scene.add.container();
    } else {
      this.container = scene.make.container({});
    }
    this.container.add(leftarrow);
    this.container.add(field);
    this.container.add(rightarrow);
    this.setupHighlight(leftarrow, 20, 0, 0, 20, 20, 40);
    this.setupHighlight(rightarrow, length, 0, length+20, 20, length, 40);
    leftarrow.on('pointerup', () => {
      if (this.valueIndex > 0) {
        this.valueIndex--;
        field.setText(prefix+this.values[this.valueIndex]);
        if (this.action !== null) {
          this.action();
        }
      }
    });
    rightarrow.on('pointerup', () => {
      if (this.valueIndex < (this.values.length-1)) {
        this.valueIndex++;
        field.setText(prefix+this.values[this.valueIndex]);
        if (this.action !== null) {
          this.action();
        }
      }
    });
    return this.container;
  }

  setupHighlight(arrow: Graphics, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    arrow.setInteractive(new Phaser.Geom.Triangle(x1, y1, x2, y2, x3, y3), Phaser.Geom.Triangle.Contains);
    arrow.on('pointerover', () => {
      arrow.lineStyle(5, 0x000000, 1);
      arrow.strokeTriangle(x1, y1, x2, y2, x3, y3);
    });
    arrow.on('pointerout', () => {
      arrow.clear();
      arrow.fillTriangle(x1, y1, x2, y2, x3, y3);
    });
  }

  visible(on: boolean): void {
    this.container.setVisible(on);
  }

  getValue(): number {
    return this.values[this.valueIndex];
  }

  setAction(action: () => void) {
    this.action = action;
  }
}
