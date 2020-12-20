import {Vehicle} from "./vehicle";
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
import {Slider} from "./slider";
import {VehicleInfo} from "./vehicle-info";
import {GameButton} from "./game-button";

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
    this.vehicleFactory = new VehicleFactory(clock, this, this.eventDispatcher);
    this.controller = new Controller(this.routeGraphics, clock);
    let slider = new Slider(this, 30, 100, 40);
    slider.setAction(() => {
      clock.timeScale = slider.value;
      this.vehicleFactory.updateNewCarTimerEvent(slider.value);
    });

    let chargingStationSelection = new ChargingStationSelection("chargingstationselection", this.eventDispatcher);
    chargingStationSelection.create(this);
    this.routeGraphics.render(250);
    let vehicle = this.vehicleFactory.create();
    this.addVehicle(vehicle); // begin immediately
    let vehicleInfo = new VehicleInfo();
    vehicleInfo.create(this);
    let pauseButton = new GameButton(this, 30, 140, "Pause");
    pauseButton.setAction(() => {
      this.time.paused = !this.time.paused;
      if (this.time.paused) {
        pauseButton.setText("Start");
        clock.pause();
      } else {
        pauseButton.setText("Pause");
      }
    });
    this.eventDispatcher.on("showvehiclestats", (vehicle: Vehicle) => {
      vehicleInfo.show(vehicle);
    });
    this.eventDispatcher.on("addchargingstation", (power: number, distance: number) => {
      this.addChargingStation(power, distance);
    });
    this.eventDispatcher.on("newvehicle", (vehicle: Vehicle) => {
      this.addVehicle(vehicle);
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.controller.update(delta);
    this.routeGraphics.update();
  }

  private addVehicle(vehicle): void {
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
