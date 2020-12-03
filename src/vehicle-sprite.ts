import {Vehicle} from "./vehicle";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import Graphics = Phaser.GameObjects.Graphics;
import Pointer = Phaser.Input.Pointer;

export class VehicleSprite {

  private vehicle: Vehicle;
  private circle: Graphics;
  private eventDispatcher: EvtripEventDispatcher;

  constructor(vehicle: Vehicle, eventDispatcher: EvtripEventDispatcher) {
    this.vehicle = vehicle;
    this.eventDispatcher = eventDispatcher;
  }

  create(scene: Phaser.Scene): void {
    this.circle = scene.add.graphics({
      fillStyle: {
        color: 0xa0a00a,
        alpha: 1
      }
    });
    this.circle.fillCircle(0, 0, 20);
    this.circle.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains);

    let vehicleSprite = this;
    let gfx: Graphics = this.circle;

    this.circle.on('pointerup', (pointer: Pointer) => {
      this.eventDispatcher.emit("showvehiclestats", this.vehicle);
    })

  }

  update(): void {
    this.vehicle.update();
  }

  distance(): number {
    return this.vehicle.distance;
  }

  sprite(): Graphics {
    return this.circle;
  }

  getVehicle(): Vehicle {
    return this.vehicle;
  }
}
