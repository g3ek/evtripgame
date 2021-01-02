import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {CommonStyle} from "./common-style";
import Pointer = Phaser.Input.Pointer;
import Text = Phaser.GameObjects.Text;
import Container = Phaser.GameObjects.Container;

export class ChargingStationSprite {

  private _chargingStation: ChargingStation;
  private _eventDispatcher: EvtripEventDispatcher;
  private _slotsText: Text;
  private _parkingText: Text;
  private _container: Container;

  constructor(chargingStation: ChargingStation, eventDispatcher: EvtripEventDispatcher) {
    this._chargingStation = chargingStation;
    this._eventDispatcher = eventDispatcher;
  }

  create(scene: Scene): void {
    this._container = scene.add.container();
    const graphics = scene.make.graphics({});
    graphics.fillStyle(0x0aa0a0);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(130, 0);
    graphics.lineTo(130, 15);
    graphics.lineTo(150, 15);
    graphics.lineTo(150, 25);
    graphics.lineTo(130, 25);
    graphics.lineTo(130, 40);
    graphics.lineTo(0, 40);
    graphics.moveTo(0, 0);
    graphics.fillPath();
    this._container.add(graphics);

    this._slotsText = scene.make.text({});
    this._slotsText.setOrigin(0.5, 0.5);
    this._slotsText.setStyle(CommonStyle.NORMAL_STYLE);
    this._slotsText.setText("0/"+this.chargingStation.slots);
    this._slotsText.setPosition(85, 20);
    this._container.add(this._slotsText);

    this._parkingText = scene.make.text({});
    this._parkingText.setOrigin(0.5, 0.5);
    this._parkingText.setStyle(CommonStyle.NORMAL_STYLE);
    this._parkingText.setText("0");
    this._parkingText.setPosition(20, 20);
    this._container.add(this._parkingText);

    graphics.setInteractive(new Phaser.Geom.Rectangle(0, 0, 130, 40), Phaser.Geom.Rectangle.Contains);
    graphics.on('pointerup', (pointer: Pointer) => {
      this._eventDispatcher.emit("showchargingstationstats", this.chargingStation);
    });
  }

  render(distanceToPixelsFactor: number, x: number, margin: number): void {
    const locationInMeters = this.chargingStation.locationInMeters;
    let y = locationInMeters / distanceToPixelsFactor;
    this._container.setPosition(x-150, y+margin-20);
  }

  get chargingStation(): ChargingStation {
    return this._chargingStation;
  }

  renderVehicle() {
    this._slotsText.setText(this.chargingStation.occupied()+"/"+this.chargingStation.slots);
    this._parkingText.setText(""+this.chargingStation.waiting.length);
  }
}
