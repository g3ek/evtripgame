import {VehicleSprite} from "./vehicle-sprite";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";

export class RouteGraphics {

  //static DISTANCE_METRES: number = 250000; // 250km
  static DISTANCE_METRES: number = 100000; // 100km

  private scene: Phaser.Scene;
  private margin: number = 50;
  private distance: number;
  private roadLengthPixels: number;
  private x: number;
  private distanceToPixelsFactor: number;
  private vehicleSprites: VehicleSprite[] = [];
  private chargingStationSprites: ChargingStationSprite[] = [];

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

  addVehicle(vehicleSprite: VehicleSprite) {
    this.vehicleSprites.push(vehicleSprite);
  }

  removeVehicle(vehicle: Vehicle) {
    const toRemove = this.findVehicleSprite(vehicle);
    toRemove.sprite().destroy(false);
    this.vehicleSprites = this.vehicleSprites.filter(v => v !== toRemove);
  }

  findVehicleSprite(vehicle: Vehicle): VehicleSprite {
    return this.vehicleSprites.find(sprite => {
      return sprite.getVehicle() === vehicle;
    });
  }

  findChargingStationSprite(chargingStation: ChargingStation): ChargingStationSprite {
    return this.chargingStationSprites.find(sprite => {
      return sprite.chargingStation === chargingStation;
    })
  }

  update(): void {
    this.vehicleSprites.forEach(sprite => {
      let vehicle = sprite.getVehicle();
      if (vehicle.status === Status.MOVING) {
        let distanceInMetres = vehicle.totalDistance;
        let y = distanceInMetres / this.distanceToPixelsFactor;
        sprite.sprite().x = this.x;
        sprite.sprite().y = y + this.margin;
      }
    });
  }

  renderChargingStation(csSprite: ChargingStationSprite): void {
    this.chargingStationSprites.push(csSprite);
    const locationInMeters = csSprite.chargingStation.locationInMeters;
    let y = locationInMeters / this.distanceToPixelsFactor;
    csSprite.circle.x = this.x - 25;
    csSprite.circle.y = y + this.margin;
  }

  renderChargingVehicle(vehicle: Vehicle, chargingStation: ChargingStation): void {
    const vehicleSprite = this.findVehicleSprite(vehicle);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    vehicleSprite.sprite().y = chargingStationSprite.circle.y;
    vehicleSprite.sprite().x = this.x - 40 - (chargingStation.vehicles.length * 20);
  }

  renderMovingVehicle(vehicle: Vehicle) {
    const sprite = this.findVehicleSprite(vehicle);
    let distanceInMetres = vehicle.totalDistance;
    sprite.sprite().y = distanceInMetres / this.distanceToPixelsFactor;
    sprite.sprite().x = this.x;
  }
}
