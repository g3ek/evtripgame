import {Vehicle} from "./vehicle";

export class ChargingStation {

  private _power: number;
  private _locationInMeters: number;
  private _vehicles: Vehicle[] = [];

  constructor() {
  }

  add(vehicle: Vehicle) {
    this._vehicles.push(vehicle);
  }

  remove(vehicle: Vehicle) {
    this._vehicles = this._vehicles.filter(v => v !== vehicle);
  }

  get vehicles(): Vehicle[] {
    return this._vehicles;
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
}
