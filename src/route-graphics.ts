import {VehicleSprite} from "./vehicle-sprite";
import {ChargingStationSprite} from "./charging-station-sprite";

export class RouteGraphics {

  private static DISTANCE_METRES: number = 250000; // 250km

  private scene: Phaser.Scene;
  private margin: number = 50;
  private distance: number;
  private roadLengthPixels: number;
  private x: number;
  private distanceToPixelsFactor: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  render(distance: number): void {
    this.distance = distance;
    const heightConfig = this.scene.game.config.height;
    const widthConfig = this.scene.game.config.width;
    const height: number = (<number>heightConfig);
    const width: number = (<number>widthConfig);
    const roadGraphics = this.scene.add.graphics({
      fillStyle: {
        color: 0x0a0ae0,
        alpha: 1
      }
    });
    this.roadLengthPixels = (<number>height) - (this.margin * 2);
    this.x = width - this.margin;
    roadGraphics.fillRect(this.x, this.margin, 10, this.roadLengthPixels);
    this.distanceToPixelsFactor = RouteGraphics.DISTANCE_METRES / this.roadLengthPixels;
  }

  update(vehicleSprites: VehicleSprite[]): void {
    vehicleSprites.forEach(sprite => {
      let distanceInMetres = sprite.distance();
      let y = distanceInMetres / this.distanceToPixelsFactor;
      sprite.sprite().x = this.x;
      sprite.sprite().y = y + this.margin;
    });
  }

  renderChargingStation(csSprite: ChargingStationSprite): void {
    const locationInMeters = csSprite.chargingStation.locationInMeters;
    let y = locationInMeters / this.distanceToPixelsFactor;
    csSprite.circle.x = this.x;
    csSprite.circle.y = y + this.margin;
  }
}
