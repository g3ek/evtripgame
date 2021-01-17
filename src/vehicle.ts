import {Observable, timer} from "rxjs";
import {map} from "rxjs/operators";
import {ChargingStation} from "./charging-station";
import {ChargingStrategy} from "./charging-strategy";

export enum Status {
  NEW,
  MOVING,
  STOPPED,
  CHARGING,
  DONE,
  WAITING
}


export class Vehicle {

  private _id: string;
  private _consumption: number;
  private _directionup: boolean;
  private _moving: boolean = true;
  private _mpsSpeed: number;
  private _status: Status;
  private _startTime: number = 0;
  private _startSOC: number;
  private _soc: number;
  private _capacity: number;
  private _startDistance: number = 0;
  private _distance: number = 0;
  private _observable: Observable<Vehicle>
  private _totalTime: number = 0;
  private _latestChargingStation: ChargingStation;
  private _waitTime: number = 0;
  private _totalWaitTime: number = 0;
  private _chargingStrategy: ChargingStrategy;
  private _throttleThreshold: number;
  private _previousTime: number;

  constructor() {
    this._observable = timer(0, 1000)
      .pipe(
        map(value => {
          return this;
        })
      );
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get status(): Status {
    return this._status;
  }

  set status(value: Status) {
    this._status = value;
  }

  get observable(): Observable<Vehicle> {
    return this._observable;
  }

  get consumption(): number {
    return this._consumption;
  }

  set consumption(value: number) {
    this._consumption = value;
  }

  get directionup(): boolean {
    return this._directionup;
  }

  set directionup(value: boolean) {
    this._directionup = value;
  }

  get moving(): boolean {
    return this._moving;
  }

  set moving(value: boolean) {
    this._moving = value;
  }

  get mpsSpeed(): number {
    return this._mpsSpeed;
  }

  set mpsSpeed(value: number) {
    this._mpsSpeed = value;
  }

  get startTime(): number {
    return this._startTime;
  }

  set startTime(value: number) {
    this._startTime = value;
  }

  get startSOC(): number {
    return this._startSOC;
  }

  set startSOC(value: number) {
    this._startSOC = value;
  }

  get capacity(): number {
    return this._capacity;
  }

  set capacity(value: number) {
    this._capacity = value;
  }

  get distance(): number {
    return this._distance;
  }

  set distance(value: number) {
    this._distance = value;
  }

  get soc(): number {
    return this._soc;
  }

  set soc(value: number) {
    this._soc = value;
  }

  get totalTime(): number {
    return this._totalTime;
  }

  set totalTime(value: number) {
    this._totalTime = value;
  }

  get startDistance(): number {
    return this._startDistance;
  }

  set startDistance(value: number) {
    this._startDistance = value;
  }

  get totalDistance() {
    return this.startDistance + this.distance;
  }

  get latestChargingStation(): ChargingStation {
    return this._latestChargingStation;
  }

  set latestChargingStation(value: ChargingStation) {
    this._latestChargingStation = value;
  }

  get waitTime(): number {
    return this._waitTime;
  }

  set waitTime(value: number) {
    this._waitTime = value;
  }

  get totalWaitTime(): number {
    return this._totalWaitTime;
  }

  set totalWaitTime(value: number) {
    this._totalWaitTime = value;
  }

  get chargingStrategy(): ChargingStrategy {
    return this._chargingStrategy;
  }

  set chargingStrategy(value: ChargingStrategy) {
    this._chargingStrategy = value;
  }

  get throttleThreshold(): number {
    return this._throttleThreshold;
  }

  set throttleThreshold(value: number) {
    this._throttleThreshold = value;
  }

  get previousTime(): number {
    return this._previousTime;
  }

  set previousTime(value: number) {
    this._previousTime = value;
  }

  getFormattedSoc(): number {
    const factor = this._capacity / 100;
    return Math.round((this._soc / factor) * 10) / 10;
  }

  getFormattedThreshold(): number {
    const factor = this._capacity / 100;
    return Math.round((this._throttleThreshold / factor) * 10) / 10;
  }

  getRange(): number {
    return Math.floor((this._soc / this._consumption)*10) / 10;
  }

  getFormattedConsumption(): number {
    return Math.round(this._consumption);
  }

  getPowerRelativeToSocAndLosses(power: number): number {
    if (this.soc >= this.throttleThreshold) {
      const limit = 3000;
      const range = this.capacity - this.throttleThreshold;
      const factor = 1 / range;
      const deltaSoc = range - (this.capacity - this.soc);
      const delta = deltaSoc * factor;
      // http://lets-gamedev.de/phasereasings/
      const deltaEased = Phaser.Math.Easing.Cubic.InOut(delta);
      let throttledPower = power * (1-deltaEased);
      if (throttledPower < 3000) { // minimum 3kW
        throttledPower = 3000;
      }
      return throttledPower;
    }
    return power;
  }
}
