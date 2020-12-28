import {VehicleSprite} from "./vehicle-sprite";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {CommonStyle} from "./common-style";
import Pointer = Phaser.Input.Pointer;

export class RouteGraphics {

  //static DISTANCE_METRES: number = 250000; // 250km
  static DISTANCE_METRES: number = 100000; // 100km

  private scene: Phaser.Scene;
  private margin: number = 50;
  private marginX: number = 60;
  private roadWidth: number = 10;
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

    let background = this.scene.add.graphics({
      fillStyle: {
        color: 0xffffff,
        alpha: 1
      }
    });

    const roadGraphics = this.scene.add.graphics({
      fillStyle: {
        color: 0x0a0ae0,
        alpha: 1
      }
    });
    this.roadLengthPixels = (<number>height) - (this.margin * 2);
    this.x = width - this.marginX;
    roadGraphics.fillRect(this.x, this.margin, this.roadWidth, this.roadLengthPixels);
    this.distanceToPixelsFactor = RouteGraphics.DISTANCE_METRES / this.roadLengthPixels;
    this.renderDistanceMarkers();

    this.scene.cameras.main.setBounds(0, 0, width - 140, height);
    let roadCamera = this.scene.cameras.add();
    background.fillRect(width - 200, 0, 400, height);
    roadCamera.setViewport(width - 180, 0, 180, height);
    //roadCamera.setScroll(this.x, this.margin);
    roadCamera.setBounds(width - 100, 0, 100, height);
    //roadCamera.centerToBounds();
    //roadCamera.scrollY = 45;
    this.scene.input.on('wheel', (pointer: Pointer, currentlyOver, deltaX: number, deltaZ: number, deltaY:number) => {
      if (deltaZ < 0 && roadCamera.zoom < 3) {
        roadCamera.setZoom(roadCamera.zoom + 0.1);
      } else if (deltaZ > 0 && roadCamera.zoom > 1) {
        roadCamera.setZoom(roadCamera.zoom - 0.1);
      }
      roadCamera.centerOnY(pointer.y);

    });
  }

  renderDistanceMarkers() {
    let km25 = RouteGraphics.DISTANCE_METRES / 25000;
    for(let i=0; i <= km25; i++) {
      let y = (25000 * i) / this.distanceToPixelsFactor;
      this.scene.add.text(this.x+15, y+this.margin, ""+(25*i)+"km", CommonStyle.NORMAL_STYLE)
        .setScale(0.5)
        .setOrigin(0, 0.5);
    }
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
        sprite.render(this.x + this.roadWidth /2, y + this.margin);
      }
    });
  }

  renderChargingStation(csSprite: ChargingStationSprite): void {
    this.chargingStationSprites.push(csSprite);
    csSprite.render(this.distanceToPixelsFactor, this.x, this.margin);
  }

  renderChargingVehicle(vehicle: Vehicle, chargingStation: ChargingStation): void {
    const vehicleSprite = this.findVehicleSprite(vehicle);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    //vehicleSprite.sprite().y = chargingStationSprite.circle.y;
    chargingStationSprite.renderVehicle();
    vehicleSprite.sprite().setVisible(false);
    //let index = chargingStation.vehicles.findIndex(v => v === vehicle);
    //vehicleSprite.sprite().x = this.x - 40 - (index * 40);
  }

  renderMovingVehicle(vehicle: Vehicle, chargingStation: ChargingStation) {
    const sprite = this.findVehicleSprite(vehicle);
    let distanceInMetres = vehicle.totalDistance;
    sprite.sprite().y = distanceInMetres / this.distanceToPixelsFactor;
    sprite.sprite().x = this.x;
    sprite.sprite().setVisible(true);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    chargingStationSprite.renderVehicle();
  }

  renderWaitingVehicle(vehicle: Vehicle, chargingStation: ChargingStation) {
    const vehicleSprite = this.findVehicleSprite(vehicle);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    vehicleSprite.sprite().setVisible(false);
    chargingStationSprite.renderVehicle();
    //vehicleSprite.sprite().y = chargingStationSprite.circle.y;
    //vehicleSprite.sprite().x = this.x - (chargingStation.slots*40) - 10 - (chargingStation.waiting.length * 20);
  }
}
