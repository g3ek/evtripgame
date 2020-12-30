import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Graphics = Phaser.GameObjects.Graphics;
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;

export class GameButton {

  private messageBar: Graphics;
  private textGameObject: Text;

  constructor() {
  }

  create(scene: Scene, container: Container, text: string, width: number): void {
    this.textGameObject = scene.make.text({});
    this.textGameObject.setText(text);
    this.textGameObject.setPosition(20, 7);
    this.textGameObject.setStyle(CommonStyle.NORMAL_STYLE);
    this.textGameObject.setDepth(1);

    let messageBar;
    let messageBarConfig = {
      x: 0,
      y: 0,
      fillStyle: {
        color: 0x909090,
        alpha: 0.5
      }
    };
    messageBar = scene.make.graphics(messageBarConfig);

    messageBar.fillRoundedRect(0, 0, width, 50, 15);
    messageBar.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, 50), Phaser.Geom.Rectangle.Contains);

    messageBar.on('pointerover', () => {
      messageBar.lineStyle(10, 0x000000, 1);
      messageBar.strokeRoundedRect(0, 0, width, 50, 15);
    });
    messageBar.on('pointerout', () => {
      messageBar.clear();
      messageBar.fillRoundedRect(0, 0, width, 50, 15);
    });
    this.messageBar = messageBar;
    container.add(messageBar);
    container.add(this.textGameObject);
  }

  setAction(action: () => void) {
    this.messageBar.on('pointerup', action);
  }

  setText(text: string) {
    this.textGameObject.setText(text);
  }
}
