import {Observable, timer} from "rxjs";
import {map} from "rxjs/operators";

export enum Status {
  NEW,
  MOVING,
  STOPPED,
  CHARGING,
  DONE
}


export class Vehicle {

  private _consumption: number;
  private _directionup: boolean;
  private _moving: boolean = true;
  private _mpsSpeed: number;
  private _status: Status;
  private _startTime: number = Date.now();
  private _startSOC: number;
  private _soc: number;
  private _capacity: number;
  private _startDistance: number = 0;
  private _distance: number = 0;
  private _observable: Observable<Vehicle>
  private _totalTime: number = 0;

  constructor() {
    this._observable = timer(0, 1000)
      .pipe(
        map(value => {
          return this;
        })
      );
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
}
