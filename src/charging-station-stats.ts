import {Scene} from "phaser";
import {ChargingStation} from "./charging-station";
import {Status, Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {CommonStyle} from "./common-style";
import {RouteGraphics} from "./route-graphics";
import {AbstractChargingStrategy} from "./charging-strategy";
import {Clock} from "./clock";
import {BlinkTime} from "./blinker";
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
  private clock: Clock;
  private infoText: Text;

  constructor(scene: Scene, routeGraphics: RouteGraphics, clock: Clock) {
    this.scene = scene;
    this.routeGraphics = routeGraphics;
    this.clock = clock;

  }

  create(x: number, y: number): void {
    this.container = this.scene.add.container(x, y);
    this.container.setVisible(false);
    this.textsGroup = this.scene.add.group();
    this.makeBackGround();
    this.makeHeaders();
  }

  makeHeaders(): void {
    const socHeader = this.scene.make.text({});
    socHeader.setStyle(CommonStyle.NORMAL_STYLE);
    socHeader.setPosition(20, 50);
    socHeader.setText("%");
    this.container.add(socHeader);

    const rangeHeader = this.scene.make.text({});
    rangeHeader.setStyle(CommonStyle.NORMAL_STYLE);
    rangeHeader.setPosition(60, 50);
    rangeHeader.setText("Kms");
    this.container.add(rangeHeader);

    const strategyHeader = this.scene.make.text({});
    strategyHeader.setStyle(CommonStyle.NORMAL_STYLE);
    strategyHeader.setPosition(140, 50);
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
      this.showInfoLine();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    }
  }

  show(chargingStation: ChargingStation): void {
    let chargingStationSprite = this.routeGraphics.findChargingStationSprite(chargingStation);
    if (this.current === null) {
      chargingStationSprite.select(true);
      this.container.setVisible(true);
      this.current = chargingStation;
      this.showInfoLine();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else if (this.current !== chargingStation) {
      let currentCSSprite = this.routeGraphics.findChargingStationSprite(this.current);
      currentCSSprite.select(false);
      chargingStationSprite.select(true);
      this.cleanup();
      this.current = chargingStation;
      this.showInfoLine();
      this.showVehicleStats(chargingStation.vehicles, chargingStation.waiting);
    } else {
      chargingStationSprite.select(false);
      this.cleanup();
      this.current = null;
      this.container.setVisible(false);
    }
  }

  private showInfoLine(): void {
    this.infoText = this.setUpField(20, 10);
    this.updateInfoLine();
  }

  private updateInfoLine(): void {
    let sum = 0;
    this.current.vehicles
      .filter(v => v !== null)
      .forEach(v => {
      sum += v.getPowerRelativeToSocAndLosses(this.current.power);
    });
    const load = (Math.floor((sum/1000)*10)) / 10;
    this.infoText.setText("KW : "+this.current.power/1000+" Load: "+load);
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
        vehicleSprite.render(60, 365 + (i * 45));
        vehicleSprite.visible(true);
        this.makeFields(vehicle, i);
      }
    }
    for(let i=0; i < waiting.length; i++) {
      const vehicle = waiting[i];
      const yOffset = (i+this.current.slots)
      const vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
      vehicleSprite.render(60, 365 + (yOffset * 45));
      vehicleSprite.visible(true);
      this.makeFields(vehicle, i+this.current.slots);
    }
  }

  private makeFields(vehicle: Vehicle, index: number) {
    const rangeText = this.setUpField(60, 100 + (index * 45));
    const strategyText = this.setUpField(140, 100 + (index * 45));
    let range = vehicle.getRange();
    const strategy = AbstractChargingStrategy.getLabel(vehicle.chargingStrategy.type());
    strategyText.setText(strategy);
    const vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
    if (vehicle.status === Status.CHARGING) {
      let subscription = vehicle.observable.subscribe(v => {
        vehicleSprite.updateSoc();
        range = v.getRange();
        rangeText.setText('' + range);
        this.updateInfoLine();
      });
      this.subscriptions.push(subscription);
    } else if (vehicle.status === Status.WAITING) {
      let subscription = vehicle.observable.subscribe(v => {
        if (!this.scene.time.paused) {
          const blinktime = v.getBlinktime(this.clock.time);
          if (blinktime === BlinkTime.FOURTH) {
            // todo game over
          } else if (blinktime !== null) {
            vehicleSprite.setupWaitingTimeout(blinktime);
          }
        }
      });
      rangeText.setText('' + range);
      this.subscriptions.push(subscription);
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

  stop() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }
}
