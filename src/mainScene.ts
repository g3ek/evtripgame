import {Vehicle} from "./vehicle";
import {Subscription} from "rxjs";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {VehicleFactory} from "./vehicle-factory";
import {Controller} from "./controller";
import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {Clock} from "./clock";
import {ChargingStationSelection} from "./charging-station-selection";
import {ChargingStationFactory} from "./charging-station-factory";
import {ChargingStation} from "./charging-station";
import {ChargingStationSprite} from "./charging-station-sprite";
import {CommonStyle} from "./common-style";
import {Slider} from "./slider";

export class MainScene extends Phaser.Scene {

  private readonly routeGraphics = new RouteGraphics(this);
  private eventDispatcher: EvtripEventDispatcher = new EvtripEventDispatcher();
  private controller: Controller;
  private vehicleFactory: VehicleFactory;
  private chargingStationFactory: ChargingStationFactory = new ChargingStationFactory();

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload(): void {
    this.load.html("chargingstationselection", "assets/html/chargingstationselection.html");
  }

  create(): void {
    let clock = new Clock(this);
    clock.create();
    this.vehicleFactory = new VehicleFactory(clock);
    this.controller = new Controller(this.routeGraphics, clock);
    let slider = new Slider(this, 30, 100, 40);
    slider.setAction(() => {
      Controller.TIMEFACTOR = slider.value;
    });

    let chargingStationSelection = new ChargingStationSelection("chargingstationselection", this.eventDispatcher);
    chargingStationSelection.create(this);
    this.routeGraphics.render(250);
    this.addVehicle(); // begin immediately
    this.time.addEvent({
      delay: Phaser.Math.Between(5000 * 8, 10000 * 8),
      loop: true,
      startAt: 5000,
      callback: () => {
        let vehicle = this.addVehicle();
      }
    });

    let socText = this.add.text(30, 750, "Soc: ", CommonStyle.NORMAL_STYLE);
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
          let kms = v.distance / 1000;
          kms = (Math.round(kms*100)) / 100;
          const factor = v.capacity / 100;
          const socPercent = Math.round((v.soc / factor)*100) / 100;
          const capacity = v.capacity / 1000;
          const consumption = Math.round(v.consumption);
          let range = (vehicle.soc / (vehicle.consumption/1000)) / 1000;
          range = Math.round(range*100) / 100;
          socText.setText(
            "Distance: " + kms + " km\n" +
            "SoC: " + socPercent + " %\n" +
            "Wh/km (~): " + consumption + "\n" +
            "Capacity: " + capacity + " kWh" + "\n" +
            "Range: " + range + " km"
          );
        });
      }
    });
    this.eventDispatcher.on("addchargingstation", (power: number, distance: number) => {
      this.addChargingStation(power, distance);
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.controller.update(delta);
    this.routeGraphics.update();
  }

  private addVehicle(): void {
    let vehicle = this.vehicleFactory.create();
    let vehicleSprite = new VehicleSprite(vehicle, this.eventDispatcher);
    vehicleSprite.create(this);
    this.controller.addVehicle(vehicle);
    this.routeGraphics.addVehicle(vehicleSprite);
  }

  private addChargingStation(power: number, distance: number): void {
    let chargingStation = new ChargingStation();
    chargingStation.locationInMeters = distance * 1000;
    chargingStation.power = power;
    let csSprite = new ChargingStationSprite(chargingStation);
    csSprite.create(this);
    this.controller.addChargingStation(chargingStation);
    this.routeGraphics.renderChargingStation(csSprite);
  }
}
