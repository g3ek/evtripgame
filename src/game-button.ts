import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;

export class GameButton {

  private messageBar: Graphics;
  private textGameObject: Text;
  private parent: Phaser.GameObjects.Container;

  constructor(scene: Scene, x: number, y: number, text: string, parent?: Container) {
    this.parent = parent;
    this.create(scene, x, y, text);
  }


  private create(scene: Scene, x: number, y: number, text: string) {
    this.textGameObject = scene.add.text(x, y, text, CommonStyle.NORMAL_STYLE).setDepth(3);
    //this.textGameObject.setOrigin(-0.4, -0.2);
    //this.message.setInteractive(new Phaser.Geom.Rectangle(0, 0, 720, this.message.height+70), Phaser.Geom.Rectangle.Contains);
    let messageBar = scene.add.graphics({
      x: x,
      y: y,
      fillStyle: {
        color: 0x909090,
        alpha: 0.5
      }
    }).setDepth(1);
    const width = text.length*30;
    const height = 50;
    messageBar.fillRoundedRect(0, 0, width, height, 15);
    messageBar.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    messageBar.on('pointerover', () => {
      messageBar.lineStyle(10, 0x000000, 1);
      messageBar.strokeRoundedRect(0, 0, width, height, 15);
    });
    messageBar.on('pointerout', () => {
      messageBar.clear();
      messageBar.fillRoundedRect(0, 0, width, height, 15);
    });
    this.messageBar = messageBar;
  }

  setAction(action: () => void) {
    this.messageBar.on('pointerup', action);
  }

  setText(text: string) {
    this.textGameObject.setText(text);
  }
}
