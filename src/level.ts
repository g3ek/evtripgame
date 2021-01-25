import {Strategy} from "./charging-strategy";

export class Level {

  private _level: number;
  private _maxTimeNewVehicle: number;
  private _distance: number;
  private _capacities: number[];
  private _nextLevelScore: number;
  private _chargingStrategies: Strategy[];

  constructor(level: number,
              maxTimeNewVehicle: number,
              distance: number,
              capacities: number[],
              nextLevelScore: number,
              chargingStrategies: Strategy[]) {
    this._level = level;
    this._maxTimeNewVehicle = maxTimeNewVehicle;
    this._distance = distance;
    this._capacities = capacities;
    this._nextLevelScore = nextLevelScore;
    this._chargingStrategies = chargingStrategies;
  }

  get chargingStrategies(): Strategy[] {
    return this._chargingStrategies;
  }

  get level(): number {
    return this._level;
  }

  set level(value: number) {
    this._level = value;
  }

  get maxTimeNewVehicle(): number {
    return this._maxTimeNewVehicle;
  }

  set maxTimeNewVehicle(value: number) {
    this._maxTimeNewVehicle = value;
  }

  get distance(): number {
    return this._distance;
  }

  set distance(value: number) {
    this._distance = value;
  }

  get capacities(): number[] {
    return this._capacities;
  }

  set capacities(value: number[]) {
    this._capacities = value;
  }

  get nextLevelScore(): number {
    return this._nextLevelScore;
  }

  set nextLevelScore(value: number) {
    this._nextLevelScore = value;
  }
}
