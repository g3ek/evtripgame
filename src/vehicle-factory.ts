import {Status, Vehicle} from "./vehicle";
import {Clock} from "./clock";
import {Scene} from "phaser";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";
import {ChargingStrategyFactory} from "./charging-strategy-factory";
import {LevelScore} from "./level-score";

export class VehicleFactory {

  private static LETTERS: string = 'abcdefghijklmnopqrstuvwxyz';
  //private static readonly CAPACITIES: number[] = [20000, 41000, 64000, 75000, 100000];
  private static readonly CAPACITIES: number[] = [20000];
  private clock: Clock;
  private eventDispatcher: EvtripEventDispatcher;
  private newCarTimerEvent: Phaser.Time.TimerEvent;
  private levelScore: LevelScore;

  constructor(clock: Clock, scene: Phaser.Scene, eventDispatcher: EvtripEventDispatcher, levelScore: LevelScore) {
    this.clock = clock;
    this.eventDispatcher = eventDispatcher;
    this.levelScore = levelScore;
    this.createNewCarTimerEvent(scene);
  }

  updateNewCarTimerEvent(timeScale: number) {
    this.newCarTimerEvent.timeScale = timeScale;
  }

  create(): Vehicle {
    const kph = Phaser.Math.Between(90, 120);
    const mpsSpeed = kph / 3.6; // convert kph to mps
    let index = kph / 90;
    index = Math.pow(index, 2); // square 2 for air resistance
    let consumption = Phaser.Math.Between(150, 250);
    consumption *= index;
    const directionup = Math.random()*2 < 1;
    const status = Status.MOVING;
    const capacities = this.levelScore.getLevel().capacities;
    const capacity: number = capacities[Math.floor(Math.random()*capacities.length)];
    const startSOC = Phaser.Math.Between(10000, capacity); // minimum 10kWh soc
    const chargingStrategy = ChargingStrategyFactory.createRandomStrategy(this.levelScore.getLevel().chargingStrategies);
    const throttleAtSoC = Phaser.Math.Between(capacity*0.6, capacity*0.9); // throttle charging between 60% and 90%

    const vehicle = new Vehicle();
    vehicle.id = this.createUniqueID();
    vehicle.startSOC = startSOC;
    vehicle.soc = startSOC;
    vehicle.consumption = consumption;
    vehicle.capacity = capacity;
    vehicle.status = status;
    vehicle.mpsSpeed = mpsSpeed;
    vehicle.directionup = directionup;
    vehicle.startTime = this.clock.time;
    vehicle.chargingStrategy = chargingStrategy;
    vehicle.throttleThreshold = throttleAtSoC;
    return vehicle;
  }

  private createNewCarTimerEvent(scene: Scene) {
    let maxTimeNewVehicle = this.levelScore.getLevel().maxTimeNewVehicle;
    this.newCarTimerEvent = scene.time.addEvent({
      delay: Phaser.Math.Between(maxTimeNewVehicle/2, maxTimeNewVehicle),
      loop: true,
      callback: () => {
        let vehicle = this.create();
        this.eventDispatcher.emit('newvehicle', vehicle);
      },
      startAt: maxTimeNewVehicle
    });
  }

  private createUniqueID(): string {
    const size = 3;
    const lettersSize = VehicleFactory.LETTERS.length;
    const idArray = new Array(size);
    for(let i=0; i < size; i++) {
      const letter = VehicleFactory.LETTERS.charAt(Math.floor(Math.random()*lettersSize));
      idArray[i] = letter;
    }
    return idArray.join('');
  }
}
