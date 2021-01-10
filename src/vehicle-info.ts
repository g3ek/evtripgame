import {Scene} from "phaser";
import {Vehicle} from "./vehicle";
import {CommonStyle} from "./common-style";
import {Subscription} from "rxjs";
import {RouteGraphics} from "./route-graphics";
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.Text;

export class VehicleInfo {

  private container: Container;
  private scene: Scene;
  private title: Text;
  private socValue: Text
  private rangeValue: Text
  private subscriptions: Subscription[] = [];
  private vehicle: Vehicle = null;
  private routeGraphics: RouteGraphics;

  constructor(scene: Scene, routeGraphics: RouteGraphics, x: number, y: number) {
    this.routeGraphics = routeGraphics;
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(2); // above vehicle sprites
    this.container.setVisible(false);
  }

  create(): void {
    let backScreen = this.scene.make.graphics({
      fillStyle: {
        color: 0xffffff
      }
    });
    backScreen.fillRect(0, 0, 400, 280);
    backScreen.lineStyle(5, 0x000000);
    backScreen.strokeRoundedRect(0, 0, 400, 280);
    backScreen.setDepth(1);
    this.container.add(backScreen);

    this.title = this.scene.make.text({});
    this.title.setPosition(10, 10);
    this.title.setStyle(CommonStyle.NORMAL_STYLE); // need to set, probably a bug
    this.container.add(this.title);

    const socLabel = this.scene.make.text({});
    socLabel.setPosition(10, 30);
    socLabel.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(socLabel);

    this.socValue = this.scene.make.text({});
    this.socValue.setPosition(140, 30);
    this.socValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.socValue);

    const rangeLabel = this.scene.make.text({});
    rangeLabel.setPosition(10, 60);
    rangeLabel.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(rangeLabel);

    this.rangeValue = this.scene.make.text({});
    this.rangeValue.setPosition(140, 60);
    this.rangeValue.setStyle(CommonStyle.NORMAL_STYLE);
    this.container.add(this.rangeValue);
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

    this.container.setVisible(true);
    let subscription = vehicle.observable.subscribe(v => {
      const range = v.getRange();
      const socPercent = v.getFormattedSoc();
      this.rangeValue.setText('' + range);
      this.socValue.setText('' + socPercent);
    });
    this.subscriptions.push(subscription);
  }

  private cleanup() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    let vehicleSprite = this.routeGraphics.findVehicleSprite(this.vehicle);
    vehicleSprite.select(false);
  }
}
