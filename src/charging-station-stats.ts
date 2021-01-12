import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Status, Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {CommonStyle} from "./common-style";
import {RouteGraphics} from "./route-graphics";
import {AbstractChargingStrategy} from "./charging-strategy";
import Container = Phaser.GameObjects.Container;
import Group = Phaser.GameObjects.Group;
import Text = Phaser.GameObjects.Text;

export class ChargingStationStats {

  private current: ChargingStation = null;
  private subscriptions: Subscription[] = [];
  private scene: Scene;
  private container: Container = null;
  private routeGraphics: RouteGraphics;
  private textsGroup: Group;

  constructor(scene: Scene, routeGraphics: RouteGraphics, x: number, y: number) {
    this.scene = scene;
    this.routeGraphics = routeGraphics;
    this.container = this.scene.add.container(x, y);
    this.container.setVisible(false);
    this.textsGroup = scene.add.group();
    this.makeBackGround();
    this.makeHeaders();
  }

  makeHeaders() {
    const socHeader = this.scene.make.text({});
    socHeader.setStyle(CommonStyle.NORMAL_STYLE);
    socHeader.setPosition(20, 10);
    socHeader.setText("%");
    this.container.add(socHeader);

    const rangeHeader = this.scene.make.text({});
    rangeHeader.setStyle(CommonStyle.NORMAL_STYLE);
    rangeHeader.setPosition(60, 10);
    rangeHeader.setText("Kms");
    this.container.add(rangeHeader);

    const strategyHeader = this.scene.make.text({});
    strategyHeader.setStyle(CommonStyle.NORMAL_STYLE);
    strategyHeader.setPosition(140, 10);
    strategyHeader.setText("Strategy");
    this.container.add(strategyHeader);
  }

  makeBackGround() {
    let backScreen = this.scene.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
    backScreen.fillRoundedRect(0, 0, 400, 1000, 10);
    backScreen.lineStyle(5, 0x000000);
    backScreen.strokeRoundedRect(0, 0, 400, 1000);
    this.container.add(backScreen);
  }

  updateVehicles(chargingStation: ChargingStation): void {
    if (chargingStation === this.current) {
      this.cleanup();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    }
  }

  show(chargingStation: ChargingStation): void {
    if (this.current === null) {
      this.container.setVisible(true);
      this.current = chargingStation;
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else if (this.current !== chargingStation) {
      this.cleanup();
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
    this.container.each(o => {
      if (this.textsGroup.contains(o)) {
        this.textsGroup.killAndHide(o);
      }
    });
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
        const vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
        vehicleSprite.render(60, 315 + (i * 45));
        vehicleSprite.visible(true);
        this.makeFields(vehicle, i);
      }
    }
    for(let i=0; i < waiting.length; i++) {
      const vehicle = waiting[i];
      const yOffset = (i+this.current.slots)
      const vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
      vehicleSprite.render(60, 315 + (yOffset * 45));
      vehicleSprite.visible(true);
      this.makeFields(vehicle, i+this.current.slots);
    }
  }

  private makeFields(vehicle: Vehicle, index: number) {
    const rangeText = this.setUpField(60, 50+(index*45));
    const strategyText = this.setUpField(140, 50+(index*45));
    let range = vehicle.getRange();
    const strategy = AbstractChargingStrategy.getLabel(vehicle.chargingStrategy.type());
    strategyText.setText(strategy);
    const vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
    if (vehicle.status === Status.CHARGING) {
      let subscription = vehicle.observable.subscribe(v => {
        vehicleSprite.updateSoc();
        range = v.getRange();
        rangeText.setText('' + range);
      });
      this.subscriptions.push(subscription);
    } else {
      rangeText.setText('' + range);
    }
  }

  private setUpField(x: number, y: number): Text {
    let textField = this.textsGroup.getFirstDead(false);
    if (textField === null) {
      textField = this.scene.make.text({});
      textField.setStyle(CommonStyle.NORMAL_STYLE);
      this.textsGroup.add(textField);
      this.container.add(textField);
    } else {
      textField.active = true; // only way to resurrect ?!
    }
    textField.setPosition(x, y);
    textField.setVisible(true);
    return textField;
  }
}
