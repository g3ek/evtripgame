import {Vehicle} from "./vehicle";

export class ChargingStation {

  private _power: number;
  private _locationInMeters: number;
  private _vehicles: Vehicle[] = [];
  private _slots: number;
  private _waiting: Vehicle[] = [];

  constructor() {
  }

  add(vehicle: Vehicle) {
    let index = this._vehicles.findIndex(v => v === null);
    this._vehicles[index] = vehicle;
  }

  remove(vehicle: Vehicle) {
    let index = this._vehicles.findIndex(v => v === vehicle);
    this._vehicles[index] = null;
  }

  addWaiting(vehicle: Vehicle) {
    this._waiting.push(vehicle);
  }

  get vehicles(): Vehicle[] {
    return this._vehicles;
  }

  removeWaiting(vehicle: Vehicle) {
    this._waiting = this._waiting.filter(v => v !== vehicle);
  }

  isOccupied(): boolean {
    return this._vehicles.every(v => v !== null);
  }

  isFull(): boolean {
    return (this._waiting.length + this._slots) === 20;
  }

  occupied(): number {
    return this._vehicles.filter(v => v !== null).length;
  }

  hasWaiting(): boolean {
    return this._waiting.length > 0;
  }

  get waiting(): Vehicle[] {
    return this._waiting;
  }

  get power(): number {
    return this._power;
  }

  set power(value: number) {
    this._power = value;
  }

  get locationInMeters(): number {
    return this._locationInMeters;
  }

  set locationInMeters(value: number) {
    this._locationInMeters = value;
  }

  get slots(): number {
    return this._slots;
  }

  set slots(value: number) {
    this._vehicles = new Array(value);
    for(let i=0; i < value; i++) {
      this._vehicles[i] = null;
    }
    this._slots = value;
  }
}
