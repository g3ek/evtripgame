import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {CommonStyle} from "./common-style";
import {Scene} from "phaser";
import Text = Phaser.GameObjects.Text;

export class VehicleInfo {

  private vehicle: Vehicle;
  private subscription: Subscription;
  private text: Text;

  constructor() {
  }

  create(scene: Scene): void {
    this.text = scene.add.text(30, 750, "Soc: ", CommonStyle.NORMAL_STYLE);
    this.text.setVisible(false);
    this.subscription = null;
  }

  show(vehicle: Vehicle): void {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
    if (this.vehicle !== null && this.vehicle === vehicle) {
      this.text.setVisible(false);
      this.vehicle = null;
      this.subscription = null;
    } else {
      this.text.setVisible(true);
      this.vehicle = vehicle;
      this.subscription = vehicle.observable.subscribe(v => {
        let kms = v.distance / 1000;
        kms = (Math.round(kms*100)) / 100;
        const factor = v.capacity / 100;
        const socPercent = Math.round((v.soc / factor)*100) / 100;
        const capacity = v.capacity / 1000;
        const consumption = Math.round(v.consumption);
        let range = (vehicle.soc / (vehicle.consumption/1000)) / 1000;
        range = Math.round(range*100) / 100;
        this.text.setText(
          "Distance: " + kms + " km\n" +
          "SoC: " + socPercent + " %\n" +
          "Wh/km (~): " + consumption + "\n" +
          "Capacity: " + capacity + " kWh" + "\n" +
          "Range: " + range + " km"
        );
      });
    }
  }
}
