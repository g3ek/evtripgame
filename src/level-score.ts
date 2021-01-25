import {Vehicle} from "./vehicle";
import {Level} from "./level";
import {Strategy} from "./charging-strategy";
import {EvtripEventDispatcher} from "./evtrip-event-dispatcher";

export class LevelScore {

  private _level: number = 1;
  private _score: number = 0;
  private _money: number = 20000;
  private _vehiclesScored: Vehicle[] = [];
  private _levels: Level[] = [];
  private _eventDispatcher: EvtripEventDispatcher;

  constructor(eventDispatcher: EvtripEventDispatcher) {
    this._eventDispatcher = eventDispatcher;
    const level1 = new Level(1, 2000000, 100000,
      [20000], 5, [Strategy.OPTIMAL]);
    const level2 = new Level(2, 1500000, 250000,
      [20000, 50000], 15, [Strategy.OPTIMAL, Strategy.OPPORTUNISTIC]);
    const level3 = new Level(3, 1000000, 500000,
      [20000, 50000, 75000], 30, [Strategy.OPTIMAL, Strategy.OPPORTUNISTIC]);
    const level4 = new Level(4, 1000000, 750000,
      [20000, 50000, 75000, 100000], 60, [Strategy.OPTIMAL, Strategy.OPPORTUNISTIC, Strategy.ANXIETY]);

    this._levels.push(level1, level2, level3);
  }

  getLevel(): Level {
    return this._levels[this._level-1];
  }

  set level(value: number) {
    this._level = value;
  }

  get level(): number {
    return this._level;
  }

  get score(): number {
    return this._score;
  }

  addToScore(value: number) {
    this._score += value;
  }

  get money(): number {
    return this._money;
  }

  addMoney(energy: number, power: number) {
    this._money += (energy * (power/20000));
  }

  buy(money: number) {
    this._money -= money;
  }

  get vehiclesScored(): Vehicle[] {
    return this._vehiclesScored;
  }

  addVehicleScored(vehicle: Vehicle) {
    this._vehiclesScored.push(vehicle);
  }

  checkNextLevel() {
    if (this.score >= this.getLevel().nextLevelScore) {
      this._level++;
      this._eventDispatcher.emit("nextlevel");
    }
  }
}
