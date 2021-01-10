import {VehicleSprite} from "./vehicle-sprite";
import {ChargingStationSprite} from "./charging-station-sprite";
import {Status, Vehicle} from "./vehicle";
import {ChargingStation} from "./charging-station";
import {CommonStyle} from "./common-style";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import Pointer = Phaser.Input.Pointer;
import Camera = Phaser.Cameras.Scene2D.Camera;
import Point = Phaser.Geom.Point;

export class RouteGraphics {

  //static DISTANCE_METRES: number = 250000; // 250km
  static DISTANCE_METRES: number = 100000; // 100km

  private scene: Phaser.Scene;
  private margin: number = 50;
  private marginX: number = 80;
  private roadWidth: number = 10;
  private distance: number;
  private roadLengthPixels: number;
  private x: number;
  private distanceToPixelsFactor: number;
  private vehicleSprites: VehicleSprite[] = [];
  private chargingStationSprites: ChargingStationSprite[] = [];
  private roadCamera: Camera;
  private swipePoint: Point = null;
  private cameraPoint: Point = null;
  private eventDispatcher: EvtripEventDispatcher;

  constructor(scene: Phaser.Scene, eventDispatcher: EvtripEventDispatcher) {
    this.scene = scene;
    this.eventDispatcher = eventDispatcher;
  }

  render(distance: number): void {
    this.distance = distance;
    const heightConfig = this.scene.game.config.height;
    const widthConfig = this.scene.game.config.width;
    const height: number = (<number>heightConfig);
    const width: number = (<number>widthConfig);

    const scrollWidth = 240;
    let background = this.scene.add.graphics({
      fillStyle: {
        color: 0xffffff,
        alpha: 1
      }
    });
    background.fillRect(width - scrollWidth, 0, 400, height);
    background.setInteractive(new Phaser.Geom.Rectangle(width-scrollWidth, 0, 400, height), Phaser.Geom.Rectangle.Contains);

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

    this.scene.cameras.main.setBounds(0, 0, width-scrollWidth, height);
    this.roadCamera = this.scene.cameras.add();
    this.roadCamera.setViewport(width - scrollWidth, 0, scrollWidth, height);
    this.roadCamera.setBounds(width - scrollWidth, 0, scrollWidth, height);
    this.scene.input.on('wheel', (pointer: Pointer, currentlyOver, deltaX: number, deltaZ: number) => {
      if (deltaZ < 0 && this.roadCamera.zoom < 3) {
        this.roadCamera.setZoom(this.roadCamera.zoom + 0.1);
      } else if (deltaZ > 0 && this.roadCamera.zoom > 1) {
        this.roadCamera.setZoom(this.roadCamera.zoom - 0.1);
      }
      this.roadCamera.centerOnY(pointer.y);
    });

    background.on('pointerdown', (pointer: Pointer, currentlyOver) => {
      this.swipePoint = new Point(pointer.x, pointer.y);
      this.cameraPoint = new Point(this.roadCamera.scrollX, this.roadCamera.scrollY);
    });
    background.on('pointerup', () => {
      this.swipePoint = null;
      this.cameraPoint = null;
    });
    background.on('pointerout', () => {
      this.swipePoint = null;
      this.cameraPoint = null;
    });
    background.on('pointerup', (pointer: Pointer) => {
      let worldPoint = this.roadCamera.getWorldPoint(pointer.x, pointer.y);
      const distance = (worldPoint.y-this.margin) * this.distanceToPixelsFactor;
      this.eventDispatcher.emit('distanceselected', distance);
    });
  }

  renderDistanceMarkers() {
    let km25 = RouteGraphics.DISTANCE_METRES / 25000;
    for(let i=0; i <= km25; i++) {
      let y = (25000 * i) / this.distanceToPixelsFactor;
      this.scene.add.text(this.x+25, y+this.margin, ""+(25*i)+"km", CommonStyle.NORMAL_STYLE)
        .setScale(0.5)
        .setOrigin(0, 0.5);
      let markerLine = this.scene.add.graphics({
        lineStyle: {
          color: 0x0a0ae0,
          alpha: 1,
          width: 2
        }
      });
      markerLine.lineBetween(this.x, y+this.margin, this.x+20, y+this.margin);

    }
  }

  addVehicle(vehicleSprite: VehicleSprite) {
    this.vehicleSprites.push(vehicleSprite);
  }

  removeVehicle(vehicle: Vehicle) {
    const toRemove = this.findVehicleSprite(vehicle);
    toRemove.destroy();
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
    if (this.swipePoint != null) {
      let activePointer = this.scene.input.activePointer;
      const xdelta = activePointer.x - this.swipePoint.x;
      const ydelta = activePointer.y - this.swipePoint.y;
      this.roadCamera.scrollX = this.cameraPoint.x - xdelta;
      this.roadCamera.scrollY = this.cameraPoint.y -ydelta;
    }
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
    chargingStationSprite.renderVehicle();
    vehicleSprite.visible(false);
  }

  renderMovingVehicle(vehicle: Vehicle, chargingStation: ChargingStation) {
    const sprite = this.findVehicleSprite(vehicle);
    let distanceInMetres = vehicle.totalDistance;
    sprite.render(this.x, distanceInMetres / this.distanceToPixelsFactor);
    sprite.visible(true);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    chargingStationSprite.renderVehicle();
  }

  renderWaitingVehicle(vehicle: Vehicle, chargingStation: ChargingStation) {
    const vehicleSprite = this.findVehicleSprite(vehicle);
    const chargingStationSprite = this.findChargingStationSprite(chargingStation);
    vehicleSprite.visible(false);
    chargingStationSprite.renderVehicle();
    //vehicleSprite.sprite().y = chargingStationSprite.circle.y;
    //vehicleSprite.sprite().x = this.x - (chargingStation.slots*40) - 10 - (chargingStation.waiting.length * 20);
  }
}
