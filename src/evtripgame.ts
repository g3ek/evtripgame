import "phaser";
import {MainScene} from "./mainScene";
import {StartScene} from "./start-scene";
import {HelpScene} from "./help-scene";
import {StrategiesHelpScene} from "./strategies-help-scene";
import GameConfig = Phaser.Types.Core.GameConfig;
import ScaleModes = Phaser.Scale.ScaleModes;
import Center = Phaser.Scale.Center;

const config: GameConfig = {
  title: "EVTrip",
  width: 720,
  height: 1280,
  parent: "game",
  backgroundColor: "eaeafa",
  scene: [StartScene, MainScene, HelpScene, StrategiesHelpScene],
  scale: {
    parent: "game",
    mode: ScaleModes.FIT,
    autoCenter: Center.CENTER_BOTH
  }
}

export class Evtripgame extends Phaser.Game {

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new Evtripgame(config);
}
