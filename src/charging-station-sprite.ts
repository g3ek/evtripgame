import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import Graphics = Phaser.GameObjects.Graphics;
import Pointer = Phaser.Input.Pointer;

export class ChargingStationSprite {

  private _circle: Graphics;
  private _chargingStation: ChargingStation;
  private _eventDispatcher: EvtripEventDispatcher;

  constructor(chargingStation: ChargingStation, eventDispatcher: EvtripEventDispatcher) {
    this._chargingStation = chargingStation;
    this._eventDispatcher = eventDispatcher;
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
    this._circle.on('pointerup', (pointer: Pointer) => {
      this._eventDispatcher.emit("showchargingstationstats", this.chargingStation);
    });
  }

  get chargingStation(): ChargingStation {
    return this._chargingStation;
  }

  get circle(): Phaser.GameObjects.Graphics {
    return this._circle;
  }
}
