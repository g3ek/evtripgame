import {Vehicle} from "./vehicle";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import Graphics = Phaser.GameObjects.Graphics;
import Image = Phaser.GameObjects.Image;

export class VehicleSprite {

  private vehicle: Vehicle;
  private circleMask: Graphics;
  private eventDispatcher: EvtripEventDispatcher;
  private graphics: Image;
  private circle: Graphics;
  private static texturecreated: boolean = false;


  constructor(vehicle: Vehicle, eventDispatcher: EvtripEventDispatcher) {
    this.vehicle = vehicle;
    this.eventDispatcher = eventDispatcher;
  }

  create(scene: Phaser.Scene): void {
    let radius: number = 20;
    this.circle = scene.add.graphics({
      fillStyle: {
        color: 0xf0f0f0,
        alpha: 1
      }
    });
    this.circle.fillCircle(0, 0, radius);
    this.circle.lineStyle(2, 0x000000, 1);
    this.circle.strokeCircle(0, 0, 21);

    if (!VehicleSprite.texturecreated) {
      VehicleSprite.texturecreated = true;
      let spriteGfx = scene.add.graphics({
        fillStyle: {
          color: 0xffffff
        }
      });
      spriteGfx.fillRect(0, 0, 40, 40);
      spriteGfx.generateTexture('vst', 40, 40);
      spriteGfx.destroy();
    }
    this.graphics = scene.add.sprite(0, 0, 'vst');
    this.circleMask = scene.make.graphics({
      fillStyle: {
        color: 0xffffff,
        alpha: 1
      }
    });
    this.circleMask.fillCircle(0, 0, radius);
    let mask = this.circleMask.createGeometryMask();
    this.graphics.setMask(mask);
    //this.circleMask.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
    //this.circleMask.on('pointerup', (pointer: Pointer) => {
    //  this.eventDispatcher.emit("showvehiclestats", this.vehicle);
    //});

  }

  render(x: number, y: number): void {
    this.circleMask.x = x;
    this.circleMask.y = y;
    this.circle.x = x;
    this.circle.y = y;

    this.graphics.x = x;
    const soc = this.vehicle.soc;
    const factor = this.vehicle.capacity / 40;
    const perfectFactor = this.vehicle.capacity / 100;
    const yOffset = soc / factor;
    const percent = soc / perfectFactor;
    this.graphics.y = (y-yOffset)+40;
    if (percent >= 20) {
      this.graphics.setTint(0x00ff00);
    } else if (percent >= 10) {
      this.graphics.setTint(0xffff00);
    } else {
      this.graphics.setTint(0xff0000);
    }
   }

  sprite(): Graphics {
    return this.circle;
  }

  visible(on: boolean) {
    this.circle.setVisible(on);
    this.graphics.setVisible(on);
  }

  getVehicle(): Vehicle {
    return this.vehicle;
  }

  destroy(): void {
    this.circleMask.destroy();
    this.circle.destroy();
    this.graphics.destroy();
  }
}
