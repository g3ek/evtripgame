import {Route} from "./route";
import {Vehicle} from "./vehicle";
import {from, observable, Observable, Subscription, timer} from "rxjs";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";

export class MainScene extends Phaser.Scene {

  private static TIME_MULTIPLIER: number = 8;

  private vehicles: Vehicle[] = [];
  private starttime: number = 0;
  private readonly route = new Route(this);
  private eventDispatcher: EvtripEventDispatcher = new EvtripEventDispatcher();

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preLoad(): void {
  }

  create(): void {
    this.route.setEventDispatcher(this.eventDispatcher);
    this.route.render(250);
    this.addVehicle();
    this.time.addEvent({
      delay: Phaser.Math.Between(5000*8, 10000*8),
      loop: true,
      startAt: 5000,
      callback: () => {
        let vehicle = this.addVehicle();
      }
    });

    let socText = this.add.text(30, 550, "Soc: ", {
      color: 'black'
    });
    socText.setVisible(false);

    let subscription: Subscription = null;
    let vehicle: Vehicle = null;
    this.eventDispatcher.on("showvehiclestats", (thevehicle: Vehicle) => {

      if (subscription !== null) {
        subscription.unsubscribe();
      }

      if (vehicle !== null && vehicle === thevehicle) {
        socText.setVisible(false);
        vehicle = null;
        subscription = null;
      } else {
        socText.setVisible(true);
        vehicle = thevehicle;
        subscription = thevehicle.observable.subscribe(v => {
          socText.setText("Distance: " + v.distance);
        });
      }
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.route.update();
  }

  private addVehicle(): Vehicle {
    const vehicle = new Vehicle();
    this.route.addVehicle(vehicle);
    return vehicle;
  }
}
