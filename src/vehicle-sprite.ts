import {Vehicle} from "./vehicle";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {CommonStyle} from "./common-style";
import {Scene} from "phaser";
import {Blinker, BlinkTime} from "./blinker";
import Graphics = Phaser.GameObjects.Graphics;
import Container = Phaser.GameObjects.Container;
import Pointer = Phaser.Input.Pointer;
import Text = Phaser.GameObjects.Text;

export class VehicleSprite {

  private vehicle: Vehicle;
  private eventDispatcher: EvtripEventDispatcher;
  private circle: Graphics;
  private container: Container;
  private radius: number;
  private socText: Text;
  private scene: Scene;
  private blinker: Blinker = null;

  constructor(vehicle: Vehicle, eventDispatcher: EvtripEventDispatcher, container: Container) {
    this.vehicle = vehicle;
    this.eventDispatcher = eventDispatcher;
    this.container = container;
  }

  create(scene: Phaser.Scene): void {
    this.scene = scene;
    this.radius = 20;
    this.circle = scene.make.graphics({
      fillStyle: {
        color: 0xf0f0f0,
        alpha: 1
      }
    });
    this.circle.fillCircle(0, 0, this.radius);
    this.circle.lineStyle(2, 0x000000, 1);
    this.circle.strokeCircle(0, 0, this.radius+1);
    this.container.add(this.circle);

    this.socText = scene.make.text({});
    this.socText.setStyle(CommonStyle.NORMAL_STYLE);
    this.socText.setStroke('#000', 1);
    this.socText.setOrigin(0.5, 0.5);
    this.socText.setScale(0.75);
    this.container.add(this.socText);

    this.circle.setInteractive(new Phaser.Geom.Circle(0, 0, this.radius), Phaser.Geom.Circle.Contains);
    this.circle.on('pointerup', (pointer: Pointer) => {
      this.eventDispatcher.emit("showvehiclestats", this.vehicle);
    });

  }

  render(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.updateSoc();
  }

  updateSoc() {
    const soc = this.vehicle.soc;
    const factor = this.vehicle.capacity / 100;
    const percent = Math.floor(soc / factor);
    this.socText.setText(''+percent);
    if (percent >= 20) {
      this.socText.setColor('#00ff00');
    } else if (percent >= 10) {
      this.socText.setColor('#ffa500');
    } else {
      this.socText.setColor('#ff0000');
    }
  }

  select(on: boolean): void {
    this.circle.clear();
    this.circle.fillStyle(0xf0f0f0);
    this.circle.fillCircle(0, 0, this.radius);
    if (on) {
      this.circle.lineStyle(4, 0x000000);
      this.circle.strokeCircle(0, 0, this.radius+2);
    } else {
      this.circle.lineStyle(2, 0x000000);
      this.circle.strokeCircle(0, 0, this.radius+1);
    }
  }

  visible(on: boolean) {
    this.container.setVisible(on);
  }

  getVehicle(): Vehicle {
    return this.vehicle;
  }

  destroy(): void {
    this.container.destroy();
    this.circle.destroy();
  }

  setupWaitingTimeout(blinkTime: BlinkTime) {
    if (this.blinker === null) {
      this.blinker = new Blinker(this.scene, this.circle);
    }
    this.blinker.createUpdateTimeline(blinkTime);
  }

  stopBlinker() {
    if (this.blinker !== null) {
      this.blinker.stop();
    }
  }
}
