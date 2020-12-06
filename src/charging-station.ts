export class ChargingStation {

  private _power: number;
  private _locationInMeters: number;

  constructor() {
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
