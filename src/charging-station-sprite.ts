import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import Graphics = Phaser.GameObjects.Graphics;

export class ChargingStationSprite {

  private _circle: Graphics;

  private _chargingStation: ChargingStation;

  constructor(chargingStation: ChargingStation) {
    this._chargingStation = chargingStation;
  }

  create(scene: Scene): void {
    let radius: number = 10;
    this._circle = scene.add.graphics({
      fillStyle: {
        color: 0x0aa0a0,
        alpha: 1
      }
    });
    this._circle.fillCircle(0, 0, radius);
    this._circle.displayOriginY = 0.5;
    this._circle.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
  }

  get chargingStation(): ChargingStation {
    return this._chargingStation;
  }

  get circle(): Phaser.GameObjects.Graphics {
    return this._circle;
  }
}
