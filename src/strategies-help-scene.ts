import {GameButton} from "./game-button";
import {CommonStyle} from "./common-style";

export class StrategiesHelpScene extends Phaser.Scene {


  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({
      key: "strategies-help"
    });
  }

  create(): void {
    const helpText = this.add.text(30, 30, "", CommonStyle.NORMAL_STYLE);
    helpText.setText("Vehicles will adopt random charging strategies\nwhen created. " +
      "A charging strategy will determine\nwhen a vehicle will stop and start charging.\n" +
      "\n" +
      "Optimal:\n" +
      "Start charging when less than throttle threshold.\n" +
      "Stop charging when throttling begins.\n" +
      "\n" +
      "Opportunistic:\n" +
      "Start charging when no other station ahead in\nrange.\n" +
      "Stop charging when in range of other station.\n" +
      "\n" +
      "Anxiety:\n" +
      "Start charging when near a charging station.\n" +
      "Stop charging until 100% SoC.");

    const backButton = new GameButton();
    const container = this.add.container(290, 1200);
    backButton.create(this, container, "Back", 100);
    backButton.setAction(() => {
      this.scene.start("start");
    });
  }
}
