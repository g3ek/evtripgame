import {Observable, Subscriber, timer} from "rxjs";
import {map} from "rxjs/operators";

export enum Status {
  NEW,
  MOVING,
  STOPPED,
  CHARGING,
  DONE
}


export class Vehicle {

  private static readonly CAPACITIES: number[] = [20000, 41000, 64000, 75000, 100000];

  private consumption: number;
  private directionup: boolean;
  private moving: boolean = true;
  private mpsSpeed: number;
  private _status: Status;
  private startTime: number = Date.now();
  private soc: number;
  private capacity: number;
  distance: number = 0;
  private _observable: Observable<Vehicle>

  constructor() {
    let kph = Phaser.Math.Between(90, 120);
    this.mpsSpeed = kph / 3.6; // convert kph to mps
    let index = kph / 90;
    index = Math.pow(index, 2); // square 2 for air resistance
    this.consumption = (Phaser.Math.Between(150, 250));
    this.consumption = this.consumption * index;
    this.directionup = Math.random()*2 < 1;
    this._status = Status.NEW;
    let capacity: number = Vehicle.CAPACITIES[Math.floor(Math.random()*Vehicle.CAPACITIES.length)];
    this.soc = Phaser.Math.Between(10000, capacity); // minimum 10kWh soc

    this._observable = timer(0, 1000)
      .pipe(
        map(value => {
          return this;
        })
      );
  }

  public update(): void {
    if (this.moving) {
      const delta = (Date.now() - this.startTime) * 16;
      this.distance = (delta/1000) * this.mpsSpeed;
      let wattHoursPerMeter = this.consumption * this.distance;
      let newSoc = this.soc - wattHoursPerMeter;
    }
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
}
