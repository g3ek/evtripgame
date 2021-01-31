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
import {BigButton} from "./big-button";
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
  private levelScore: LevelScore = null;
  private clock: Clock;
  private vehicleInfo: VehicleInfo;
  private chargingStationSelection: ChargingStationSelection;
  private timeFactorChooser: ChoseNumberComponent;
  private pauseButton: GameButton;

  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super({
      key: "thegame"
    });
  }

  init(data: Object): void {
    if (this.levelScore !== null) {
      this.levelScore.reset();
      this.time.paused = false; // unpause, must do after restarting scene
    }
  }

  create(): void {
      this.eventDispatcher.destroy(); // very important to clean up the scene when restarting it!
      this.levelScore = new LevelScore(this.eventDispatcher);
      this.clock = new Clock(this);
      this.clock.create();
      this.routeGraphics = new RouteGraphics(this, this.eventDispatcher, this.clock, this.levelScore.getLevel().distance);
      this.routeGraphics.render();
      this.vehicleFactory = new VehicleFactory(this.clock, this, this.eventDispatcher, this.levelScore);
      this.controller = new Controller(this.routeGraphics, this.clock, this.eventDispatcher, this.levelScore);
      this.chargingStationStats = new ChargingStationStats(this, this.routeGraphics, this.clock);
      this.chargingStationStats.create(30, 250);
      this.vehicleInfo = new VehicleInfo(this, this.routeGraphics);
      this.vehicleInfo.create(70, 230);
      this.chargingStationSelection = new ChargingStationSelection(this.eventDispatcher, this.levelScore);
      this.chargingStationSelection.create(this);
      this.timeFactorChooser = new ChoseNumberComponent([1, 5, 10, 15, 20, 25, 35, 40]);
      let timeChooserContainer = this.timeFactorChooser.create(this, 140, 'x', true);
      timeChooserContainer.setPosition(30, 80);
      this.timeFactorChooser.setAction(() => {
        let value = this.timeFactorChooser.getValue();
        this.clock.timeScale = value;
        this.vehicleFactory.updateNewCarTimerEvent(value);
      });
      this.levelText = this.add.text(30, 30, "Level: 1", CommonStyle.NORMAL_STYLE);
      this.moneyText = this.add.text(250, 30, "$: 0", CommonStyle.NORMAL_STYLE);
      this.scoreText = this.add.text(500, 30, "Score: 0", CommonStyle.NORMAL_STYLE);
      const pauseContainer = this.add.container(30, 140);
      this.pauseButton = new GameButton();
      this.pauseButton.create(this, pauseContainer, "Pause", 150);
      this.pauseButton.setAction(() => {
        this.time.paused = !this.time.paused;
        if (this.time.paused) {
          this.tweens.pauseAll();
          this.pauseButton.setText("Start");
          this.clock.pause();
        } else {
          this.tweens.resumeAll();
          this.pauseButton.setText("Pause");
        }
      });
      const gameOverButton = new BigButton();
      gameOverButton.create(this, true);
      gameOverButton.visible(false);
      gameOverButton.setText("Game Over");
      gameOverButton.setAction(() => {
        this.scene.start("start");
      });
      const addStationContainer = this.add.container(190, 140);
      let addStationButton = new GameButton();
      addStationButton.create(this, addStationContainer, "Add", 100);
      addStationButton.setAction(() => {
        this.chargingStationSelection.show();
      });

      this.eventDispatcher.on("showvehiclestats", (vehicle: Vehicle) => {
        this.vehicleInfo.show(vehicle);
      });
      this.eventDispatcher.on("addchargingstation", (power: number, distance: number, slots: number) => {
        this.addChargingStation(power, distance, slots);
      });
      this.eventDispatcher.on("newvehicle", (vehicle: Vehicle) => {
        this.addVehicle(vehicle);
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
        this.vehicleInfo.hide(vehicle);
      });
      this.eventDispatcher.on("nextlevel", () => {
        this.levelText.setText("Level: "+this.levelScore.level);
        this.chargingStationSelection.nextLevel();
        RouteGraphics.DISTANCE_METRES = this.levelScore.getLevel().distance;
        this.routeGraphics.nextLevel();
      });
      this.eventDispatcher.on("gameover", () => {
        this.time.paused = true;
        this.tweens.pauseAll();
        this.clock.pause();
        this.chargingStationStats.stop();
        this.vehicleInfo.stop();
        gameOverButton.setText("Game Over");
        gameOverButton.visible(true);
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && !this.time.paused) {
          this.time.paused = true;
          this.pauseButton.setText("Start");
          this.clock.pause();
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
