import "phaser";
import {MainScene} from "./mainScene";
import GameConfig = Phaser.Types.Core.GameConfig;
import ScaleModes = Phaser.Scale.ScaleModes;
import Center = Phaser.Scale.Center;

const config: GameConfig = {
  title: "EVTrip",
  width: 720,
  height: 1280,
  parent: "game",
  backgroundColor: "eaeafa",
  scene: [MainScene],
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
