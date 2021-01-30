import {CommonStyle} from "./common-style";
import {BigButton} from "./big-button";

export class StartScene extends Phaser.Scene {

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({
      key: "start"
    });
  }

  create(): void {
    const title = this.add.text(360, 90, "EV Trip", CommonStyle.XL_STYLE);
    title.setScale(1.5);
    title.setOrigin(0.5, 0.5);

    const startButton = new BigButton();
    startButton.create(this, false, 0, 560);
    startButton.setText("Start");
    startButton.setAction(() => {
      this.scene.start("thegame");
    });
    const helpButton = new BigButton();
    helpButton.create(this, false, 0, 670);
    helpButton.setText("Help");
    helpButton.setAction(() => {
      this.scene.start("help");
    });

    const version = this.add.text(360, 1100, "Send feedback to geek@electric.brussels\n\n                             v0.11", CommonStyle.NORMAL_STYLE);
    version.setOrigin(0.5, 0.5);
  }
}
