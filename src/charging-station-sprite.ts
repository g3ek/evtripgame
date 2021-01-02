import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {CommonStyle} from "./common-style";
import Graphics = Phaser.GameObjects.Graphics;
import Pointer = Phaser.Input.Pointer;
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;

export class ChargingStationSprite {

  private _circle: Graphics;
  private _chargingStation: ChargingStation;
  private _eventDispatcher: EvtripEventDispatcher;
  private _slotsText: Text;
  private _parking: Graphics;
  private _parkingText: Text;
  private _container: Container;

  constructor(chargingStation: ChargingStation, eventDispatcher: EvtripEventDispatcher) {
    this._chargingStation = chargingStation;
    this._eventDispatcher = eventDispatcher;
  }

  create(scene: Scene): void {



    let radius: number = 40;
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
    this._slotsText = scene.add.text(0, 0, "0/"+this.chargingStation.slots, CommonStyle.NORMAL_STYLE);
    this._slotsText.setOrigin(0.5, 0.5);
    this._parking = scene.add.graphics({
      fillStyle: {
        color: 0x8e8eee,
        alpha: 1
      }
    });
    this._parking.fillRect(0, 0, 80, 80);
    //this._parking.displayOriginY = 0;
    //this._parking.displayOriginX = 0;
    this._parkingText = scene.add.text(0, 0, "0", CommonStyle.NORMAL_STYLE);
    this._parkingText.setOrigin(0.5, 0.5);
    this._parking.setInteractive(new Phaser.Geom.Rectangle(0, 0, 40, 40), Phaser.Geom.Rectangle.Contains);
    this._parking.on('pointerup', (pointer: Pointer) => {
      this._eventDispatcher.emit("showparkingstats", this.chargingStation);
    });

  }

  render(distanceToPixelsFactor: number, x: number, margin: number): void {
    const locationInMeters = this.chargingStation.locationInMeters;
    let y = locationInMeters / distanceToPixelsFactor;
    this._circle.x = x - 40;
    this._circle.y = y + margin;
    this._slotsText.x = x - 40;
    this._slotsText.y = y + margin;
    this._parking.x = x - 160;
    this._parking.y = y + margin - 40;
    this._parkingText.x = x -120;
    this._parkingText.y = y + margin;
  }

  get chargingStation(): ChargingStation {
    return this._chargingStation;
  }

  get circle(): Phaser.GameObjects.Graphics {
    return this._circle;
  }

  renderVehicle() {
    this._slotsText.setText(this.chargingStation.occupied()+"/"+this.chargingStation.slots);
    this._parkingText.setText(""+this.chargingStation.waiting.length);
  }
}
