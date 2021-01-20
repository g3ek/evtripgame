import {Scene} from "phaser";
import {Status, Vehicle} from "./vehicle";
import {CommonStyle} from "./common-style";
import {Subscription} from "rxjs";
import {RouteGraphics} from "./route-graphics";
import {AbstractChargingStrategy} from "./charging-strategy";
import {GameButton} from "./game-button";
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;

export class VehicleInfo {

  private container: Container;
  private scene: Scene;
  private title: Text;
  private socValue: Text;
  private rangeValue: Text;
  private capacityValue: Text;
  private consumptionValue: Text;
  private strategyValue: Text;
  private thresholdValue: Text;
  private subscriptions: Subscription[] = [];
  private vehicle: Vehicle = null;
  private routeGraphics: RouteGraphics;

  constructor(scene: Scene, routeGraphics: RouteGraphics, x: number, y: number) {
    this.routeGraphics = routeGraphics;
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(3); // above vehicle sprites
    this.container.setVisible(false);
  }

  create(): void {
    let backScreen = this.scene.make.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
    backScreen.fillRoundedRect(0, 0, 400, 280, 10);
    backScreen.lineStyle(5, 0x000000);
    backScreen.strokeRoundedRect(0, 0, 400, 280);
    backScreen.setDepth(1);
    this.container.add(backScreen);

    const socLabel = this.scene.make.text({});
    socLabel.setPosition(10, 10);
    socLabel.setStyle(CommonStyle.NORMAL_STYLE);
    socLabel.setText('SoC');
    this.container.add(socLabel);

    this.socValue = this.scene.make.text({});
    this.socValue.setPosition(200, 10);
    this.socValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.socValue);

    const rangeLabel = this.scene.make.text({});
    rangeLabel.setPosition(10, 40);
    rangeLabel.setStyle(CommonStyle.NORMAL_STYLE);
    rangeLabel.setText('Range');
    this.container.add(rangeLabel);

    this.rangeValue = this.scene.make.text({});
    this.rangeValue.setPosition(200, 40);
    this.rangeValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.rangeValue);

    const capacityLabel = this.scene.make.text({});
    capacityLabel.setPosition(10, 70);
    capacityLabel.setStyle(CommonStyle.NORMAL_STYLE);
    capacityLabel.setText('Capacity');
    this.container.add(capacityLabel);

    this.capacityValue = this.scene.make.text({});
    this.capacityValue.setPosition(200, 70);
    this.capacityValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.capacityValue);

    const consumptionLabel = this.scene.make.text({});
    consumptionLabel.setPosition(10, 100);
    consumptionLabel.setStyle(CommonStyle.NORMAL_STYLE);
    consumptionLabel.setText('Consumption');
    this.container.add(consumptionLabel);

    this.consumptionValue = this.scene.make.text({});
    this.consumptionValue.setPosition(200, 100);
    this.consumptionValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.consumptionValue);

    const thresholdLabel = this.scene.make.text({});
    thresholdLabel.setPosition(10, 130);
    thresholdLabel.setStyle(CommonStyle.NORMAL_STYLE);
    thresholdLabel.setText('Threshold');
    this.container.add(thresholdLabel);

    this.thresholdValue = this.scene.make.text({});
    this.thresholdValue.setPosition(200, 130);
    this.thresholdValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.thresholdValue);

    const strategyLabel = this.scene.make.text({});
    strategyLabel.setPosition(10, 160);
    strategyLabel.setStyle(CommonStyle.NORMAL_STYLE);
    strategyLabel.setText('Strategy');
    this.container.add(strategyLabel);

    this.strategyValue = this.scene.make.text({});
    this.strategyValue.setPosition(200, 160);
    this.strategyValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.strategyValue);

    const closeButtonContainer = this.scene.make.container({});
    closeButtonContainer.setPosition(120, 210);
    const closeButton = new GameButton();
    closeButton.create(this.scene, closeButtonContainer, "Close", 120);
    closeButton.setAction(() => {
      this.hide(this.vehicle);
    });
    this.container.add(closeButtonContainer);
  }

  show(vehicle: Vehicle): void {
    if (this.vehicle === null) {
      this.vehicle = vehicle;
      this.showVehicle(vehicle);
    } else if (this.vehicle !== vehicle) {
      this.cleanup();
      this.vehicle = vehicle;
      this.showVehicle(vehicle);
    } else {
      this.cleanup();
      this.vehicle = null;
      this.container.setVisible(false);
    }
  }

  showVehicle(vehicle: Vehicle) {
    let vehicleSprite = this.routeGraphics.findVehicleSprite(vehicle);
    vehicleSprite.select(true);
    let range = vehicle.getRange();
    let socPercent = vehicle.getFormattedSoc();
    this.capacityValue.setText('' + (vehicle.capacity / 1000));
    this.rangeValue.setText('' + range);
    this.socValue.setText('' + socPercent);
    this.consumptionValue.setText('' + vehicle.getFormattedConsumption());
    this.thresholdValue.setText('' + vehicle.getFormattedThreshold());
    this.strategyValue.setText(AbstractChargingStrategy.getLabel(vehicle.chargingStrategy.type()));
    this.container.setVisible(true);
    if (vehicle.status === Status.CHARGING || vehicle.status === Status.MOVING) {
      let subscription = vehicle.observable.subscribe(v => {
        range = v.getRange();
        socPercent = v.getFormattedSoc();
        this.rangeValue.setText('' + range);
        this.socValue.setText('' + socPercent);
      });
      this.subscriptions.push(subscription);
    }
  }

  private cleanup() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    let vehicleSprite = this.routeGraphics.findVehicleSprite(this.vehicle);
    vehicleSprite.select(false);
  }

  hide(vehicle: Vehicle) {
    if (this.vehicle === vehicle) {
      this.cleanup();
      this.vehicle = null;
      this.container.setVisible(false);
    }
  }
}
