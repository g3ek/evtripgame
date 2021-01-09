import {Scene} from "phaser";
import {Vehicle} from "./vehicle";
import {CommonStyle} from "./common-style";
import {Subscription} from "rxjs";
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

  constructor(scene: Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(1);
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
    this.container.setVisible(true);

    const factor = vehicle.capacity / 100;

    //speedTD.textContent = Math.floor(vehicle.mpsSpeed*3.6) + "";
    let subscription = vehicle.observable.subscribe(v => {
      const range = v.soc / v.consumption;
      const socPercent = Math.round((v.soc / factor) * 10) / 10;
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
  }
}
