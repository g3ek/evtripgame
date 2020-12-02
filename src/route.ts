import {Scene} from "phaser";
import {Status, Vehicle} from "./vehicle";
import {Observable} from "rxjs";
import {VehicleSprite} from "./vehicle-sprite";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";

export class Route {

  private static DISTANCE_METRES: number = 250000; // 250km

  private scene: Phaser.Scene;
  private margin: number = 50;
  private distance: number;
  private vehicleSprites: VehicleSprite[] = [];
  private roadLengthPixels: number;
  private x: number;
  private distanceToPixelsFactor: number;
  private eventDispatcher: EvtripEventDispatcher;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  render(distance: number): void {
    this.distance = distance;
    const heightConfig = this.scene.game.config.height;
    const widthConfig = this.scene.game.config.width;
    const height : number = (<number>heightConfig);
    const width : number = (<number>widthConfig);
    const roadGraphics = this.scene.add.graphics({
      fillStyle: {
        color: 0x0a0ae0,
        alpha: 1
      }
    });
    this.roadLengthPixels = (<number>height) - (this.margin*2);
    this.x = width-this.margin;
    roadGraphics.fillRect(this.x, this.margin, 10, this.roadLengthPixels);
    this.distanceToPixelsFactor = Route.DISTANCE_METRES / this.roadLengthPixels;
  }

  update(): void {
    this.vehicleSprites.forEach(sprite => {
      sprite.update();
      let distanceInMetres = sprite.distance();
      let y = distanceInMetres / this.distanceToPixelsFactor;
      sprite.sprite().x = this.x;
      sprite.sprite().y = y + this.margin;

    });
  }


  addVehicle(vehicle: Vehicle) {
    const sprite = new VehicleSprite(vehicle, this.eventDispatcher);
    sprite.create(this.scene);
    this.vehicleSprites.push(sprite);
  }

  setEventDispatcher(eventDispatcher: EvtripEventDispatcher) {
    this.eventDispatcher = eventDispatcher;
  }
}
