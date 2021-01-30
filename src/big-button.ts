import {Scene} from "phaser";
import {CommonStyle} from "./common-style";
import Text = Phaser.GameObjects.Text;
import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;

export class BigButton {

  private text: Text;
  private background: Graphics;
  private container: Container;

  constructor() {
  }

  create(scene: Scene, enablePanel: boolean = false, x: number = 0, y: number = 0): void {
    const heightConfig = scene.game.config.height;
    const widthConfig = scene.game.config.width;
    const height: number = (<number>heightConfig);
    const width: number = (<number>widthConfig);
    this.container = scene.add.container(x, y);
    this.container.setDepth(5); // on top of everything

    let texty = 40;
    let buttony = 0;
    if (enablePanel) {
      let panelConfig = {
        x: 0,
        y: 0,
        fillStyle: {
          color: 0xffffff,
          alpha: 0.1
        }
      };
      const panel = scene.make.graphics(panelConfig);
      panel.fillRect(0, 0, width, height);
      panel.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
      this.container.add(panel);
      texty = 650; // in the middle
      buttony = 610;
    }

    this.text = scene.make.text({});
    this.text.setStyle(CommonStyle.XL_STYLE);
    //this.text.setScale(1.5);
    this.text.setPosition(360, texty);
    this.text.setOrigin(0.5, 0.5);
    let backgroundConfig = {
      x: 0,
      y: 0,
      fillStyle: {
        color: 0xffffff,
        alpha: 0.4
      }
    };
    this.background = scene.make.graphics(backgroundConfig);
    this.background.fillRoundedRect(30, buttony, 660, 90, 20);
    this.container.add(this.background);
    this.container.add(this.text);
    this.background.setPosition(0, 0);
    this.background.setInteractive(new Phaser.Geom.Rectangle(30, buttony, 660, 90), Phaser.Geom.Rectangle.Contains);
    this.background.on('pointerover', () => {
      this.background.lineStyle(10, 0x000000, 1);
      this.background.strokeRoundedRect(30, buttony, 660, 90, 20);
    });
    this.background.on('pointerout', () => {
      this.background.clear();
      this.background.fillRoundedRect(30, buttony, 660, 90, 20);
    });
  }

  setAction(action: () => void) {
    this.background.on('pointerup', action);
  }

  setText(text: string) {
    this.text.setText(text);
  }

  visible(show: boolean) {
    this.container.setVisible(show);
  }
}
