import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {CommonStyle} from "./common-style";
import {RouteGraphics} from "./route-graphics";
import Container = Phaser.GameObjects.Container;

export class ChargingStationStats {

  private current: ChargingStation = null;
  private subscriptions: Subscription[] = [];
  private scene: Scene;
  private container: Container = null;
  private routeGraphics: RouteGraphics;

  constructor(scene: Scene, routeGraphics: RouteGraphics, x: number, y: number) {
    this.scene = scene;
    this.routeGraphics = routeGraphics;
    this.container = this.scene.add.container(x, y);
    this.container.setVisible(false);
    this.container.setDepth(-1);
  }

  makeHeaders() {
    let socHeader = this.scene.make.text({});
    socHeader.setStyle(CommonStyle.NORMAL_STYLE);
    socHeader.setPosition(50, 0);
    socHeader.setText("SoC");
    this.container.add(socHeader);
  }

  update(chargingStation: ChargingStation): void {
    if (chargingStation === this.current) {
      this.cleanup();
      this.makeHeaders();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    }
  }

  show(chargingStation: ChargingStation): void {
    if (this.current === null) {
      this.container.setVisible(true);
      this.current = chargingStation;
      this.makeHeaders();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else if (this.current !== chargingStation) {
      this.cleanup();
      this.makeHeaders();
      this.current = chargingStation;
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else {
      this.cleanup();
      this.current = null;
      this.container.setVisible(false);
    }
  }

  cleanup(): void {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    this.container.removeAll(true);
    this.cleanUpVehicleSprites();
  }

  private cleanUpVehicleSprites() {
    if (this.current !== null) {
      this.current.vehicles
        .filter(v => v !== null)
        .forEach(v => {
        let vehicleSprite = this.routeGraphics.findVehicleSprite(v);
        vehicleSprite.visible(false);
      });
      this.current.waiting.forEach(v => {
        let vehicleSprite = this.routeGraphics.findVehicleSprite(v);
        vehicleSprite.visible(false);
      });
    }
  }

  private showVehicleStats(vehicles: Vehicle[], waiting: Vehicle[]) {
    for(let i=0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      if (vehicle != null) {
        let vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
        vehicleSprite.render(30, 300 + (i * 45));
        vehicleSprite.visible(true);
        this.makeSoCField(vehicle, i);
      }
    }
    for(let i=0; i < waiting.length; i++) {
      const vehicle = waiting[i];
      let yOffset = (i+this.current.slots)
      let vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
      vehicleSprite.render(30, 300 + (yOffset * 45));
      vehicleSprite.visible(true);
      this.makeSoCField(vehicle, i+this.current.slots);
    }
  }

  private makeSoCField(vehicle: Vehicle, index: number) {
    let socText = this.scene.make.text({});
    socText.setStyle(CommonStyle.NORMAL_STYLE);
    socText.setPosition(50, 40+(index*45));
    this.container.add(socText);
    const factor = vehicle.capacity / 100;
    let subscription = vehicle.observable.subscribe(v => {
      const socPercent = Math.round((v.soc / factor)*100) / 100;
      socText.setText('' + socPercent);
    });
    this.subscriptions.push(subscription);
  }
}
