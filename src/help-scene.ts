import {CommonStyle} from "./common-style";
import {GameButton} from "./game-button";

export class HelpScene extends Phaser.Scene {


  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({
      key: "help"
    });
  }

  create(): void {
    const helpText = this.add.text(30, 30, "", CommonStyle.NORMAL_STYLE);
    helpText.setText("< x1 > is the time factor selector:\n" +
      "This will speed up time while waiting for the vehicle\nto charge or to move.\n" +
      "Pause button: pauses time, stops charging or\nmoving vehicles, you can still request info.\n" +
      "Add button: bring up the charging station\ncreation dialog.\n" +
      "\n" +
      "Charging station dialog:\n" +
      "First < > selection: choose the power of the station\nin watts.\n" +
      "Second < > selection: choose the number of\ncharging spots/bays\n" +
      "Distance: select on road: before adding a station\nyou must click/top on a precise location on the road on the right.\n" +
      "Add button: if you have enough money\n($20000 = 20000 watts station) the station is added on the road and takes effect immediately\n" +
      "\n" +
      "Moving vehicles are represented by circles on the\nroad on the right.\nThe number in the circle represents the current\nstate of charge. You can click on it the get extra info.\n" +
      "\n" +
      "Charging stations: you can click on them to see the\nstats on the first line.\n" +
      "The lines below represents the charging bays\n" +
      "The lines below those represent the waiting\nvehicles if any.\n" +
      "\n" +
      "While a vehicle is charging you earn money.\nWith that money you can bye more powerful\ncharging stations and/or more bays.\n" +
      "Level ups will increase length of road and\nadd charging strategies of the vehicles.\nAlso the frequency of new vehicles will increase."
    );

    const strategies = new GameButton();
    const strategiesContainer = this.add.container(90, 1200);
    strategies.create(this, strategiesContainer, "Charging strategies", 300);
    strategies.setAction(() => {
      this.scene.start("strategies-help");
    });

    const backButton = new GameButton();
    const container = this.add.container(400, 1200);
    backButton.create(this, container, "Back", 100);
    backButton.setAction(() => {
      this.scene.start("start");
    });
  }
}
