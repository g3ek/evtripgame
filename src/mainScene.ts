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
import {GameButton} from "./game-button";
import {ChargingStationStats} from "./charging-station-stats";
import {VehicleInfo} from "./vehicle-info";
import {ChoseNumberComponent} from "./chose-number-component";

export class MainScene extends Phaser.Scene {

  private eventDispatcher: EvtripEventDispatcher = new EvtripEventDispatcher();
  private readonly routeGraphics = new RouteGraphics(this, this.eventDispatcher);
  private controller: Controller;
  private vehicleFactory: VehicleFactory;
  private chargingStationFactory: ChargingStationFactory = new ChargingStationFactory();
  private chargingStationStats: ChargingStationStats;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload(): void {
    this.load.html("chargingstationselection", "assets/html/chargingstationselection.html");
    this.load.html("chargingstationstats", "assets/html/chargingstationtable.html");
    this.load.html("vehiclestats", "assets/html/vehiclestable.html");
  }

  create(): void {
    let clock = new Clock(this);
    clock.create();
    this.vehicleFactory = new VehicleFactory(clock, this, this.eventDispatcher);
    this.controller = new Controller(this.routeGraphics, clock, this.eventDispatcher);
    let timeFactorChooser = new ChoseNumberComponent([1, 5, 10, 15, 20, 25, 35, 40]);
    let timeChooserContainer = timeFactorChooser.create(this, 140, 'x', true);
    timeChooserContainer.setPosition(30, 80);
    timeFactorChooser.setAction(() => {
      let value = timeFactorChooser.getValue();
      clock.timeScale = value;
      this.vehicleFactory.updateNewCarTimerEvent(value);
    });

    let chargingStationSelection = new ChargingStationSelection(this.eventDispatcher);
    chargingStationSelection.create(this);
    this.chargingStationStats = new ChargingStationStats(this, this.routeGraphics, 30, 250, clock);
    let vehicleInfo = new VehicleInfo(this, this.routeGraphics, 70, 230);
    vehicleInfo.create();
    this.routeGraphics.render(250);
    const pauseContainer = this.add.container(30, 140);
    let pauseButton = new GameButton();
    pauseButton.create(this, pauseContainer, "Pause", 150);
    pauseButton.setAction(() => {
      this.time.paused = !this.time.paused;
      if (this.time.paused) {
        this.tweens.pauseAll();
        pauseButton.setText("Start");
        clock.pause();
      } else {
        this.tweens.resumeAll();
        pauseButton.setText("Pause");
      }
    });
    const addStationContainer = this.add.container(190, 140);
    let addStationButton = new GameButton();
    addStationButton.create(this, addStationContainer, "Add", 100);
    addStationButton.setAction(() => {
      chargingStationSelection.show();
    });
    this.eventDispatcher.on("showvehiclestats", (vehicle: Vehicle) => {
      vehicleInfo.show(vehicle);
    });
    this.eventDispatcher.on("addchargingstation", (power: number, distance: number, slots: number) => {
      this.addChargingStation(power, distance, slots);
    });
    this.eventDispatcher.on("newvehicle", (vehicle: Vehicle) => {
      this.addVehicle(vehicle);
      //vehicleStats.refresh(this.controller.vehicles);
    });
    this.eventDispatcher.on("showchargingstationstats", (chargingstation: ChargingStation) => {
      this.showChargingStationStats(chargingstation);
    });
    this.eventDispatcher.on("updatechargingstation", (chargingstation: ChargingStation) => {
      this.chargingStationStats.updateVehicles(chargingstation);
    });
    this.eventDispatcher.on("vehiclefinished", (vehicle: Vehicle) => {
      vehicleInfo.hide(vehicle);
    });


    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.time.paused) {
        this.time.paused = true;
        pauseButton.setText("Start");
        clock.pause();
      }
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.controller.update(delta);
    this.routeGraphics.update();
  }

  private addVehicle(vehicle): void {
    const container = this.add.container();
    container.setDepth(1);
    let vehicleSprite = new VehicleSprite(vehicle, this.eventDispatcher, container);
    vehicleSprite.create(this);
    this.controller.addVehicle(vehicle);
    this.routeGraphics.addVehicle(vehicleSprite);
  }

  private addChargingStation(power: number, distance: number, slots: number): void {
    let chargingStation = new ChargingStation();
    chargingStation.locationInMeters = distance;
    chargingStation.power = power;
    chargingStation.slots = slots;
    let csSprite = new ChargingStationSprite(chargingStation, this.eventDispatcher);
    csSprite.create(this);
    this.controller.addChargingStation(chargingStation);
    this.routeGraphics.renderChargingStation(csSprite);
  }

  private showChargingStationStats(chargingstation: ChargingStation) {
    this.chargingStationStats.show(chargingstation);
  }
}
