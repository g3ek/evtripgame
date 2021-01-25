import {Vehicle} from "./vehicle";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {VehicleFactory} from "./vehicle-factory";
import {Controller} from "./controller";
import {VehicleSprite} from "./vehicle-sprite";
import {RouteGraphics} from "./route-graphics";
import {Clock} from "./clock";
import {ChargingStationSelection} from "./charging-station-selection";
import {ChargingStation} from "./charging-station";
import {ChargingStationSprite} from "./charging-station-sprite";
import {GameButton} from "./game-button";
import {ChargingStationStats} from "./charging-station-stats";
import {VehicleInfo} from "./vehicle-info";
import {ChoseNumberComponent} from "./chose-number-component";
import {LevelScore} from "./level-score";
import {CommonStyle} from "./common-style";
import Text = Phaser.GameObjects.Text;

export class MainScene extends Phaser.Scene {

  private eventDispatcher: EvtripEventDispatcher = new EvtripEventDispatcher();
  private routeGraphics: RouteGraphics;
  private controller: Controller;
  private vehicleFactory: VehicleFactory;
  private chargingStationStats: ChargingStationStats;
  private scoreText: Text;
  private moneyText: Text;
  private levelText:Text;
  private levelScore: LevelScore;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
  }

  preload(): void {
    this.load.html("chargingstationselection", "assets/html/chargingstationselection.html");
    this.load.html("chargingstationstats", "assets/html/chargingstationtable.html");
    this.load.html("vehiclestats", "assets/html/vehiclestable.html");
  }

  create(): void {
    this.levelScore = new LevelScore(this.eventDispatcher);
    let clock = new Clock(this);
    clock.create();
    this.routeGraphics = new RouteGraphics(this, this.eventDispatcher, clock, this.levelScore.getLevel().distance);
    this.vehicleFactory = new VehicleFactory(clock, this, this.eventDispatcher, this.levelScore);
    this.controller = new Controller(this.routeGraphics, clock, this.eventDispatcher, this.levelScore);
    let timeFactorChooser = new ChoseNumberComponent([1, 5, 10, 15, 20, 25, 35, 40]);
    let timeChooserContainer = timeFactorChooser.create(this, 140, 'x', true);
    timeChooserContainer.setPosition(30, 80);
    timeFactorChooser.setAction(() => {
      let value = timeFactorChooser.getValue();
      clock.timeScale = value;
      this.vehicleFactory.updateNewCarTimerEvent(value);
    });
    this.levelText = this.add.text(30, 30, "Level: 1", CommonStyle.NORMAL_STYLE);
    this.moneyText = this.add.text(250, 30, "$: 0", CommonStyle.NORMAL_STYLE);
    this.scoreText = this.add.text(500, 30, "Score: 0", CommonStyle.NORMAL_STYLE);

    let chargingStationSelection = new ChargingStationSelection(this.eventDispatcher, this.levelScore);
    chargingStationSelection.create(this);
    this.chargingStationStats = new ChargingStationStats(this, this.routeGraphics, 30, 250, clock);
    let vehicleInfo = new VehicleInfo(this, this.routeGraphics, 70, 230);
    vehicleInfo.create();
    this.routeGraphics.render();
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
      this.levelScore.addToScore(5);
      this.scoreText.setText("Score: "+this.levelScore.score);
      this.levelScore.checkNextLevel();
      vehicleInfo.hide(vehicle);
    });
    this.eventDispatcher.on("nextlevel", () => {
      this.levelText.setText("Level: "+this.levelScore.level);
      chargingStationSelection.nextLevel();
      RouteGraphics.DISTANCE_METRES = this.levelScore.getLevel().distance;
      this.routeGraphics.nextLevel();
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
    this.moneyText.setText("$: "+Math.floor(this.levelScore.money));
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
    this.routeGraphics.addChargingStation(csSprite);
  }

  private showChargingStationStats(chargingstation: ChargingStation) {
    this.chargingStationStats.show(chargingstation);
  }
}
